'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
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
  const [desktopCategoriesOpen, setDesktopCategoriesOpen] = useState(false);
  const [mobileCategoriesOpen, setMobileCategoriesOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const desktopDropdownRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();

  const isActive = useMemo(
    () => (href: string) => pathname === href || (href !== '/' && pathname.startsWith(href)),
    [pathname],
  );

  function clearCloseTimer() {
    if (!closeTimerRef.current) return;
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  }

  function scheduleDesktopClose() {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setDesktopCategoriesOpen(false);
      closeTimerRef.current = null;
    }, 240);
  }

  function openDesktopCategories() {
    clearCloseTimer();
    setDesktopCategoriesOpen(true);
  }

  function closeAllMenus() {
    clearCloseTimer();
    setDesktopCategoriesOpen(false);
    setMobileCategoriesOpen(false);
  }

  useEffect(() => {
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!desktopDropdownRef.current) return;
      const target = event.target as Node | null;
      if (target && desktopDropdownRef.current.contains(target)) return;
      setDesktopCategoriesOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeAllMenus();
        setMobileOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      clearCloseTimer();
    };
  }, []);

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
          <div
            className="navDropdown"
            ref={desktopDropdownRef}
            onMouseEnter={openDesktopCategories}
            onMouseLeave={scheduleDesktopClose}
          >
            <button
              type="button"
              className="navLink navDropdownTrigger"
              aria-haspopup="menu"
              aria-expanded={desktopCategoriesOpen}
              onClick={() => {
                clearCloseTimer();
                setDesktopCategoriesOpen((current) => !current);
              }}
              onFocus={openDesktopCategories}
            >
              Categories
            </button>
            <div
              className={desktopCategoriesOpen ? 'navDropdownMenu navDropdownMenuOpen' : 'navDropdownMenu'}
              role="menu"
              onMouseEnter={openDesktopCategories}
              onMouseLeave={scheduleDesktopClose}
            >
              {categories
                .filter((category) => category.slug !== 'all')
                .map((category) => (
                  <Link
                    key={category.slug}
                    href={`/shop/category/${category.slug}`}
                    className="navDropdownItem"
                    role="menuitem"
                    onClick={() => setDesktopCategoriesOpen(false)}
                  >
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
                  <Link
                    key={item.href}
                    href={item.href}
                    className="mobileMenuLink"
                    onClick={() => {
                      setMobileOpen(false);
                      setMobileCategoriesOpen(false);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  type="button"
                  className="mobileMenuGroupTitle mobileMenuCategoryToggle"
                  aria-expanded={mobileCategoriesOpen}
                  onClick={() => setMobileCategoriesOpen((current) => !current)}
                >
                  Categories
                </button>
                {mobileCategoriesOpen
                  ? categories
                      .filter((category) => category.slug !== 'all')
                      .map((category) => (
                        <Link
                          key={category.slug}
                          href={`/shop/category/${category.slug}`}
                          className="mobileMenuLink"
                          onClick={() => {
                            setMobileOpen(false);
                            setMobileCategoriesOpen(false);
                          }}
                        >
                          {category.name}
                        </Link>
                      ))
                  : null}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
