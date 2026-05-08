import Link from 'next/link';
import { CheckCircle2, ClipboardList, ShieldCheck, Truck, Wand2 } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export function TrustStrip() {
  return (
    <section className="trustStrip">
      <div className="container trustStripInner">
        <span>Secure PayFast payments</span>
        <span>Clear delivery estimates</span>
        <span>Practical pet essentials</span>
        <Link href="/contact">Support before and after you buy</Link>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const items = [
    { icon: <ClipboardList size={18} />, title: 'Choose your product or kit' },
    { icon: <Truck size={18} />, title: 'Add to cart' },
    { icon: <ShieldCheck size={18} />, title: 'Pay securely online' },
    { icon: <CheckCircle2 size={18} />, title: 'We process your order' },
    { icon: <Wand2 size={18} />, title: 'Tracking updates are sent when available' },
  ];
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="sectionHeader">
            <span className="eyebrow">How it works</span>
            <h2>Simple from selection to delivery.</h2>
          </div>
        </Reveal>
        <div className="iconSteps">
          {items.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.05}>
              <div className="iconStep">
                <div className="iconBubble">{item.icon}</div>
                <p>{item.title}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeTrustMessage() {
  return (
    <section className="section">
      <div className="container">
        <Reveal>
          <div className="card trustMessage">
            <span className="eyebrow">A transparent new store</span>
            <p>
              PawTrip SA is a new South African pet store focused on practical products, clear communication and useful bundles. We do not use fake reviews.
              Real customer reviews will be added as orders are fulfilled. Delivery estimate depends on product availability and your location.
            </p>
            <p>
              We are a new South African pet store, so we are not going to pretend we have thousands of reviews. Our focus is simple: useful products, clear
              information and secure checkout.
            </p>
            <div className="trustMessageLinks">
              <Link href="/shipping-returns">Shipping & returns</Link>
              <Link href="/contact">Contact support</Link>
              <Link href="/find-my-kit">Not sure what to choose? Use the kit finder.</Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function FinalCTA() {
  return (
    <section className="section finalCta">
      <div className="container finalCtaInner">
        <div>
          <span className="eyebrow">Ready to shop?</span>
          <h2>Find the right kit for your dog.</h2>
        </div>
        <Link href="/find-my-kit" className="button buttonPrimary">
          Find My Kit
        </Link>
      </div>
    </section>
  );
}
