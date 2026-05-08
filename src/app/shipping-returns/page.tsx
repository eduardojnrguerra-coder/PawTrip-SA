import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shipping and Returns',
  description: 'PawTrip SA shipping, delivery expectation and returns information for South African pet product orders.',
  path: '/shipping-returns',
});

export default function ShippingReturnsPage() {
  return (
    <section className="section">
      <div className="container contentCard detailBlock policyPage">
        <span className="eyebrow">Shipping & Returns</span>
        <h1>Delivery and returns</h1>
        <p>
          Delivery estimates depend on product availability and your location. Orders are processed after payment confirmation. PawTrip SA will keep
          communication practical and clear if an order needs a stock check, supplier confirmation or updated delivery estimate.
        </p>
        <h2>Delivery expectations</h2>
        <p>
          Delivery fees are shown at checkout. Tracking updates are sent when available. PawTrip SA does not claim same-day delivery, immediate delivery or
          guaranteed local stock unless that is clearly confirmed for a specific product.
        </p>
        <h2>Returns</h2>
        <p>
          Unused items can usually be returned in line with the returns policy. Products should be unused, clean, complete and in original packaging where
          practical. Hygiene-sensitive items, consumables, treats and size-sensitive products may have stricter return rules.
        </p>
        <h2>Damaged or incorrect items</h2>
        <p>
          Contact support as soon as possible and include your order reference, photos and a short description of the issue. This helps PawTrip SA assess the
          next step clearly.
        </p>
        <h2>Need help?</h2>
        <p>Email support@pawtripsa.co.za and include your order reference when contacting support.</p>
      </div>
    </section>
  );
}
