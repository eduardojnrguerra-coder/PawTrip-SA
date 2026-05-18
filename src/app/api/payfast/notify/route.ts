import { NextResponse } from 'next/server';
import { getOptionalPayFastConfig, isPayFastSignatureValid, validatePayFastItnWithGateway } from '@/lib/payfast';
import { getSupabaseOrderByReference, updateSupabaseOrderByReference } from '@/lib/supabase';

function formDataToRecord(formData: FormData) {
  const fields: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === 'string') fields[key] = value.trim();
  }

  return fields;
}

function toCents(value: string | number | null | undefined) {
  const numeric = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

export async function POST(request: Request) {
  // PayFast ITN notes:
  // - The notify URL must return 200 and must not redirect.
  // - This route validates the PayFast signature, posts the payload back to PayFast's
  //   validation endpoint, confirms the amount, then updates the Supabase order.
  // - The service role key and PayFast passphrase are never returned to the browser.
  let fields: Record<string, string>;

  try {
    fields = formDataToRecord(await request.formData());
  } catch {
    console.info('PayFast ITN received with unreadable form payload', { orderUpdated: false });
    return NextResponse.json({ received: true });
  }

  const orderReference = fields.m_payment_id || fields.custom_str1 || '';
  const payfastPaymentId = fields.pf_payment_id || '';
  const paymentStatus = fields.payment_status || 'UNKNOWN';
  const amountGross = fields.amount_gross || fields.amount || '';
  let orderUpdated = false;

  console.info('PayFast ITN notify route hit', {
    paymentStatus,
    orderReference: orderReference || 'unknown',
    amountGross: amountGross || 'not provided',
  });

  const acknowledge = (reason: string) => {
    console.info('PayFast ITN acknowledged', {
      paymentStatus,
      orderReference: orderReference || 'unknown',
      amountGross: amountGross || 'not provided',
      orderUpdated,
      reason,
    });
    return NextResponse.json({ received: true });
  };

  const config = getOptionalPayFastConfig();
  if (!config) {
    console.info('PayFast ITN skipped because PayFast credentials are not configured', {
      orderReference: orderReference || 'unknown',
      paymentStatus,
    });
    return acknowledge('PayFast credentials are not configured');
  }

  if (fields.merchant_id && fields.merchant_id !== config.merchantId) {
    console.warn('PayFast ITN merchant mismatch', { orderReference: orderReference || 'unknown' });
    return acknowledge('merchant mismatch');
  }

  if (fields.merchant_key && fields.merchant_key !== config.merchantKey) {
    console.warn('PayFast ITN merchant key mismatch', { orderReference: orderReference || 'unknown' });
    return acknowledge('merchant key mismatch');
  }

  if (!isPayFastSignatureValid(fields, config.passphrase)) {
    console.warn('PayFast ITN signature rejected', { orderReference: orderReference || 'unknown' });
    return acknowledge('signature rejected');
  }

  let gatewayValid = false;
  try {
    gatewayValid = await validatePayFastItnWithGateway(fields, config.mode);
  } catch (error) {
    console.warn('PayFast ITN gateway validation failed', {
      orderReference: orderReference || 'unknown',
      reason: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  if (!gatewayValid) {
    return acknowledge('gateway validation failed');
  }

  if (!orderReference) {
    console.warn('PayFast ITN missing order reference');
    return acknowledge('missing order reference');
  }

  const orderResult = await getSupabaseOrderByReference(orderReference);
  if (!orderResult.configured) {
    console.info('PayFast ITN verified, but Supabase is not configured', {
      orderReference,
      paymentStatus,
      amountGross,
    });
    return acknowledge('Supabase is not configured');
  }

  if (orderResult.error || !orderResult.data) {
    console.warn('PayFast ITN order lookup failed', {
      orderReference,
      reason: orderResult.error ?? 'Order not found',
    });
    return acknowledge('order lookup failed');
  }

  if (toCents(amountGross) !== toCents(orderResult.data.total)) {
    console.warn('PayFast ITN amount mismatch', {
      orderReference,
      expected: orderResult.data.total,
      received: amountGross,
    });
    return acknowledge('amount mismatch');
  }

  if (paymentStatus.toUpperCase() !== 'COMPLETE') {
    console.info('PayFast ITN verified but payment is not complete; leaving order pending', {
      orderReference,
      paymentStatus,
      payfastPaymentId: payfastPaymentId || 'not provided',
    });
    return acknowledge('payment status is not complete');
  }

  const updateResult = await updateSupabaseOrderByReference(orderReference, {
    payment_status: 'paid',
    payfast_payment_id: payfastPaymentId || null,
  });

  if (updateResult.error) {
    console.error('PayFast ITN order update failed', {
      orderReference,
      reason: updateResult.error,
    });
  } else {
    orderUpdated = true;
    console.info('PayFast ITN processed', {
      orderReference,
      paymentStatus: 'paid',
      amountGross,
      orderUpdated,
      payfastPaymentId: payfastPaymentId || 'not provided',
    });
  }

  return acknowledge(updateResult.error ? 'order update failed' : 'order updated');
}
