import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, HelpCircle, Mail, MapPin, PackageCheck } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Contact PawTrip SA',
  description: 'Contact PawTrip SA customer support for product questions, order support, shipping help and returns guidance.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <section className="section contactPage">
      <div className="container">
        <div className="sectionHeader contactHeader">
          <span className="eyebrow">Customer support</span>
          <h1>Contact PawTrip SA.</h1>
          <p>
            Need help choosing a product, checking an order or understanding delivery and returns? Send us a message and
            include your order reference when contacting support.
          </p>
        </div>

        <div className="contactPageGrid">
          <div className="contentCard detailBlock contactMainCard">
            <ContactForm />
          </div>

          <aside className="contactSupportStack">
            <div className="contentCard detailBlock supportInfoCard">
              <span className="eyebrow">Support email</span>
              <h2>support@pawtripsa.co.za</h2>
              <p>
                Responses are handled during business hours. PawTrip SA is a new store, so support is focused on clear,
                practical replies rather than instant chat promises.
              </p>
              <a className="button buttonSecondary buttonSheen" href="mailto:support@pawtripsa.co.za">
                Email support <Mail size={15} />
              </a>
            </div>

            <div className="contentCard detailBlock supportInfoCard">
              <h2>Order support</h2>
              <div className="supportPoint">
                <PackageCheck size={18} />
                <p>Please include your order reference when contacting support.</p>
              </div>
              <div className="supportPoint">
                <Clock size={18} />
                <p>Orders are processed after payment confirmation. Delivery estimates depend on availability and location.</p>
              </div>
              <div className="supportPoint">
                <MapPin size={18} />
                <p>PawTrip SA supports customers in South Africa.</p>
              </div>
            </div>

            <div className="contentCard detailBlock supportInfoCard">
              <h2>Helpful links</h2>
              <div className="supportLinkList">
                <Link href="/shipping-returns">
                  <HelpCircle size={16} /> Shipping & Returns
                </Link>
                <Link href="/privacy">
                  <HelpCircle size={16} /> Privacy Policy
                </Link>
                <Link href="/terms">
                  <HelpCircle size={16} /> Terms
                </Link>
                <Link href="/find-my-kit">
                  <HelpCircle size={16} /> Product choice FAQ
                </Link>
                <Link href="/blog">
                  <HelpCircle size={16} /> Guides and FAQs
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
