import { calculateDeliveryFee } from '@/lib/money';
import type { Product, ProductVariant } from '@/data/products';

export type CartCustomOptions = Record<string, string>;

export type CartItem = {
  productSlug: string;
  variantId?: string | null;
  customOptions?: CartCustomOptions;
  quantity: number;
};

export type PendingOrder = {
  orderReference: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
    deliveryNotes?: string;
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: string;
};

export const CART_STORAGE_KEY = 'pawtrip-cart';
export const PENDING_ORDER_KEY = 'pawtrip-pending-order';

export function getCartItemCount(items: CartItem[]) {
  return items.reduce((total, item) => total + item.quantity, 0);
}

function customOptionsKey(customOptions?: CartCustomOptions) {
  if (!customOptions) return '';
  const entries = Object.entries(customOptions)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value.length > 0)
    .sort(([a], [b]) => a.localeCompare(b));
  return entries.length ? JSON.stringify(entries) : '';
}

export function cartItemKey(item: Pick<CartItem, 'productSlug' | 'variantId' | 'customOptions'>) {
  const variantPart = item.variantId ? `::${item.variantId}` : '';
  const customPart = customOptionsKey(item.customOptions);
  return `${item.productSlug}${variantPart}${customPart ? `::custom:${customPart}` : ''}`;
}

export function calculateCartTotals(items: CartItem[], products: Product[]) {
  const detailed = items
    .map((item) => {
      const product = products.find((entry) => entry.slug === item.productSlug);
      if (!product) return null;
      const variant = item.variantId ? product.variants?.find((entry) => entry.id === item.variantId && entry.active) ?? null : null;
      const unitPrice = variant?.price ?? product.price;
      const compareAtPrice = variant?.compareAtPrice ?? product.compareAtPrice;
      const sku = variant?.sku ?? product.sku ?? null;
      return {
        ...item,
        product,
        variant,
        customOptions: item.customOptions ?? {},
        unitPrice,
        compareAtPrice,
        sku,
        lineTotal: unitPrice * item.quantity,
      };
    })
    .filter(Boolean) as Array<{
    productSlug: string;
    variantId?: string | null;
    quantity: number;
    product: Product;
    variant: ProductVariant | null;
    customOptions: CartCustomOptions;
    unitPrice: number;
    compareAtPrice: number;
    sku: string | null;
    lineTotal: number;
  }>;

  const subtotal = detailed.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = calculateDeliveryFee(detailed);
  return {
    items: detailed,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
