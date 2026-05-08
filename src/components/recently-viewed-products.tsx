'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/data/products';
import { ProductCard } from '@/components/product-card';

const RECENTLY_VIEWED_KEY = 'pawtrip-recently-viewed';

function readRecentlyViewed() {
  try {
    const raw = window.localStorage.getItem(RECENTLY_VIEWED_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function rememberRecentlyViewed(slug: string) {
  if (typeof window === 'undefined') return;
  const next = [slug, ...readRecentlyViewed().filter((item) => item !== slug)].slice(0, 8);
  window.localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
}

export function RecentlyViewedProducts({ products, currentSlug }: { products: Product[]; currentSlug?: string }) {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readRecentlyViewed());
  }, []);

  const viewed = useMemo(
    () =>
      slugs
        .filter((slug) => slug !== currentSlug)
        .map((slug) => products.find((product) => product.slug === slug))
        .filter(Boolean) as Product[],
    [currentSlug, products, slugs],
  );

  if (!viewed.length) return null;

  return (
    <section className="recentlyViewedBlock">
      <div className="sectionHeader">
        <span className="eyebrow">Recently viewed</span>
        <h2>Pick up where you left off.</h2>
      </div>
      <div className="relatedCarousel">
        {viewed.slice(0, 4).map((product) => (
          <ProductCard product={product} key={product.slug} />
        ))}
      </div>
    </section>
  );
}
