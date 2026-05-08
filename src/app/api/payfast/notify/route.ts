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
    console.info('PayFast ITN received with unreadable form payload');
    return NextResponse.json({ received: true });
  }

  const orderReference = fields.m_payment_id || fields.custom_str1 || '';
  const payfastPaymentId = fields.pf_payment_id || '';
  const paymentStatus = fields.payment_status || 'UNKNOWN';
  const amountGross = fields.amount_gross || fields.amount || '';

  const config = getOptionalPayFastConfig();
  if (!config) {
    console.info('PayFast ITN skipped because PayFast credentials are not configured', {
      orderReference: orderReference || 'unknown',
      paymentStatus,
    });
    return NextResponse.json({ received: true });
  }

  if (fields.merchant_id && fields.merchant_id !== config.merchantId) {
    console.warn('PayFast ITN merchant mismatch', { orderReference: orderReference || 'unknown' });
    return NextResponse.json({ received: true });
  }

  if (!isPayFastSignatureValid(fields, config.passphrase)) {
    console.warn('PayFast ITN signature rejected', { orderReference: orderReference || 'unknown' });
    return NextResponse.json({ received: true });
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
    return NextResponse.json({ received: true });
  }

  if (!orderReference) {
    console.warn('PayFast ITN missing order reference');
    return NextResponse.json({ received: true });
  }

  const orderResult = await getSupabaseOrderByReference(orderReference);
  if (!orderResult.configured) {
    console.info('PayFast ITN verified, but Supabase is not configured', {
      orderReference,
      paymentStatus,
      amountGross,
    });
    return NextResponse.json({ received: true });
  }

  if (orderResult.error || !orderResult.data) {
    console.warn('PayFast ITN order lookup failed', {
      orderReference,
      reason: orderResult.error ?? 'Order not found',
    });
    return NextResponse.json({ received: true });
  }

  if (toCents(amountGross) !== toCents(orderResult.data.total)) {
    console.warn('PayFast ITN amount mismatch', {
      orderReference,
      expected: orderResult.data.total,
      received: amountGross,
    });
    return NextResponse.json({ received: true });
  }

  const normalizedStatus = paymentStatus.toUpperCase() === 'COMPLETE' ? 'paid' : paymentStatus.toLowerCase();
  const updateResult = await updateSupabaseOrderByReference(orderReference, {
    payment_status: normalizedStatus,
    payfast_payment_id: payfastPaymentId || null,
  });

  if (updateResult.error) {
    console.error('PayFast ITN order update failed', {
      orderReference,
      reason: updateResult.error,
    });
  } else {
    console.info('PayFast ITN processed', {
      orderReference,
      paymentStatus: normalizedStatus,
      payfastPaymentId: payfastPaymentId || 'not provided',
    });
  }

  return NextResponse.json({ received: true });
}
