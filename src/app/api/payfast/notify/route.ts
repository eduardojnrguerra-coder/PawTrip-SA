import { NextResponse } from 'next/server';
import { getOptionalPayFastConfig, getPayFastSignatureValidation, validatePayFastItnWithGateway } from '@/lib/payfast';
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

function payFastResponse(status: number, reason: string) {
  return NextResponse.json({ received: status < 400, reason }, { status });
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
    return payFastResponse(400, 'unreadable form payload');
  }

  const orderReference = fields.m_payment_id || fields.custom_str1 || '';
  const payfastPaymentId = fields.pf_payment_id || '';
  const paymentStatus = fields.payment_status || 'UNKNOWN';
  const amountGross = fields.amount_gross || fields.amount || '';
  let orderUpdated = false;

  console.info('PayFast notify received', {
    paymentStatus,
    mPaymentId: fields.m_payment_id || 'not provided',
    pfPaymentId: payfastPaymentId || 'not provided',
    orderReference: orderReference || 'unknown',
    amountGross: amountGross || 'not provided',
  });

  const acknowledge = (reason: string, status = 200) => {
    console.info('PayFast ITN acknowledged', {
      paymentStatus,
      mPaymentId: fields.m_payment_id || 'not provided',
      pfPaymentId: payfastPaymentId || 'not provided',
      orderReference: orderReference || 'unknown',
      amountGross: amountGross || 'not provided',
      orderUpdated,
      reason,
    });
    return payFastResponse(status, reason);
  };

  const config = getOptionalPayFastConfig();
  if (!config) {
    console.info('PayFast ITN skipped because PayFast credentials are not configured', {
      orderReference: orderReference || 'unknown',
      paymentStatus,
    });
    return acknowledge('PayFast credentials are not configured', 500);
  }

  if (fields.merchant_id && fields.merchant_id !== config.merchantId) {
    console.warn('PayFast ITN merchant mismatch', { orderReference: orderReference || 'unknown' });
    return acknowledge('merchant mismatch', 400);
  }

  if (fields.merchant_key && fields.merchant_key !== config.merchantKey) {
    console.warn('PayFast ITN merchant key mismatch', { orderReference: orderReference || 'unknown' });
    return acknowledge('merchant key mismatch', 400);
  }

  const signatureValidation = getPayFastSignatureValidation(fields, config.passphrase);
  console.info('PayFast ITN signature validation result', {
    orderReference: orderReference || 'unknown',
    valid: signatureValidation.valid,
    method: signatureValidation.method,
  });

  if (!signatureValidation.valid) {
    console.warn('PayFast ITN signature rejected', {
      orderReference: orderReference || 'unknown',
      method: signatureValidation.method,
    });
    return acknowledge('signature rejected', 400);
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
  console.info('PayFast ITN gateway validation result', {
    orderReference: orderReference || 'unknown',
    valid: gatewayValid,
  });

  if (!gatewayValid) {
    return acknowledge('gateway validation failed', 400);
  }

  if (!orderReference) {
    console.warn('PayFast ITN missing order reference');
    return acknowledge('missing order reference', 400);
  }

  const orderResult = await getSupabaseOrderByReference(orderReference);
  console.info('PayFast ITN order lookup result', {
    orderReference,
    configured: orderResult.configured,
    found: Boolean(orderResult.data),
    error: orderResult.error ? 'present' : 'none',
  });

  if (!orderResult.configured) {
    console.info('PayFast ITN verified, but Supabase is not configured', {
      orderReference,
      paymentStatus,
      amountGross,
    });
    return acknowledge('Supabase is not configured', 500);
  }

  if (orderResult.error || !orderResult.data) {
    console.warn('PayFast ITN order lookup failed', {
      orderReference,
      reason: orderResult.error ?? 'Order not found',
    });
    return acknowledge('order lookup failed', 404);
  }

  const expectedAmount = toCents(orderResult.data.total);
  const receivedAmount = toCents(amountGross);
  const amountValid = receivedAmount === expectedAmount;
  console.info('PayFast ITN amount validation result', {
    orderReference,
    valid: amountValid,
    expectedCents: expectedAmount,
    receivedCents: receivedAmount,
  });

  if (!amountValid) {
    console.warn('PayFast ITN amount mismatch', {
      orderReference,
      expected: orderResult.data.total,
      received: amountGross,
    });
    return acknowledge('amount mismatch', 400);
  }

  if (orderResult.data.payment_status === 'paid') {
    console.info('PayFast ITN duplicate received for already paid order', {
      orderReference,
      paymentStatus: orderResult.data.payment_status,
      payfastPaymentId: orderResult.data.payfast_payment_id || payfastPaymentId || 'not provided',
    });
    orderUpdated = false;
    return acknowledge('order already paid');
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
    return acknowledge('order update failed', 500);
  } else {
    orderUpdated = Boolean(updateResult.data?.length);
    console.info('PayFast ITN processed', {
      orderReference,
      paymentStatus: 'paid',
      amountGross,
      orderUpdated,
      payfastPaymentId: payfastPaymentId || 'not provided',
    });
  }

  return acknowledge(orderUpdated ? 'order updated' : 'order update returned no rows', orderUpdated ? 200 : 500);
}
