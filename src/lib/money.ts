import type { Product } from '@/data/products';

export const shippingClassFees: Record<Product['shippingClass'], number> = {
  small: 69,
  standard: 99,
  bulky: 149,
  oversized: 249,
};

export function calculateDeliveryFee(items: Array<{ product: Product; quantity: number }>) {
  if (!items.length) return 0;
  return items.reduce((highest, item) => Math.max(highest, shippingClassFees[item.product.shippingClass] ?? shippingClassFees.standard), 0);
}

export function formatZar(amount: number) {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    maximumFractionDigits: 0,
  }).format(amount);
}
