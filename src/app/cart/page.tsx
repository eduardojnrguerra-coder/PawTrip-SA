import type { Metadata } from 'next';
import { CartPageClient } from '@/components/cart-page-client';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Cart',
  description: 'Review your PawTrip SA cart before checkout.',
  path: '/cart',
});

export default function CartPage() {
  return <CartPageClient />;
}
