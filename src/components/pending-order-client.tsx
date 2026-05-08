'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PENDING_ORDER_KEY, type PendingOrder } from '@/lib/cart';
import { calculateCartTotals } from '@/lib/cart';
import { formatZar } from '@/lib/money';
import { useCart } from '@/components/cart-provider';

export function PendingOrderClient({ orderRef }: { orderRef?: string }) {
  const [order, setOrder] = useState<PendingOrder | null>(null);
  const { products } = useCart();

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PENDING_ORDER_KEY);
      if (raw) setOrder(JSON.parse(raw) as PendingOrder);
    } catch {
      setOrder(null);
    }
  }, []);

  if (!order) {
    return (
      <div className="contentCard detailBlock">
        <span className="eyebrow">PayFast return</span>
        <h1>Thank you.</h1>
        <p>Thank you. Your payment confirmation will be checked before your order is processed.</p>
        {orderRef ? <p>Order reference: {orderRef}</p> : null}
        <div className="trustBlock">
          <div>
            <strong>Need help?</strong>
            <p>Email hello@pawtripsa.co.za or call +27 00 000 0000 with your order reference.</p>
          </div>
        </div>
        <Link href="/shop" className="button buttonPrimary">
          Back to shop
        </Link>
      </div>
    );
  }

  const totals = calculateCartTotals(order.items, products);

  return (
    <div className="contentCard detailBlock">
      <span className="eyebrow">Order received</span>
      <h1>Thanks, {order.customer.name.split(' ')[0]}.</h1>
      <p>Thank you. Your payment confirmation will be checked before your order is processed.</p>
      <p>
        Your order reference is <strong>{orderRef ?? order.orderReference}</strong>.
      </p>
      <div className="summaryList">
        {totals.items.map((item) => (
          <div key={item.product.slug} className="summaryItem">
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <strong>{formatZar(item.lineTotal)}</strong>
          </div>
        ))}
      </div>
      <div className="summaryRow totalRow">
        <span>Order total</span>
        <strong>{formatZar(order.total)}</strong>
      </div>
      <div className="trustBlock">
        <div>
          <strong>Support</strong>
          <p>Email hello@pawtripsa.co.za or call +27 00 000 0000 with your order reference.</p>
        </div>
      </div>
      <Link href="/shop" className="button buttonPrimary">
        Continue shopping
      </Link>
    </div>
  );
}
