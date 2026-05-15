'use client';

import Link from 'next/link';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import type { Product } from '@/data/products';

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

function badgeFloat(reduceMotion: boolean | null, delay: number) {
  if (reduceMotion) return {};
  return {
    y: [0, -7, 0],
    transition: { duration: 4 + delay, repeat: Infinity, ease: 'easeInOut' as const, delay },
  };
}

export function AnimatedHero({ products }: { products: Product[] }) {
  const reduceMotion = useReducedMotion();
  void products;

  return (
    <section className="hero heroClean">
      {/* Decorative background shapes */}
      <div className="heroDeco" aria-hidden="true">
        <div className="heroDecoOrb heroDecoOrb1" />
        <div className="heroDecoOrb heroDecoOrb2" />
        <span className="heroDecoPaw heroDecoPaw1" aria-hidden="true">&#x1F43E;</span>
        <span className="heroDecoPaw heroDecoPaw2" aria-hidden="true">&#x1F43E;</span>
      </div>

      <div className="container heroShell">
        <motion.div
          className="heroCopy heroCopyClean"
          variants={copyContainer}
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
        >
          <motion.span className="eyebrow" variants={copyItem}>
            South African pet travel &amp; essentials store
          </motion.span>
          <motion.h1 variants={copyItem}>
            Cleaner cars.
            <br />
            Calmer dogs.
            <br />
            Better trips.
          </motion.h1>
          <motion.p variants={copyItem}>
            Dog travel kits, car protection and everyday essentials for South African pet owners dealing with hair, mud,
            sand and road-trip chaos.
          </motion.p>
          <div className="heroActions">
            <motion.div variants={copyItem}>
              <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
                Find My Pet Kit
              </Link>
            </motion.div>
            <motion.div variants={copyItem}>
              <Link href="/shop/category/car-protection" className="button buttonSecondary buttonSheen">
                Shop Car Protection
                <ArrowRight size={16} />
              </Link>
            </motion.div>
          </div>

          <motion.div className="heroTrustBadges" variants={copyItem}>
            <span>Cleaner cars</span>
            <span>Safer trips</span>
            <span>Happier dogs</span>
          </motion.div>

          <motion.p className="heroTrustSentence" variants={copyItem}>
            Practical dog travel accessories for South African cars, beaches and road trips.
          </motion.p>
        </motion.div>

        <motion.div
          className="heroImageCard"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          whileHover={reduceMotion ? undefined : { y: -6 }}
        >
          <div className="heroImageCardInner">
            <img
              src="/brand-assets/pawtrip-mess-solution.png"
              alt="Dog sitting on waterproof car seat hammock in a PawTrip SA travel setup"
              className="heroImageClean"
              loading="eager"
              decoding="async"
            />
          </div>

          <motion.span
            className="heroFloatBadge heroFloatBadge1"
            animate={badgeFloat(reduceMotion, 0)}
          >
            <ShieldCheck size={13} /> Protects seats
          </motion.span>
          <motion.span
            className="heroFloatBadge heroFloatBadge2"
            animate={badgeFloat(reduceMotion, 1.2)}
          >
            <ShieldCheck size={13} /> Mud &amp; hair defence
          </motion.span>
          <motion.span
            className="heroFloatBadge heroFloatBadge3"
            animate={badgeFloat(reduceMotion, 2.4)}
          >
            <ShieldCheck size={13} /> Road-trip ready
          </motion.span>
        </motion.div>
      </div>
    </section>
  );
}
