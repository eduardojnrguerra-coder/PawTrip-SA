'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { CART_STORAGE_KEY, type CartItem } from '@/lib/cart';
import type { Product } from '@/data/products';
import { gaItem, trackEvent } from '@/lib/analytics';
import { triggerMascotReaction } from '@/lib/mascot-events';

type Toast = { id: string; message: string };

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  isDrawerOpen: boolean;
  addItem: (slug: string, quantity?: number) => void;
  decreaseItem: (slug: string) => void;
  removeItem: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  cartBump: number;
  products: Product[];
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function persistCart(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children, products }: { children: React.ReactNode; products: Product[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cartBump, setCartBump] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(readCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    persistCart(items);
  }, [hydrated, items]);

  function pushToast(message: string) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2800);
  }

  const api = useMemo<CartContextValue>(() => {
    const update = (slug: string, nextQuantity: number) => {
      setItems((current) => {
        const existing = current.find((item) => item.productSlug === slug);
        if (existing) {
          return current
            .map((item) => (item.productSlug === slug ? { ...item, quantity: nextQuantity } : item))
            .filter((item) => item.quantity > 0);
        }
        if (nextQuantity <= 0) return current;
        return [...current, { productSlug: slug, quantity: nextQuantity }];
      });
    };

    return {
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      isDrawerOpen,
      addItem: (slug: string, quantity = 1) => {
        setItems((current) => {
          const existing = current.find((item) => item.productSlug === slug);
          const next = existing
            ? current.map((item) => (item.productSlug === slug ? { ...item, quantity: item.quantity + quantity } : item))
            : [...current, { productSlug: slug, quantity }];
          return next;
        });
        setCartBump((value) => value + 1);
        const product = products.find((entry) => entry.slug === slug);
        if (product) {
          trackEvent('add_to_cart', {
            currency: 'ZAR',
            value: product.price * quantity,
            items: [gaItem(product, quantity)],
          });
        }
        triggerMascotReaction({ action: 'celebrate', message: 'Packed!' });
        pushToast(`${product?.name ?? 'Item'} added to cart`);
      },
      decreaseItem: (slug: string) => {
        setItems((current) =>
          current
            .map((item) => (item.productSlug === slug ? { ...item, quantity: item.quantity - 1 } : item))
            .filter((item) => item.quantity > 0),
        );
      },
      removeItem: (slug: string) => setItems((current) => current.filter((item) => item.productSlug !== slug)),
      setQuantity: update,
      clearCart: () => setItems([]),
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
      toasts,
      dismissToast: (id: string) => setToasts((current) => current.filter((toast) => toast.id !== id)),
      cartBump,
      products,
    };
  }, [cartBump, isDrawerOpen, items, products, toasts]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error('useCart must be used within CartProvider');
  }
  return value;
}
