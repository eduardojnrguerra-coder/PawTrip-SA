import type { Metadata } from 'next';
import { PendingOrderClient } from '@/components/pending-order-client';

export const metadata: Metadata = {
  title: 'Payment success',
  description: 'Payment success page for PawTrip SA orders.',
};

export default function SuccessPage({ searchParams }: { searchParams: { order_ref?: string } }) {
  return (
    <section className="section">
      <div className="container">
        <PendingOrderClient orderRef={searchParams.order_ref} />
      </div>
    </section>
  );
}

