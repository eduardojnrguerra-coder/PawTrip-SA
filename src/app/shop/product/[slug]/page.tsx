import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductBySlug, getRelatedProducts } from '@/lib/catalog';
import { ProductDetailClient } from '@/components/product-detail-client';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { breadcrumbSchema, pageMetadata, productSchema } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return pageMetadata({
    title: product.seoTitle,
    description: product.seoDescription,
    path: `/shop/product/${product.slug}`,
    image: product.image,
    keywords: product.tags,
  });
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = getRelatedProducts(product);
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: product.categoryName, path: `/shop/category/${product.categorySlug}` },
    { name: product.name, path: `/shop/product/${product.slug}` },
  ];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={[productSchema(product), breadcrumbSchema(breadcrumbItems)]} />
        <Breadcrumbs items={breadcrumbItems} />
        <div className="detailPageHeader">
          <span className="eyebrow">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <p>{product.shortDescription}</p>
          <a className="chip" href={`/shop/category/${product.categorySlug}`}>
            Shop more {product.categoryName}
          </a>
        </div>
        <ProductDetailClient product={product} related={related} />
      </div>
    </section>
  );
}
