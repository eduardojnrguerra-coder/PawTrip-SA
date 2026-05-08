import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Privacy Policy',
  description: 'How PawTrip SA handles customer information, checkout data, analytics and support messages.',
  path: '/privacy',
});

export default function PrivacyPage() {
  return (
    <section className="section">
      <div className="container contentCard detailBlock policyPage">
        <span className="eyebrow">Privacy Policy</span>
        <h1>How PawTrip SA handles information</h1>
        <p>
          PawTrip SA collects only the information needed to run the storefront, process orders, support customers and improve the shopping experience. This
          includes details such as your name, email address, phone number, delivery address, cart contents and order reference.
        </p>
        <h2>Payments</h2>
        <p>
          Online payment is processed through PayFast. PawTrip SA does not store card details. PayFast may process payment information according to its own
          secure payment and compliance processes.
        </p>
        <h2>Orders and support</h2>
        <p>
          If Supabase order storage is enabled, order details may be stored so PawTrip SA can confirm payment status, support fulfilment and respond to order
          questions. If you contact support, please include your order reference. The current contact form uses a mailto fallback and does not save messages
          on the website.
        </p>
        <h2>Analytics</h2>
        <p>
          Google Analytics is loaded only if a measurement ID is configured. Analytics helps PawTrip SA understand product interest, checkout starts and guide
          page performance without changing the checkout price or payment process.
        </p>
        <h2>Questions</h2>
        <p>For privacy questions, contact support@pawtripsa.co.za.</p>
      </div>
    </section>
  );
}
