import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment cancelled',
  description: 'Payment cancelled page for PawTrip SA orders.',
};

export default function CancelledPage({ searchParams }: { searchParams: { order_ref?: string } }) {
  return (
    <section className="section">
      <div className="container">
        <div className="contentCard detailBlock">
          <span className="eyebrow">Payment cancelled</span>
          <h1>Your payment was not completed.</h1>
          <p>
            {searchParams.order_ref ? `Order reference: ${searchParams.order_ref}. ` : ''}
            Your cart stays saved in this browser so you can review it or return to checkout when you are ready.
          </p>
          <div className="cardActions">
            <Link href="/checkout" className="button buttonPrimary">
              Return to checkout
            </Link>
            <Link href="/cart" className="button buttonSecondary">
              Review cart
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
