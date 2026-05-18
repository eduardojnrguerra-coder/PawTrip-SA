import crypto from 'crypto';
import { getSiteUrl } from '@/lib/site';

export type PayFastMode = 'sandbox' | 'production';

export type PayFastPaymentInput = {
  amount: number;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  itemDescription?: string;
};

export type PayFastPaymentPayload = {
  url: string;
  fields: Record<string, string>;
  mode: PayFastMode;
};

const PAYFAST_URLS: Record<PayFastMode, string> = {
  sandbox: 'https://sandbox.payfast.co.za/eng/process',
  production: 'https://www.payfast.co.za/eng/process',
};

const PAYFAST_VALIDATE_URLS: Record<PayFastMode, string> = {
  sandbox: 'https://sandbox.payfast.co.za/eng/query/validate',
  production: 'https://www.payfast.co.za/eng/query/validate',
};

const SIGNATURE_FIELD_ORDER = [
  'merchant_id',
  'merchant_key',
  'return_url',
  'cancel_url',
  'notify_url',
  'name_first',
  'name_last',
  'email_address',
  'cell_number',
  'm_payment_id',
  'amount',
  'item_name',
  'item_description',
  'custom_str1',
  'custom_str2',
  'custom_str3',
  'custom_str4',
  'custom_str5',
];

let payFastSignatureDebugLogged = false;

function encodePayFastValue(value: string) {
  return encodeURIComponent(value.trim())
    .replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

function sanitizePayFastText(value: string, fallback = '') {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^\w\s@.+-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

function sanitizePayFastName(value: string, fallback = '') {
  const cleaned = value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9 -]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || fallback;
}

function sanitizePayFastEmail(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9@._+-]/g, '')
    .trim()
    .toLowerCase();
}

function orderedPayFastFields(fields: Record<string, string>) {
  const output: Record<string, string> = {};
  const used = new Set<string>();

  for (const key of SIGNATURE_FIELD_ORDER) {
    const value = fields[key];
    if (value) {
      output[key] = value.trim();
      used.add(key);
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (!used.has(key) && value) output[key] = value.trim();
  }

  return output;
}

export function formatPayFastAmount(amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('PayFast amount must be a positive number.');
  }
  return amount.toFixed(2);
}

export function generateOrderReference() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `PTSA-${date}-${random}`;
}

export function getPayFastConfig() {
  const config = getOptionalPayFastConfig();

  if (!config) {
    throw new Error('PayFast merchant credentials are missing.');
  }

  return config;
}

export function getOptionalPayFastConfig() {
  const sandboxFlag = process.env.PAYFAST_SANDBOX?.trim().toLowerCase();
  const legacyMode = process.env.PAYFAST_MODE?.trim().toLowerCase();
  const sandbox =
    sandboxFlag === 'true' ||
    sandboxFlag === '1' ||
    sandboxFlag === 'yes' ||
    (!sandboxFlag && legacyMode !== 'production');
  const mode: PayFastMode = sandbox ? 'sandbox' : 'production';
  const merchantId = process.env.PAYFAST_MERCHANT_ID?.trim() ?? '';
  const merchantKey = process.env.PAYFAST_MERCHANT_KEY?.trim() ?? '';
  const passphrase = process.env.PAYFAST_PASSPHRASE?.trim() ?? '';

  if (!merchantId || !merchantKey) {
    return null;
  }

  return {
    mode,
    url: PAYFAST_URLS[mode],
    validateUrl: PAYFAST_VALIDATE_URLS[mode],
    merchantId,
    merchantKey,
    passphrase,
    siteUrl: getSiteUrl(),
  };
}

export function generatePayFastSignature(fields: Record<string, string>, passphrase?: string) {
  const orderedFields = orderedPayFastFields(fields);
  const signatureFieldEntries = Object.entries(orderedFields)
    .filter(([key, value]) => key !== 'signature' && value !== '');
  const signatureSource = signatureFieldEntries
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join('&');
  const hasPassphrase = Boolean(passphrase?.trim());
  const sourceWithPassphrase = hasPassphrase
    ? `${signatureSource}&passphrase=${encodePayFastValue(passphrase ?? '')}`
    : signatureSource;

  return crypto.createHash('md5').update(sourceWithPassphrase).digest('hex');
}

function buildPayFastSignatureDebug(fields: Record<string, string>, passphrase?: string) {
  const orderedFields = orderedPayFastFields(fields);
  const signatureFieldEntries = Object.entries(orderedFields)
    .filter(([key, value]) => key !== 'signature' && value !== '');
  const rawSignatureString = signatureFieldEntries
    .map(([key, value]) => `${key}=${encodePayFastValue(value)}`)
    .join('&');
  const hasPassphrase = Boolean(passphrase?.trim());
  const rawWithPassphrase = hasPassphrase ? `${rawSignatureString}&passphrase=${encodePayFastValue(passphrase ?? '')}` : rawSignatureString;

  return {
    fieldKeys: signatureFieldEntries.map(([key]) => key),
    rawSignatureString: rawWithPassphrase,
    redactedRawSignatureString: rawWithPassphrase
      .replace(/merchant_key=[^&]*/i, 'merchant_key=[redacted]')
      .replace(/passphrase=[^&]*/i, 'passphrase=[redacted]'),
    passphraseIncluded: hasPassphrase,
    signature: crypto.createHash('md5').update(rawWithPassphrase).digest('hex'),
  };
}

function debugPayFastSignature(fields: Record<string, string>, passphrase?: string) {
  if (payFastSignatureDebugLogged) return;
  payFastSignatureDebugLogged = true;
  const debug = buildPayFastSignatureDebug(fields, passphrase);
  const redactedSubmittedFields = {
    ...fields,
    merchant_key: '[redacted]',
  };

  console.warn('TEMP PayFast signature debug remove after testing', {
    merchant_id: fields.merchant_id,
    amount: fields.amount,
    item_name: fields.item_name,
    item_description: fields.item_description,
    signatureFields: debug.fieldKeys,
    submittedFieldKeys: [...debug.fieldKeys, 'signature'],
    submittedFields: redactedSubmittedFields,
    passphraseIncluded: debug.passphraseIncluded,
    rawSignatureStringBeforeHashing: debug.redactedRawSignatureString,
    generatedSignature: debug.signature,
  });
}

export function isPayFastSignatureValid(fields: Record<string, string>, passphrase?: string) {
  const suppliedSignature = fields.signature;
  if (!suppliedSignature) return false;

  const expectedSignature = generatePayFastSignature(fields, passphrase);
  const supplied = Buffer.from(suppliedSignature, 'hex');
  const expected = Buffer.from(expectedSignature, 'hex');

  if (supplied.length !== expected.length) return false;
  return crypto.timingSafeEqual(supplied, expected);
}

export async function validatePayFastItnWithGateway(fields: Record<string, string>, mode: PayFastMode) {
  const params = new URLSearchParams();
  params.append('cmd', '_notify-validate');

  for (const [key, value] of Object.entries(fields)) {
    if (value) params.append(key, value);
  }

  const response = await fetch(PAYFAST_VALIDATE_URLS[mode], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
    cache: 'no-store',
  });

  const result = (await response.text()).trim();
  return response.ok && result === 'VALID';
}

export function createPayFastPayment(input: PayFastPaymentInput): PayFastPaymentPayload {
  const config = getPayFastConfig();
  const [firstName, ...remainingName] = sanitizePayFastName(input.customerName, 'PawTrip customer').split(/\s+/);
  const lastName = remainingName.join(' ');
  const siteUrl = config.siteUrl.replace(/\/$/, '');

  // Credentials must be set in .env.local and Vercel env vars only.
  // PAYFAST_PASSPHRASE is used only on the server to create the signature.
  const baseFields = orderedPayFastFields({
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: `${siteUrl}/checkout/success?order_ref=${encodeURIComponent(input.orderReference)}`,
    cancel_url: `${siteUrl}/checkout/cancel?order_ref=${encodeURIComponent(input.orderReference)}`,
    notify_url: `${siteUrl}/api/payfast/notify`,
    name_first: sanitizePayFastName(firstName || input.customerName, 'PawTrip'),
    name_last: sanitizePayFastName(lastName || 'Customer'),
    email_address: sanitizePayFastEmail(input.customerEmail),
    cell_number: sanitizePayFastText(input.customerPhone ?? ''),
    m_payment_id: input.orderReference,
    amount: formatPayFastAmount(input.amount),
    item_name: 'PawTrip SA Order',
    item_description: 'PawTrip SA order',
    custom_str1: input.orderReference,
  });
  const signature = generatePayFastSignature(baseFields, config.passphrase);
  debugPayFastSignature(baseFields, config.passphrase);

  return {
    url: config.url,
    fields: {
      ...baseFields,
      signature,
    },
    mode: config.mode,
  };
}
