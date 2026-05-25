'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Minus, Plus, ShieldCheck, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatZar } from '@/lib/money';
import { calculateCartTotals, cartItemKey } from '@/lib/cart';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { trackEvent } from '@/lib/analytics';

export function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, addItem, decreaseItem, removeItem, products } = useCart();
  const reduceMotion = useReducedMotion();
  const totals = calculateCartTotals(items, products);
  const detailed = totals.items;
  const subtotal = detailed.reduce((sum, item) => sum + item!.lineTotal, 0);
  const deliveryThreshold = 1200;
  const thresholdRemaining = Math.max(0, deliveryThreshold - subtotal);
  const cartSlugs = new Set(items.map((item) => item.productSlug));
  const relatedSlugs = detailed.flatMap((entry) => entry!.product.relatedProductSlugs);
  const suggestions = [
    ...relatedSlugs.map((slug) => products.find((product) => product.slug === slug)),
    ...products.filter((product) => product.tags.some((tag) => ['travel', 'cleaning', 'treat'].includes(tag.toLowerCase()))),
  ]
    .filter(Boolean)
    .filter((product, index, all) => all.findIndex((entry) => entry!.slug === product!.slug) === index)
    .filter((product) => !cartSlugs.has(product!.slug) && !product!.isBundle)
    .slice(0, 2);

  function trackCartView() {
    trackEvent('view_cart', {
      currency: 'ZAR',
      value: subtotal,
      item_count: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }

  useEffect(() => {
    if (isDrawerOpen) trackCartView();
  }, [isDrawerOpen]);

  return (
    <AnimatePresence>
      {isDrawerOpen ? (
        <motion.div
          className="drawerBackdrop"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          onClick={closeDrawer}
        >
          <motion.aside
            className="drawerPanel"
            initial={reduceMotion ? false : { x: '100%' }}
            animate={reduceMotion ? undefined : { x: 0 }}
            exit={reduceMotion ? undefined : { x: '100%' }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawerHeader">
              <div>
                <strong>Your cart</strong>
                <p>{items.length ? `${items.length} item(s)` : 'Ready for your first item'}</p>
              </div>
              <button type="button" className="iconButton subtle" onClick={closeDrawer} aria-label="Close cart">
                <X size={18} />
              </button>
            </div>

            {detailed.length ? (
              <div className="drawerList">
                {detailed.map((entry) => (
                  <div key={cartItemKey(entry)} className="drawerItem">
                    <ProductImage
                      src={entry!.product.image}
                      alt={getProductImageAlt(entry!.product.name, entry!.product.category)}
                      productName={entry!.product.name}
                      category={entry!.product.category}
                      className="drawerThumb"
                    />
                    <div className="drawerItemInfo">
                      <Link href={`/shop/product/${entry!.product.slug}`} onClick={closeDrawer}>
                        {entry!.product.name}
                      </Link>
                      {entry.variant ? <small>{entry.variant.optionName}: {entry.variant.optionValue}</small> : null}
                      {Object.keys(entry.customOptions).length ? (
                        <small>{Object.entries(entry.customOptions).map(([label, value]) => `${label}: ${value}`).join(' · ')}</small>
                      ) : null}
                      <span>{formatZar(entry!.unitPrice)}</span>
                      {entry!.product.type === 'kit' || entry!.product.isBundle ? (
                        <small>Includes {entry!.product.whatsIncluded.length} products</small>
                      ) : null}
                      <div className="qtyRow">
                        <button type="button" className="qtyButton" onClick={() => decreaseItem(entry!.product.slug, entry!.variantId, entry!.customOptions)} aria-label="Decrease quantity">
                          <Minus size={14} />
                        </button>
                        <strong>{entry!.quantity}</strong>
                        <button type="button" className="qtyButton" onClick={() => addItem(entry!.product.slug, 1, entry!.variantId, entry!.customOptions)} aria-label="Increase quantity">
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <button type="button" className="iconButton subtle" onClick={() => removeItem(entry!.product.slug, entry!.variantId, entry!.customOptions)} aria-label="Remove item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="emptyState">
                <ShoppingBag size={32} />
                <h3>Your cart is empty</h3>
                <p>Add a travel kit, toy or practical everyday essential to get started.</p>
                <Link href="/shop" className="button buttonPrimary" onClick={closeDrawer}>
                  Shop products
                </Link>
              </div>
            )}

            <div className="drawerFooter">
              {detailed.length ? (
                <div className="thresholdBox">
                  <Sparkles size={16} />
                  <p>
                    {thresholdRemaining > 0
                      ? `${formatZar(thresholdRemaining)} away from the configured delivery incentive threshold.`
                      : 'Your cart reaches the configured delivery incentive threshold.'}
                  </p>
                </div>
              ) : null}
              {suggestions.length ? (
                <div className="drawerCrossSell">
                  <strong>Complete your kit</strong>
                  {suggestions.map((product) => (
                    <button
                      type="button"
                      key={product!.slug}
                      className="drawerAddOn"
                      onClick={() => addItem(product!.slug, 1, product!.variants?.find((variant) => variant.active && variant.stockQuantity > 0)?.id ?? product!.variants?.find((variant) => variant.active)?.id ?? null)}
                    >
                      <span>{product!.name}</span>
                      <small>{formatZar(product!.price)}</small>
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="trustBlock drawerTrust">
                <ShieldCheck size={18} />
                <div>
                  <strong>Secure checkout</strong>
                  <p>Payment redirects securely through PayFast. Orders are processed after payment confirmation.</p>
                </div>
              </div>
              <div className="summaryRow">
                <span>Subtotal</span>
                <strong>{formatZar(subtotal)}</strong>
              </div>
              <p className="drawerNote">Delivery estimate depends on product availability and your location.</p>
              <Link href="/cart" className="button buttonSecondary" onClick={closeDrawer}>
                View cart
              </Link>
              {detailed.length ? (
                <Link
                  href="/checkout"
                  className="button buttonPrimary"
                  onClick={() => {
                    trackCartView();
                    closeDrawer();
                  }}
                >
                  Checkout
                </Link>
              ) : null}
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
