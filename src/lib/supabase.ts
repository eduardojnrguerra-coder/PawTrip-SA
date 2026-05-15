import type { PendingOrder } from '@/lib/cart';
import { getSupabaseAnonKey, getSupabaseServiceRoleKey, getSupabaseUrl } from '@/lib/supabase/config';

export type SupabaseOrder = {
  id: string;
  order_reference: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: Record<string, unknown>;
  items: Array<Record<string, unknown>>;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  fulfillment_status: string;
  payfast_payment_id: string | null;
  order_items?: Array<{
    id: string;
    order_id: string;
    product_id: string | null;
    product_title: string;
    product_slug: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
  created_at: string;
  updated_at: string;
};

type SupabaseOrderInsert = Omit<SupabaseOrder, 'id' | 'created_at' | 'updated_at' | 'payfast_payment_id'> & {
  payfast_payment_id?: string | null;
};

type SupabaseOrderUpdate = Partial<
  Pick<SupabaseOrder, 'payment_status' | 'fulfillment_status' | 'payfast_payment_id' | 'updated_at'>
>;

function getSupabaseServerConfig() {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  if (!url || !serviceRoleKey) return null;

  return {
    url,
    serviceRoleKey,
  };
}

export function getSupabaseClientConfig() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) return null;

  return {
    url,
    anonKey,
  };
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseServerConfig());
}

async function supabaseRequest<T>(path: string, init?: RequestInit) {
  const config = getSupabaseServerConfig();
  if (!config) return { data: null, error: null, configured: false } as const;

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: config.serviceRoleKey,
      Authorization: `Bearer ${config.serviceRoleKey}`,
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    const message = await response.text();
    return { data: null, error: message || response.statusText, configured: true } as const;
  }

  if (response.status === 204) return { data: null, error: null, configured: true } as const;

  return { data: (await response.json()) as T, error: null, configured: true } as const;
}

export function buildSupabaseOrderInsert(
  order: PendingOrder,
  detailedItems: Array<{
    productSlug: string;
    quantity: number;
    product: { name: string; price: number; category: string };
    lineTotal: number;
  }>,
): SupabaseOrderInsert {
  return {
    order_reference: order.orderReference,
    customer_name: order.customer.name,
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    delivery_address: {
      address: order.customer.address,
      suburb: order.customer.suburb,
      city: order.customer.city,
      province: order.customer.province,
      postalCode: order.customer.postalCode,
      deliveryNotes: order.customer.deliveryNotes ?? '',
    },
    items: detailedItems.map((item) => ({
      productSlug: item.productSlug,
      name: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      unitPrice: item.product.price,
      lineTotal: item.lineTotal,
    })),
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    payment_status: 'pending',
    fulfillment_status: 'unfulfilled',
    payfast_payment_id: null,
  };
}

export async function createSupabaseOrder(
  order: PendingOrder,
  detailedItems: Parameters<typeof buildSupabaseOrderInsert>[1],
) {
  const payload = buildSupabaseOrderInsert(order, detailedItems);
  const orderInsert = await supabaseRequest<SupabaseOrder[]>('orders', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!orderInsert.data?.[0] || orderInsert.error || !orderInsert.configured) return orderInsert;

  const orderId = orderInsert.data[0].id;
  const orderItems = detailedItems.map((item) => ({
    order_id: orderId,
    product_id: null,
    product_title: item.product.name,
    product_slug: item.productSlug,
    quantity: item.quantity,
    unit_price: item.product.price,
    line_total: item.lineTotal,
  }));

  const itemsInsert = await supabaseRequest<Array<Record<string, unknown>>>('order_items', {
    method: 'POST',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify(orderItems),
  });

  if (itemsInsert.error) {
    return {
      data: orderInsert.data,
      error: itemsInsert.error,
      configured: true,
    };
  }

  return orderInsert;
}

export async function getSupabaseOrderByReference(orderReference: string) {
  const query = new URLSearchParams({
    order_reference: `eq.${orderReference}`,
    select: '*',
    limit: '1',
  });
  const result = await supabaseRequest<SupabaseOrder[]>(`orders?${query.toString()}`);

  return {
    ...result,
    data: result.data?.[0] ?? null,
  };
}

export async function listSupabaseOrders() {
  const query = new URLSearchParams({
    select: '*,order_items(*)',
    order: 'created_at.desc',
    limit: '100',
  });

  return supabaseRequest<SupabaseOrder[]>(`orders?${query.toString()}`);
}

export async function updateSupabaseOrderByReference(orderReference: string, update: SupabaseOrderUpdate) {
  const query = new URLSearchParams({
    order_reference: `eq.${orderReference}`,
  });

  return supabaseRequest<SupabaseOrder[]>(`orders?${query.toString()}`, {
    method: 'PATCH',
    headers: {
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      ...update,
      updated_at: new Date().toISOString(),
    }),
  });
}
