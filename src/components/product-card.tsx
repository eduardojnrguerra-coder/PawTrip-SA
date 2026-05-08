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
  const savings = Math.max(0, product.compareAtPrice - product.price);

  return (
    <motion.article className="productCard" whileHover={reduceMotion ? undefined : { y: -6 }} transition={{ duration: 0.2 }}>
      <Link href={`/shop/product/${product.slug}`} className="productCardMedia">
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
        </div>
        <Link href={`/shop/product/${product.slug}`} className="productName">
          {product.name}
        </Link>
        <p>{product.shortDescription}</p>
        <div className="priceRow">
          <strong>{formatZar(product.price)}</strong>
          <span>{formatZar(product.compareAtPrice)}</span>
        </div>
        {savings > 0 ? (
          <div className={product.isBundle ? 'bundleSavingsCallout' : 'savingsCallout'}>
            Save {formatZar(savings)}{product.isBundle ? ' with this bundle' : ''}
          </div>
        ) : null}
        <div className="bestFor">
          <Star size={14} />
          <span>Best for: {product.bestFor.slice(0, 2).join(' | ')}</span>
        </div>
        <div className="cardActions">
          <button type="button" className="button buttonPrimary buttonSmall" onClick={() => addItem(product.slug)}>
            Add to cart
          </button>
          <Link href={`/shop/product/${product.slug}`} className="button buttonGhost buttonSmall">
            View <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
