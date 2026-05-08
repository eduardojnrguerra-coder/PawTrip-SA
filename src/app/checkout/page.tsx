import type { Metadata } from 'next';
import { CheckoutForm } from '@/components/checkout-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Checkout',
  description: 'Secure checkout for PawTrip SA orders with PayFast-ready payment flow.',
  path: '/checkout',
});

export default function CheckoutPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">Checkout</span>
          <h1>Secure checkout.</h1>
          <p>Complete your order details and pay online via PayFast.</p>
        </div>
        <CheckoutForm />
      </div>
    </section>
  );
}
