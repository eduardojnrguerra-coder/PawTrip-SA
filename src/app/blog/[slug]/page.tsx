import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, products } from '@/lib/catalog';
import { BlogArticleContent } from '@/components/blog-article-content';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { blogPostingSchema, breadcrumbSchema, pageMetadata } from '@/lib/seo';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.seoTitle,
    description: post.seoDescription,
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    keywords: [post.category, ...post.relatedProductSlugs],
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();
  const relatedProducts = post.relatedProductSlugs
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter(Boolean) as typeof products;
  const recommendedProducts = (post.recommendedProductSlugs ?? post.relatedProductSlugs)
    .map((productSlug) => products.find((product) => product.slug === productSlug))
    .filter(Boolean) as typeof products;
  const ctaBundle = post.ctaBundleSlug ? products.find((product) => product.slug === post.ctaBundleSlug) : undefined;
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={[blogPostingSchema(post), breadcrumbSchema(breadcrumbItems)]} />
        <Breadcrumbs items={breadcrumbItems} />
        <BlogArticleContent post={post} relatedProducts={relatedProducts} recommendedProducts={recommendedProducts} ctaBundle={ctaBundle} />
      </div>
    </section>
  );
}
