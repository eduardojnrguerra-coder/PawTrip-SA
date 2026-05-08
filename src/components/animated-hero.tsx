'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Truck } from 'lucide-react';
import type { Product } from '@/data/products';
import { formatZar } from '@/lib/money';
import { getProductImageAlt, ProductImage } from '@/components/product-image';
import { HeroRoute } from '@/components/hero-route';

const floatingBadges = ['Waterproof protection', 'Boredom busters', 'Secure checkout', 'Travel-ready kits'];

const copyContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const copyItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0 },
};

export function AnimatedHero({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  const heroProducts = products.slice(0, 4);
  const primary = heroProducts[0];
  const secondary = heroProducts[1];
  const tertiary = heroProducts[2];

  return (
    <section className="hero heroAlive heroPremium">
      <div className="container heroShell">
        <motion.div
          className="heroCopy heroCopyAlive heroPremiumCopy"
          variants={copyContainer}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
        >
          <motion.span className="eyebrow" variants={copyItem}>
            South African pet travel & essentials store
          </motion.span>
          <motion.h1 variants={copyItem}>Cleaner cars. Safer trips. Happier dogs.</motion.h1>
          <motion.p variants={copyItem}>
            Dog travel kits, toys, treats and everyday essentials selected to make life with pets easier.
          </motion.p>
          <div className="heroActions">
            <motion.div variants={copyItem}>
              <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
                Find My Pet Kit
                <ArrowRight size={16} />
              </Link>
            </motion.div>
            <motion.div variants={copyItem}>
              <Link href="/shop" className="button buttonSecondary buttonSheen">
                Shop Best Sellers
              </Link>
            </motion.div>
          </div>

          <motion.div className="heroTrustLine" variants={copyItem}>
            <span>Secure checkout</span>
            <span>Clear delivery estimates</span>
            <span>Practical pet essentials</span>
          </motion.div>
        </motion.div>

        <motion.div
          className="heroShowcase heroPremiumShowcase"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 18 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        >
          <HeroRoute />

          <motion.div
            className="heroLayeredVisual"
            animate={reduceMotion ? undefined : { y: [0, -10, 0], rotate: [0, 0.4, 0] }}
            transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <div className="heroVisualCard heroVisualCardMain">
              <ProductImage
                src={primary?.image ?? '/products/road-trip-starter-kit-1.jpg'}
                alt={getProductImageAlt(primary?.name ?? 'Road Trip Starter Kit', primary?.category ?? 'Travel Kits', 'hero')}
                productName={primary?.name ?? 'Road Trip Starter Kit'}
                category={primary?.category ?? 'Travel Kits'}
                className="heroMainImage"
              />
              <div className="heroImageOverlay heroPremiumOverlay">
                <span>
                  <Truck size={14} /> Built for practical trips
                </span>
                <strong>{primary?.name ?? 'Road Trip Starter Kit'}</strong>
                <small>{primary ? formatZar(primary.price) : 'From travel kits to clean-car add-ons'}</small>
              </div>
            </div>

            {secondary ? (
              <motion.div
                className="heroStackCard heroStackCardTop"
                animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
                transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ProductImage
                  src={secondary.image}
                  alt={getProductImageAlt(secondary.name, secondary.category, 'hero lifestyle card')}
                  productName={secondary.name}
                  category={secondary.category}
                  className="heroStackImage"
                />
                <div>
                  <span>{secondary.categoryName}</span>
                  <strong>{secondary.name}</strong>
                </div>
              </motion.div>
            ) : null}

            {tertiary ? (
              <motion.div
                className="heroStackCard heroStackCardBottom"
                animate={reduceMotion ? undefined : { y: [0, -7, 0] }}
                transition={{ duration: 6.1, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ProductImage
                  src={tertiary.image}
                  alt={getProductImageAlt(tertiary.name, tertiary.category, 'hero product card')}
                  productName={tertiary.name}
                  category={tertiary.category}
                  className="heroStackImage"
                />
                <div>
                  <span>Best for</span>
                  <strong>{tertiary.bestFor[0]}</strong>
                </div>
              </motion.div>
            ) : null}
          </motion.div>

          <div className="heroFloatingBadges">
            {floatingBadges.map((badge, index) => (
              <motion.span
                className={`heroBadge heroFloatBadge heroFloatBadge${index + 1}`}
                key={badge}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: [0, index % 2 ? 7 : -7, 0] }}
                transition={{ duration: 4.8 + index * 0.35, delay: index * 0.12, repeat: reduceMotion ? 0 : Infinity, ease: 'easeInOut' }}
              >
                <ShieldCheck size={14} /> {badge}
              </motion.span>
            ))}
          </div>

          <div className="heroProofStrip heroPremiumProof">
            <span>
              <CheckCircle2 size={15} /> No fake reviews
            </span>
            <span>
              <Sparkles size={15} /> Useful bundles
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
