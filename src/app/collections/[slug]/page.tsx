import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { collections, getCollectionBySlug } from '@/data/collections';
import { blogPosts, products } from '@/lib/catalog';
import { pageMetadata } from '@/lib/seo';

export function generateStaticParams() {
  return collections.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) return {};

  return pageMetadata({
    title: collection.seoTitle,
    description: collection.seoDescription,
    path: `/collections/${collection.slug}`,
    keywords: [collection.title.toLowerCase(), 'dog products South Africa', 'PawTrip SA'],
  });
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);
  if (!collection) notFound();

  const collectionProducts = collection.productSlugs
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter(Boolean);
  const guide = collection.guideSlug ? blogPosts.find((post) => post.slug === collection.guideSlug) : null;
  const bundles = collectionProducts.filter((product) => product!.isBundle);
  const individualProducts = collectionProducts.filter((product) => !product!.isBundle);

  return (
    <section className="section collectionPage">
      <div className="container">
        <div className="sectionHeader collectionHeader">
          <span className="eyebrow">{collection.eyebrow}</span>
          <h1>{collection.title}</h1>
          <p>{collection.description}</p>
          <div className="cardActions">
            <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
              Use the Kit Finder
            </Link>
            <Link href="/shop" className="button buttonSecondary buttonSheen">
              Shop all products
            </Link>
          </div>
        </div>

        {bundles.length ? (
          <>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Starter kits</span>
                <h2>Start with a complete setup.</h2>
                <p>Bundles group practical products around one use case so you can avoid overbuying small extras.</p>
              </div>
            </div>
            <div className="productGrid collectionProductGrid">
              {bundles.map((product, index) => (
                <Reveal key={product!.slug} delay={index * 0.03}>
                  <ProductCard product={product!} />
                </Reveal>
              ))}
            </div>
          </>
        ) : null}

        <div className="sectionHeader sectionHeaderInline">
          <div>
            <span className="eyebrow">Products</span>
            <h2>{bundles.length ? 'Complete the setup.' : 'Shop the collection.'}</h2>
            <p>Useful add-ons and individual products that fit this buying intent.</p>
          </div>
          {guide ? (
            <Link href={`/blog/${guide.slug}`} className="button buttonSecondary buttonSheen">
              Read guide
            </Link>
          ) : null}
        </div>

        <div className="productGrid">
          {(individualProducts.length ? individualProducts : collectionProducts).map((product, index) => (
            <Reveal key={product!.slug} delay={index * 0.03}>
              <ProductCard product={product!} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
