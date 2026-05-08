'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { calculateCartTotals } from '@/lib/cart';
import { formatZar } from '@/lib/money';
import { ProductCard } from '@/components/product-card';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { trackEvent } from '@/lib/analytics';

export function CartPageClient() {
  const { items, addItem, decreaseItem, removeItem, products } = useCart();
  const totals = calculateCartTotals(items, products);
  const cartSlugs = new Set(items.map((item) => item.productSlug));
  const relatedSlugs = totals.items.flatMap((item) => item.product.relatedProductSlugs);
  const suggestions = [
    ...relatedSlugs.map((slug) => products.find((product) => product.slug === slug)),
    ...products.filter((product) => product.tags.some((tag) => ['travel', 'cleaning', 'treat'].includes(tag.toLowerCase()))),
  ]
    .filter(Boolean)
    .filter((product, index, all) => all.findIndex((entry) => entry!.slug === product!.slug) === index)
    .filter((product) => !cartSlugs.has(product!.slug))
    .slice(0, 3);
  const thresholdRemaining = Math.max(0, 1200 - totals.subtotal);

  useEffect(() => {
    trackEvent('view_cart', {
      currency: 'ZAR',
      value: totals.subtotal,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }, [items, totals.subtotal]);

  if (!items.length) {
    return (
      <section className="section">
        <div className="container contentCard emptyState">
          <ShoppingBag size={44} />
          <h1>Your cart is empty</h1>
          <p>Pick a travel kit, grooming essential or useful everyday product to get going.</p>
          <Link href="/shop" className="button buttonPrimary">
            Shop products
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="container productLayout">
        <div className="contentCard detailBlock">
          <h1>Your cart</h1>
          <div className="drawerList">
            {totals.items.map((item) => (
              <div key={item.product.slug} className="drawerItem">
                <ProductImage
                  src={item.product.image}
                  alt={getProductImageAlt(item.product.name, item.product.category)}
                  productName={item.product.name}
                  category={item.product.category}
                  className="drawerThumb"
                />
                <div className="drawerItemInfo">
                  <Link href={`/shop/product/${item.product.slug}`}>{item.product.name}</Link>
                  <span>{formatZar(item.product.price)}</span>
                  <div className="qtyRow">
                    <button type="button" className="qtyButton" onClick={() => decreaseItem(item.product.slug)} aria-label="Decrease quantity">
                      <Minus size={14} />
                    </button>
                    <strong>{item.quantity}</strong>
                    <button type="button" className="qtyButton" onClick={() => addItem(item.product.slug)} aria-label="Increase quantity">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button type="button" className="iconButton subtle" onClick={() => removeItem(item.product.slug)} aria-label="Remove item">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <aside className="contentCard detailBlock stickySummary">
          <h2>Summary</h2>
          <div className="summaryRow">
            <span>Subtotal</span>
            <strong>{formatZar(totals.subtotal)}</strong>
          </div>
          <div className="summaryRow">
            <span>Delivery</span>
            <strong>{formatZar(totals.deliveryFee)}</strong>
          </div>
          <div className="thresholdBox">
            <Sparkles size={16} />
            <p>
              {thresholdRemaining > 0
                ? `${formatZar(thresholdRemaining)} away from the configured delivery incentive threshold.`
                : 'Your cart reaches the configured delivery incentive threshold.'}
            </p>
          </div>
          <div className="trustBlock">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure checkout</strong>
              <p>Pay through PayFast. Orders are processed after payment confirmation.</p>
            </div>
          </div>
          <div className="summaryRow totalRow">
            <span>Total</span>
            <strong>{formatZar(totals.total)}</strong>
          </div>
          <Link
            href="/checkout"
            className="button buttonPrimary"
            onClick={() =>
              trackEvent('begin_checkout', {
                currency: 'ZAR',
                value: totals.total,
                item_count: items.reduce((sum, item) => sum + item.quantity, 0),
              })
            }
          >
            Checkout
          </Link>
          <p className="checkoutSmallPrint">
            Delivery estimate depends on product availability and your location. Read our{' '}
            <Link href="/shipping-returns">shipping and returns policy</Link>.
          </p>
        </aside>
      </div>

      <div className="container" style={{ marginTop: 28 }}>
        <div className="sectionHeader">
          <span className="eyebrow">Complete your kit</span>
          <h2>Useful add-ons for your cart</h2>
          <p>Small practical extras only, based on what is already in your cart.</p>
        </div>
        <div className="productGrid">
          {suggestions.map((product) => (
            <ProductCard key={product!.slug} product={product!} />
          ))}
        </div>
      </div>
    </section>
  );
}
