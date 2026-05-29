import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductDetailClient } from '@/components/product-detail-client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema, faqSchema, pageMetadata, productSchema } from '@/lib/seo';
import { getProductBySlugFromStore, getPublicProducts, getRelatedProductsFromStore } from '@/lib/storefront';
import { getGuideLinksForProduct, getProblemLinksForProduct } from '@/lib/problem-seo';

export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  const products = await getPublicProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlugFromStore(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.seoTitle || product.name || 'PawTrip SA product',
    description:
      product.seoDescription ||
      product.shortDescription ||
      product.fullDescription ||
      'Practical dog travel and everyday pet gear for South African pet owners.',
    path: `/shop/product/${product.slug}`,
    image: product.image,
    keywords: product.tags ?? [],
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlugFromStore(slug);
  if (!product) notFound();

  const related = await getRelatedProductsFromStore(product);
  const relatedProblems = getProblemLinksForProduct(product);
  const relatedGuides = getGuideLinksForProduct(product);
  const faqs = Array.isArray(product.faqs) ? product.faqs.filter((faq) => faq?.question && faq?.answer).slice(0, 5) : [];
  const categoryName = product.categoryName || product.category || 'Dog essentials';
  const shortDescription =
    product.shortDescription || product.fullDescription || 'Practical dog travel and everyday pet gear for South African pet owners.';
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: categoryName, path: `/shop/category/${product.categorySlug}` },
    { name: product.name || 'PawTrip SA product', path: `/shop/product/${product.slug}` },
  ];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbItems), ...(faqs.length ? [faqSchema(faqs)] : [])]} />
        <Breadcrumbs items={breadcrumbItems} />
        <div className="detailPageHeader">
          <span className="eyebrow">{categoryName}</span>
          <h1>{product.name || 'PawTrip SA product'}</h1>
          <p>{shortDescription}</p>
          <a className="chip" href={`/shop/category/${product.categorySlug}`}>
            Shop more {categoryName}
          </a>
        </div>
        <ProductDetailClient product={product} related={related} relatedProblems={relatedProblems} relatedGuides={relatedGuides} />
      </div>
    </section>
  );
}
