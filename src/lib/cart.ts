import { calculateDeliveryFee } from '@/lib/money';
import type { Product } from '@/data/products';

export type CartItem = {
  productSlug: string;
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

export function calculateCartTotals(items: CartItem[], products: Product[]) {
  const detailed = items
    .map((item) => {
      const product = products.find((entry) => entry.slug === item.productSlug);
      if (!product) return null;
      return {
        ...item,
        product,
        lineTotal: product.price * item.quantity,
      };
    })
    .filter(Boolean) as Array<{
    productSlug: string;
    quantity: number;
    product: Product;
    lineTotal: number;
  }>;

  const subtotal = detailed.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = calculateDeliveryFee(subtotal);
  return {
    items: detailed,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
  };
}
