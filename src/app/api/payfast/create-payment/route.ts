import { NextResponse } from 'next/server';
import { calculateCartTotals, type CartItem, type PendingOrder } from '@/lib/cart';
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

function validateCartItems(items: CreatePaymentRequest['items'], productSlugs: Set<string>) {
  if (!Array.isArray(items) || items.length === 0) return null;

  const merged = new Map<string, number>();

  for (const item of items) {
    const productSlug = cleanString(item.productSlug);
    const quantity = Number(item.quantity);

    if (!productSlug || !productSlugs.has(productSlug)) return null;
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) return null;

    const nextQuantity = (merged.get(productSlug) ?? 0) + quantity;
    if (nextQuantity > 20) return null;
    merged.set(productSlug, nextQuantity);
  }

  return Array.from(merged.entries()).map(([productSlug, quantity]) => ({ productSlug, quantity }));
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
  const items = validateCartItems(body.items, new Set(products.map((product) => product.slug)));
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
