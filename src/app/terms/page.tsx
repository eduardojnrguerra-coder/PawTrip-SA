import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Terms of Service',
  description: 'PawTrip SA terms for orders, product information, payment confirmation, delivery and returns.',
  path: '/terms',
});

export default function TermsPage() {
  return (
    <section className="section">
      <div className="container contentCard detailBlock policyPage">
        <span className="eyebrow">Terms</span>
        <h1>Terms of service</h1>
        <p>
          By using PawTrip SA, you agree to shop with clear expectations: product information should be practical, payment must be confirmed before an order
          is processed, and delivery depends on product availability and customer location.
        </p>
        <h2>Product information</h2>
        <p>
          PawTrip SA aims to keep product descriptions, prices, measurements and included items accurate. If a mistake is found, we may correct the
          information or contact you before processing the order.
        </p>
        <h2>Orders and payment</h2>
        <p>
          Orders are processed after payment confirmation. PayFast handles secure payment processing. PawTrip SA does not store card details.
        </p>
        <h2>Availability and delivery</h2>
        <p>
          Product availability can change. Delivery estimates depend on product availability and your location. If an item cannot be supplied, PawTrip SA will
          contact you about the next practical step.
        </p>
        <h2>Support</h2>
        <p>Please include your order reference when contacting support at support@pawtripsa.co.za.</p>
      </div>
    </section>
  );
}
