'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { formatZar } from '@/lib/money';
import type { Product } from '@/data/products';
import { getProductImageAlt, ProductImage } from '@/components/product-image';

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const reduceMotion = useReducedMotion();
  const problemHeadline = product.problemsSolved?.[0] ?? product.shortDescription ?? 'Practical everyday dog gear.';
  const whyItHelps = product.benefits?.[0] ?? product.shortDescription ?? 'Useful for cleaner, calmer everyday routines.';
  const bestForLine = product.bestFor?.slice(0, 2).join(' | ') || product.categoryName || 'Everyday dog-owner routines';
  const defaultVariant = product.variants?.find((variant) => variant.active && variant.stockQuantity > 0) ?? product.variants?.find((variant) => variant.active);
  const displayPrice = defaultVariant?.price ?? product.price;
  const displayCompareAtPrice = defaultVariant?.compareAtPrice ?? product.compareAtPrice;
  const savings = Math.max(0, (displayCompareAtPrice ?? displayPrice ?? 0) - (displayPrice ?? 0));
  const needsCustomisation = product.customOptions?.some((option) => option.active);

  if (!product.launchVisible || !product.imageReady || !product.slug) return null;

  return (
    <motion.article className="productCard" whileHover={reduceMotion ? undefined : { y: -6 }} transition={{ duration: 0.2 }}>
      <Link href={`/shop/product/${product.slug}`} className="productCardMedia">
        <span className="productMediaBadge">{product.isBundle ? 'Starter kit' : product.categoryName}</span>
        <ProductImage
          src={product.image}
          alt={getProductImageAlt(product.name, product.category)}
          productName={product.name}
          category={product.category}
          className="productImage"
        />
      </Link>
      <div className="productCardBody">
        <div className="cardMeta">
          <span className="chip">{product.categoryName}</span>
          {product.featured ? (
            <span className="chip chipAccent">
              <Sparkles size={12} /> Best seller
            </span>
          ) : null}
          {savings > 0 ? <span className="chip chipSale">Save {formatZar(savings)}</span> : null}
        </div>
        <p className="productProblemLine">{problemHeadline}</p>
        <Link href={`/shop/product/${product.slug}`} className="productName">
          {product.name}
        </Link>
        <p className="productWhyLine">
          <strong>Why it helps:</strong> {whyItHelps}
        </p>
        <div className="priceRow">
          <strong>{product.variants?.length ? 'From ' : ''}{formatZar(displayPrice)}</strong>
          {displayCompareAtPrice > displayPrice ? <span>{formatZar(displayCompareAtPrice)}</span> : null}
        </div>
        {savings > 0 ? (
          <div className={product.isBundle ? 'bundleSavingsCallout' : 'savingsCallout'}>
            Save {formatZar(savings)}{product.isBundle ? ' with this bundle' : ''}
          </div>
        ) : null}
        <div className="bestFor bestForCompact">
          <Star size={14} />
          <span>Best for: {bestForLine}</span>
        </div>
        <div className="cardActions">
          {needsCustomisation ? (
            <Link href={`/shop/product/${product.slug}`} className="button buttonPrimary buttonSmall">
              Customise
            </Link>
          ) : (
            <button type="button" className="button buttonPrimary buttonSmall" onClick={() => addItem(product.slug, 1, defaultVariant?.id ?? null)}>
              Add to cart
            </button>
          )}
          <Link href={`/shop/product/${product.slug}`} className="button buttonGhost buttonSmall">
            View product <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
