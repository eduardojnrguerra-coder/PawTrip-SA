import type { Metadata } from 'next';
import { ShopBrowser } from '@/components/shop-browser';
import { pageMetadata } from '@/lib/seo';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { getPublicCategories, getPublicProducts } from '@/lib/storefront';

export const metadata: Metadata = pageMetadata({
  title: 'Shop Dog Travel Accessories, Toys and Treats Online South Africa',
  description:
    'Browse PawTrip SA for dog car seat covers, dog travel bowls, toys, treats, grooming tools, walking gear and practical dog essentials in South Africa.',
  path: '/shop',
  keywords: ['dog toys online South Africa', 'dog treats online South Africa', 'dog travel accessories South Africa'],
});

export default async function ShopPage() {
  const [products, categories] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  const starterKits = products.filter((product) => product.isBundle).slice(0, 6);
  const individualProducts = products.filter((product) => !product.isBundle);

  return (
    <section className="section">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">Shop</span>
          <h1>Practical dog travel, comfort and care essentials.</h1>
          <p>Browse kits, accessories and everyday products built for cleaner cars and easier outings.</p>
        </div>
        <div className="sectionHeader sectionHeaderInline">
          <div>
            <span className="eyebrow">Starter kits</span>
            <h2>Bundles before individual add-ons.</h2>
            <p>Start with a kit if you want the simplest route to a useful travel, cleanup, puppy or enrichment setup.</p>
          </div>
        </div>
        <div className="productGrid starterKitGrid">
          {starterKits.map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.03}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
        <ShopBrowser products={individualProducts} categories={categories} />
      </div>
    </section>
  );
}
