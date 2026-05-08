'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useCart } from '@/components/cart-provider';
import type { Category } from '@/data/products';
import { cn } from '@/lib/utils';

const nav = [
  { href: '/shop', label: 'Shop' },
  { href: '/find-my-kit', label: 'Kit Finder' },
  { href: '/problems', label: 'Shop by Problem' },
  { href: '/blog', label: 'Blog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export function SiteHeader({ categories }: { categories: Category[] }) {
  const pathname = usePathname();
  const { itemCount, openDrawer, cartBump } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const isActive = useMemo(
    () => (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href)),
    [pathname],
  );

  return (
    <header className="header">
      <div className="container headerInner">
        <Link href="/" className="brand" onClick={() => setMobileOpen(false)}>
          <span className="brandMark">P</span>
          <span>
            <strong>PawTrip SA</strong>
            <small>Cleaner cars. Safer trips. Happier dogs.</small>
          </span>
        </Link>

        <nav className="desktopNav" aria-label="Primary">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className={cn('navLink', isActive(item.href) && 'navLinkActive')}>
              {item.label}
            </Link>
          ))}
          <div className="navDropdown">
            <span className="navLink">Categories</span>
            <div className="navDropdownMenu">
              {categories
                .filter((category) => category.slug !== 'all')
                .map((category) => (
                  <Link key={category.slug} href={`/shop/category/${category.slug}`} className="navDropdownItem">
                    {category.name}
                  </Link>
                ))}
            </div>
          </div>
        </nav>

        <div className="headerActions">
          <Link href="/shop" className="iconButton subtle" aria-label="Search products">
            <Search size={18} />
          </Link>
          <motion.button
            type="button"
            className="iconButton cartButton"
            aria-label="Open cart"
            onClick={openDrawer}
            animate={!reduceMotion && cartBump ? { scale: [1, 1.12, 1] } : undefined}
            transition={{ duration: 0.35 }}
          >
            <ShoppingBag size={18} />
            {itemCount > 0 ? <span className="cartCount">{itemCount}</span> : null}
          </motion.button>
          <button type="button" className="iconButton mobileOnly" aria-label="Open menu" onClick={() => setMobileOpen(true)}>
            <Menu size={18} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="mobileMenuBackdrop"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              className="mobileMenu"
              initial={reduceMotion ? false : { x: '100%' }}
              animate={reduceMotion ? undefined : { x: 0 }}
              exit={reduceMotion ? undefined : { x: '100%' }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mobileMenuHeader">
                <strong>Menu</strong>
                <button type="button" className="iconButton subtle" aria-label="Close menu" onClick={() => setMobileOpen(false)}>
                  <X size={18} />
                </button>
              </div>
              <div className="mobileMenuLinks">
                {nav.map((item) => (
                  <Link key={item.href} href={item.href} className="mobileMenuLink" onClick={() => setMobileOpen(false)}>
                    {item.label}
                  </Link>
                ))}
                <div className="mobileMenuGroupTitle">Categories</div>
                {categories
                  .filter((category) => category.slug !== 'all')
                  .map((category) => (
                    <Link
                      key={category.slug}
                      href={`/shop/category/${category.slug}`}
                      className="mobileMenuLink"
                      onClick={() => setMobileOpen(false)}
                    >
                      {category.name}
                    </Link>
                  ))}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
