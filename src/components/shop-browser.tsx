'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Category, Product } from '@/data/products';
import { ProductCard } from '@/components/product-card';

type SortMode = 'featured' | 'price-low' | 'price-high';

export function ShopBrowser({ products, categories }: { products: Product[]; categories: Category[] }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState<SortMode>('featured');
  const reduceMotion = useReducedMotion();

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    const result = products.filter((product) => {
      const matchesCategory =
        category === 'all' ||
        product.categorySlug === category ||
        (category === 'puppy-essentials' && (product.slug.includes('puppy') || product.tags.some((tag) => tag.toLowerCase().includes('puppy'))));
      const matchesQuery =
        !term ||
        product.name.toLowerCase().includes(term) ||
        product.shortDescription.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        (product.keywords ?? product.tags ?? []).some((keyword) => keyword.toLowerCase().includes(term));
      return matchesCategory && matchesQuery;
    });

    return result.sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      return Number(Boolean(b.featured)) - Number(Boolean(a.featured));
    });
  }, [category, products, query, sort]);

  return (
    <div>
      <motion.div className="shopFilters shopFiltersPremium" initial={reduceMotion ? false : { opacity: 0, y: 14 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}>
        <label className="searchField premiumSearch">
          <Search size={18} />
          <input className="input inputInline" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search products, kits or problems" />
        </label>

        <div className="shopFilterTopline">
          <span>
            <SlidersHorizontal size={16} /> {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </span>
          <label className="sortControl">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price low-high</option>
              <option value="price-high">Price high-low</option>
            </select>
          </label>
        </div>

        <div className="chipRow animatedFilterRow">
          {categories.map((item) => (
            <motion.button
              key={item.slug}
              type="button"
              className={category === item.slug ? 'chip chipSelected' : 'chip'}
              onClick={() => setCategory(item.slug)}
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            >
              {item.name}
            </motion.button>
          ))}
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length ? (
          <motion.div className="productGrid" key={`${category}-${sort}-${query || 'all'}`} initial={reduceMotion ? false : { opacity: 0 }} animate={reduceMotion ? undefined : { opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} transition={{ duration: 0.2 }}>
            {filtered.map((product, index) => (
              <motion.div key={product.slug} initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.22, delay: Math.min(index * 0.025, 0.18) }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div className="emptyState contentCard" key="empty" initial={reduceMotion ? false : { opacity: 0, y: 12 }} animate={reduceMotion ? undefined : { opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0 }}>
            <Search size={34} />
            <h2>No products found</h2>
            <p>Try a broader search, clear the category filter, or look for travel, grooming, feeding or toys.</p>
            <button
              type="button"
              className="button buttonPrimary"
              onClick={() => {
                setQuery('');
                setCategory('all');
              }}
            >
              Clear filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
