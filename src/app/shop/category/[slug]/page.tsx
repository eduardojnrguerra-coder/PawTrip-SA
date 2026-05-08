import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, categorySeoCopy, getCategoryBySlug, getProductsByCategory } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema, categoryMetadata } from '@/lib/seo';
import { EducationBlocks } from '@/components/education-blocks';
import { getEducationBlocksForCategory } from '@/lib/education';
import { collections } from '@/data/collections';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category || category.slug === 'all') return {};
  return categoryMetadata(category);
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category || category.slug === 'all') notFound();

  const products = getProductsByCategory(category.slug);
  const bundleProducts = products.filter((product) => product.isBundle);
  const individualProducts = products.filter((product) => !product.isBundle);
  const seo = categorySeoCopy[category.slug];
  const relatedGuides = blogPosts.filter((post) => post.category === category.name || post.category === category.name.replace(' & ', ' ') || post.title.toLowerCase().includes(category.name.toLowerCase().split(' ')[0])).slice(0, 3);
  const buyingIntentCollections = collections.filter((collection) =>
    collection.productSlugs.some((productSlug) => products.some((product) => product.slug === productSlug)),
  ).slice(0, 3);
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: category.name, path: `/shop/category/${category.slug}` },
  ];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={breadcrumbSchema(breadcrumbItems)} />
        <Breadcrumbs items={breadcrumbItems} />
        <div className="sectionHeader">
          <span className="eyebrow">Category</span>
          <h1>{category.name}</h1>
          <p>{category.description}</p>
        </div>

        <div className="contentCard detailBlock" style={{ marginBottom: 24 }}>
          <h2>{seo.title}</h2>
          <p>{seo.intro}</p>
          <p>{seo.body}</p>
        </div>

        <div className="internalLinkGrid">
          <div className="contentCard detailBlock">
            <h2>Top products in this category</h2>
            <div className="internalLinkList">
              {products.slice(0, 4).map((product) => (
                <Link href={`/shop/product/${product.slug}`} key={product.slug}>
                  <span>{product.name}</span>
                  <strong>Shop</strong>
                </Link>
              ))}
            </div>
          </div>
          <div className="contentCard detailBlock">
            <h2>Related guides</h2>
            <div className="internalLinkList">
              {(relatedGuides.length ? relatedGuides : blogPosts.slice(0, 3)).map((post) => (
                <Link href={`/blog/${post.slug}`} key={post.slug}>
                  <span>{post.title}</span>
                  <strong>Read</strong>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="contentCard detailBlock buyingIntentBlock">
          <span className="eyebrow">Buying intent</span>
          <h2>Not sure where to start?</h2>
          <p>These curated collections group products around the way customers usually shop, from first setups to low-ticket add-ons.</p>
          <div className="internalLinkList">
            {buyingIntentCollections.map((collection) => (
              <Link href={`/collections/${collection.slug}`} key={collection.slug}>
                <span>{collection.title}</span>
                <strong>View</strong>
              </Link>
            ))}
          </div>
        </div>

        {bundleProducts.length ? (
          <>
            <div className="sectionHeader">
              <span className="eyebrow">Bundles first</span>
              <h2>Start with a complete setup.</h2>
              <p>Bundles reduce guesswork by grouping products around a practical use case.</p>
            </div>
            <div className="productGrid" style={{ marginBottom: 32 }}>
              {bundleProducts.map((product, index) => (
                <Reveal key={product.slug} delay={index * 0.03}>
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          </>
        ) : null}

        <div className="sectionHeader">
          <span className="eyebrow">Which one should I choose?</span>
          <h2>Quick buying guidance.</h2>
        </div>
        <EducationBlocks blocks={getEducationBlocksForCategory(category.slug)} />

        <div className="productGrid">
          {(bundleProducts.length ? individualProducts : products).map((product, index) => (
            <Reveal key={product.slug} delay={index * 0.03}>
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
