'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { TouchEvent } from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, CreditCard, Info, Minus, Plus, RotateCcw, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatZar } from '@/lib/money';
import type { Product } from '@/data/products';
import { FaqAccordion } from '@/components/faq-accordion';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { RecentlyViewedProducts, rememberRecentlyViewed } from '@/components/recently-viewed-products';
import { gaItem, trackEvent } from '@/lib/analytics';

export function ProductDetailClient({ product, related }: { product: Product; related: Product[] }) {
  const [selected, setSelected] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const { addItem, products } = useCart();
  const galleryImages = product.galleryImages.length ? product.galleryImages : product.gallery;
  const image = galleryImages[selected] ?? product.image;
  const savings = Math.max(0, product.compareAtPrice - product.price);
  const needsSupplierImages = product.sourcePermissionStatus !== 'supplier_permission_confirmed';

  useEffect(() => {
    rememberRecentlyViewed(product.slug);
    trackEvent('view_item', {
      currency: 'ZAR',
      value: product.price,
      items: [gaItem(product)],
    });
  }, [product]);

  function showPreviousImage() {
    setSelected((current) => (current === 0 ? galleryImages.length - 1 : current - 1));
  }

  function showNextImage() {
    setSelected((current) => (current + 1) % galleryImages.length);
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStart === null || galleryImages.length < 2) return;
    const delta = touchStart - event.changedTouches[0].clientX;
    if (Math.abs(delta) > 42) {
      if (delta > 0) showNextImage();
      else showPreviousImage();
    }
    setTouchStart(null);
  }

  const badges = useMemo(
    () => [
      'Secure online checkout',
      'Practical travel kits',
      'Clear delivery estimates',
      'Built for dog owners',
    ],
    [],
  );
  const includedProductLinks = useMemo(
    () =>
      product.whatsIncluded
        .map((included) => products.find((entry) => entry.name.toLowerCase() === included.toLowerCase()))
        .filter(Boolean) as Product[],
    [product.whatsIncluded, products],
  );

  return (
    <div className="productLayout">
      <div className="productGallery">
        <motion.div
          className="productStage"
          key={image}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
          onTouchEnd={handleTouchEnd}
        >
          <ProductImage
            src={image}
            alt={getProductImageAlt(product.name, product.category, `gallery image ${selected + 1}`)}
            productName={product.name}
            category={product.category}
          />
        </motion.div>
        <div className="thumbRow">
          {galleryImages.map((thumb, index) => (
            <button
              type="button"
              key={thumb}
              className={selected === index ? 'thumbButton thumbButtonActive' : 'thumbButton'}
              onClick={() => setSelected(index)}
              aria-label={`Show ${product.name} image ${index + 1}`}
            >
              <ProductImage
                src={thumb}
                alt={getProductImageAlt(product.name, product.category, `thumbnail ${index + 1}`)}
                productName={product.name}
                category={product.category}
              />
            </button>
          ))}
        </div>
        {needsSupplierImages ? (
          <div className="imagePermissionNote">
            Supplier-approved product photos are still needed for this product. Placeholder images may appear until
            permission or original photos are confirmed.
          </div>
        ) : null}
        <div className="contentCard detailBlock">
          <h2>Product overview</h2>
          <p>{product.longDescription ?? product.fullDescription}</p>
        </div>
        <div className="contentCard detailBlock">
          <div className="fitmentHelpBox">
            <strong>Fitment and choosing help</strong>
            <p>
              Check the measurements below against your car or home setup before ordering. Not sure what to choose?{' '}
              <Link href="/find-my-kit">Use the kit finder</Link> or <Link href="/contact">contact support</Link>.
            </p>
          </div>
          <h2>What problem it solves</h2>
          <ul className="bulletList">
            {(product.problemsSolved ?? []).map((item) => (
              <li key={item}>
                <Info size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Quality and material notes</h2>
          <p>
            <strong>Material:</strong> {product.material}
          </p>
          <ul className="bulletList">
            {product.qualityNotes.map((item) => (
              <li key={item}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Size, fit and compatibility</h2>
          <ul className="bulletList">
            {[...product.dimensions, ...product.compatibility].map((item) => (
              <li key={item}>
                <Truck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Best for</h2>
          <ul className="bulletList">
            {product.bestFor.map((item) => (
              <li key={item}>
                <ShieldCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Not ideal for</h2>
          <ul className="bulletList">
            {product.notIdealFor.map((item) => (
              <li key={item}>
                <Info size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>How to use it</h2>
          <ul className="bulletList">
            {product.howToUse.map((item) => (
              <li key={item}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Features</h2>
          <ul className="bulletList">
            {product.features.map((item, index) => (
              <motion.li key={item} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.22, delay: index * 0.04 }}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </motion.li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Measurements</h2>
          <ul className="bulletList">
            {product.measurements.map((item) => (
              <li key={item}>
                <Truck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>What's included</h2>
          <ul className="bulletList">
            {(product.whatsIncluded ?? []).map((item) => (
              <li key={item}>
                <ShieldCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
          {product.isBundle && includedProductLinks.length ? (
            <div className="internalLinkList">
              {includedProductLinks.map((item) => (
                <Link href={`/shop/product/${item.slug}`} key={item.slug}>
                  <span>View {item.name}</span>
                  <strong>Details</strong>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
        <div className="contentCard detailBlock">
          <h2>Cleaning and care</h2>
          <ul className="bulletList">
            {(product.careInstructions ?? []).map((item) => (
              <li key={item}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="contentCard detailBlock">
          <h2>Delivery info</h2>
          <p>{product.deliveryNote}</p>
          <p>{product.returnNote}</p>
          <p>
            Shipping class: {product.shippingClass}. Availability: {product.availability.replaceAll('_', ' ')}.
          </p>
        </div>
        <div className="contentCard detailBlock">
          <h2>FAQ</h2>
          <FaqAccordion items={product.faqs ?? []} />
        </div>
        <div className="contentCard detailBlock">
          <h2>Complete the setup</h2>
          <div className="relatedCarousel">
            {related.map((item) => (
              <a key={item.slug} className="productCard" href={`/shop/product/${item.slug}`}>
                <div className="productCardMedia">
                  <ProductImage
                    src={item.image}
                    alt={getProductImageAlt(item.name, item.category)}
                    productName={item.name}
                    category={item.category}
                    className="productImage"
                  />
                </div>
                <div className="productCardBody">
                  <strong>{item.name}</strong>
                  <p>{item.shortDescription}</p>
                  <div className="priceRow">
                    <strong>{formatZar(item.price)}</strong>
                    <span>{formatZar(item.compareAtPrice)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <aside className="stickyAddToCart">
        <div className="contentCard detailBlock">
          <div className="cardMeta">
            <span className="chip">{product.categoryName}</span>
            <Link className="chip" href={`/shop/category/${product.categorySlug}`}>
              View category
            </Link>
            <span className="chip chipAccent">Best for</span>
          </div>
          <div>
            <h1>{product.name}</h1>
          <p>{product.fullDescription}</p>
          </div>
          <div className="whyProductBox">
            <strong>Why this product?</strong>
            <ul>
              {product.benefits.slice(0, 3).map((benefit) => (
                <li key={benefit}>{benefit}</li>
              ))}
            </ul>
          </div>
          <div className="priceBlock">
            <strong>{formatZar(product.price)}</strong>
            <span>{formatZar(product.compareAtPrice)}</span>
          </div>
          {product.isBundle && savings > 0 ? (
            <div className="bundleSavingsCallout">Save {formatZar(savings)} with this bundle compared with the listed compare-at price.</div>
          ) : null}
          <div className="availabilityNote">
            Availability: {product.availability.replaceAll('_', ' ')}. Delivery estimates depend on product availability and your location.
          </div>
          <div className="quantityRow">
            <button type="button" className="quantityButton" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">
              <Minus size={16} />
            </button>
            <strong>{quantity}</strong>
            <button type="button" className="quantityButton" onClick={() => setQuantity((value) => value + 1)} aria-label="Increase quantity">
              <Plus size={16} />
            </button>
          </div>
          <button type="button" className="button buttonPrimary" onClick={() => addItem(product.slug, quantity)}>
            Add to cart
          </button>
          <div className="trustBlock">
            <ShieldCheck size={18} />
            <div>
              <strong>Secure checkout</strong>
              <p>PayFast handles the payment redirect. Orders are processed after payment confirmation.</p>
            </div>
          </div>
          <div className="buyTrustGrid">
            <span>
              <CreditCard size={15} /> PayFast-ready
            </span>
            <span>
              <Truck size={15} /> Clear delivery estimates
            </span>
            <span>
              <RotateCcw size={15} /> Returns policy applies
            </span>
          </div>
          <ul className="benefitList">
            {product.bestFor.map((item, index) => (
              <motion.li key={item} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2, delay: index * 0.04 }}>
                <BadgeCheck size={16} /> <span>{item}</span>
              </motion.li>
            ))}
          </ul>
          <div className="productHelpLinks">
            <Link href="/shipping-returns">Shipping & returns</Link>
            <Link href="/contact">Ask before you buy</Link>
          </div>
        </div>

        <div className="contentCard detailBlock">
          <h2>Best for</h2>
          <ul className="bulletList">
            {[...product.bestFor.slice(0, 3), ...badges.slice(0, 2)].map((item) => (
              <li key={item}>
                <ShieldCheck size={16} /> <span>{item}</span>
              </li>
            ))}
          </ul>
          <p>{product.deliveryNote}</p>
          <p>{product.returnNote}</p>
          <p>Delivery estimate depends on product availability and your location.</p>
        </div>
      </aside>

      <div className="mobileStickyCart">
        <div>
          <strong>{formatZar(product.price)}</strong>
          <span>{product.name}</span>
        </div>
        <button type="button" className="button buttonPrimary buttonSheen" onClick={() => addItem(product.slug, quantity)}>
          Add to cart
        </button>
      </div>

      <div className="productWideBlock">
        {related.length ? (
          <section className="recentlyViewedBlock">
            <div className="sectionHeader">
              <span className="eyebrow">Complete the setup</span>
              <h2>Useful products to pair with this.</h2>
            </div>
            <div className="relatedCarousel">
              {related.map((item) => (
                <a key={item.slug} className="productCard" href={`/shop/product/${item.slug}`}>
                  <div className="productCardMedia">
                    <ProductImage
                      src={item.image}
                      alt={getProductImageAlt(item.name, item.category, 'complete the setup')}
                      productName={item.name}
                      category={item.category}
                      className="productImage"
                    />
                  </div>
                  <div className="productCardBody">
                    <div className="cardMeta">
                      <span className="chip">Best for: {item.bestFor[0]}</span>
                    </div>
                    <strong>{item.name}</strong>
                    <p>{item.shortDescription}</p>
                    <div className="priceRow">
                      <strong>{formatZar(item.price)}</strong>
                      <span>{formatZar(item.compareAtPrice)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </section>
        ) : null}
        <RecentlyViewedProducts products={products} currentSlug={product.slug} />
      </div>
    </div>
  );
}
