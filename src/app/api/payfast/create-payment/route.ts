import { NextResponse } from 'next/server';
import { calculateCartTotals, cartItemKey, type CartItem, type PendingOrder } from '@/lib/cart';
import { createPayFastPayment, generateOrderReference } from '@/lib/payfast';
import { createSupabaseOrder } from '@/lib/supabase';
import { getPublicProducts } from '@/lib/storefront';

type CustomerInput = PendingOrder['customer'];

type CreatePaymentRequest = {
  customer?: Partial<CustomerInput>;
  items?: Array<Partial<CartItem>>;
};

const requiredCustomerFields: Array<keyof CustomerInput> = [
  'name',
  'email',
  'phone',
  'address',
  'suburb',
  'city',
  'province',
  'postalCode',
];

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function validateCustomer(customer: CreatePaymentRequest['customer']) {
  if (!customer) return null;

  const cleaned: CustomerInput = {
    name: cleanString(customer.name),
    email: cleanString(customer.email).toLowerCase(),
    phone: cleanString(customer.phone),
    address: cleanString(customer.address),
    suburb: cleanString(customer.suburb),
    city: cleanString(customer.city),
    province: cleanString(customer.province),
    postalCode: cleanString(customer.postalCode),
    deliveryNotes: cleanString(customer.deliveryNotes),
  };

  for (const field of requiredCustomerFields) {
    if (!cleaned[field]) return null;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned.email)) return null;
  return cleaned;
}

function validateCartItems(items: CreatePaymentRequest['items'], products: Awaited<ReturnType<typeof getPublicProducts>>) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const merged = new Map<string, CartItem>();
  const productBySlug = new Map(products.map((product) => [product.slug, product]));

  for (const item of items) {
    const productSlug = cleanString(item.productSlug);
    const variantId = cleanString(item.variantId) || null;
    const customOptions =
      item.customOptions && typeof item.customOptions === 'object' && !Array.isArray(item.customOptions)
        ? Object.fromEntries(
            Object.entries(item.customOptions)
              .map(([key, value]) => [cleanString(key), cleanString(value)])
              .filter(([key, value]) => key && value),
          )
        : {};
    const quantity = Number(item.quantity);
    const product = productBySlug.get(productSlug);

    if (!productSlug || !product) return null;
    if (variantId && !product.variants?.some((variant) => variant.id === variantId && variant.active && variant.stockQuantity > 0)) return null;
    for (const option of product.customOptions?.filter((entry) => entry.active) ?? []) {
      const value = customOptions[option.label] ?? '';
      if (option.required && !value) return null;
      if (option.maxLength && value.length > option.maxLength) return null;
      if (option.inputType === 'select' && value && option.choices?.length && !option.choices.includes(value)) return null;
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;

    const key = cartItemKey({ productSlug, variantId, customOptions });
    const currentQuantity = merged.get(key)?.quantity ?? 0;
    const nextQuantity = currentQuantity + quantity;
    if (nextQuantity > 20) return null;
    merged.set(key, { productSlug, variantId, customOptions, quantity: nextQuantity });
  }

  for (const item of merged.values()) {
    const product = productBySlug.get(item.productSlug);
    if (!product) return null;
    const variant = item.variantId ? product.variants?.find((entry) => entry.id === item.variantId && entry.active) : null;
    const availableStock = variant ? variant.stockQuantity : product.stockQuantity;
    if (typeof availableStock === 'number' && availableStock <= 0) return null;
    if (typeof availableStock === 'number' && item.quantity > availableStock) return null;
  }

  return Array.from(merged.values());
}

export async function POST(request: Request) {
  let body: CreatePaymentRequest;

  try {
    body = (await request.json()) as CreatePaymentRequest;
  } catch {
    return badRequest('Invalid JSON payload.');
  }

  const customer = validateCustomer(body.customer);
  if (!customer) return badRequest('Missing or invalid customer details.');

  const products = await getPublicProducts();
  const items = validateCartItems(body.items, products);
  if (!items) return badRequest('Missing or invalid cart items.');

  const totals = calculateCartTotals(items, products);
  if (totals.items.length === 0 || totals.total <= 0) return badRequest('Cart cannot be empty.');

  const orderReference = generateOrderReference();
  const pendingOrder: PendingOrder = {
    orderReference,
    customer,
    items,
    subtotal: totals.subtotal,
    deliveryFee: totals.deliveryFee,
    total: totals.total,
    createdAt: new Date().toISOString(),
  };

  try {
    const storedOrder = await createSupabaseOrder(pendingOrder, totals.items);
    if (!storedOrder.configured || storedOrder.error) {
      console.error('Supabase order creation failed', {
        orderReference,
        reason: storedOrder.error || 'Supabase is not configured',
      });

      return NextResponse.json({ error: 'Order could not be stored. Please try again or contact PawTrip SA support.' }, { status: 500 });
    }

    const payment = createPayFastPayment({
      amount: totals.total,
      orderReference,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      itemDescription: `${totals.items.length} item(s) from PawTrip SA`,
    });

    return NextResponse.json({
      payment,
      order: pendingOrder,
      storage: 'supabase',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.toLowerCase().includes('merchant credentials')) {
      return NextResponse.json(
        { error: 'Online payment is not configured yet. Please contact PawTrip SA support before placing this order.' },
        { status: 503 },
      );
    }

    console.error('PayFast payment creation failed', {
      orderReference,
      reason: message || 'Unknown error',
    });

    return NextResponse.json({ error: 'Payment could not be prepared. Please contact PawTrip SA support.' }, { status: 500 });
  }
}
