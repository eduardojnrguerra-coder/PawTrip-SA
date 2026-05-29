import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug } from '@/lib/catalog';
import { BlogArticleContent } from '@/components/blog-article-content';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { blogPostingSchema, breadcrumbSchema, faqSchema, pageMetadata } from '@/lib/seo';
import { blogPosts, getSafeBlogPost, getSafeBlogPostBySlug, publishedBlogPosts, validateBlogPost } from '@/data/blog';
import type { Product } from '@/data/products';
import { getPublicProducts } from '@/lib/storefront';

export function generateStaticParams() {
  return blogPosts.filter((post) => post.slug).map((post) => ({ slug: post.slug }));
}

function warnAboutBrokenBlogData(post: (typeof blogPosts)[number], productCatalog: Product[]) {
  if (process.env.NODE_ENV !== 'development') return;

  const productSlugs = new Set(productCatalog.map((product) => product.slug));
  const blogSlugs = new Set(blogPosts.map((entry) => entry.slug));
  const warnings: string[] = [];
  const relatedSlugs = Array.isArray(post.relatedProductSlugs) ? post.relatedProductSlugs : [];
  const recommendedSlugs = Array.isArray(post.recommendedProductSlugs) ? post.recommendedProductSlugs : [];
  const relatedArticleSlugs = Array.isArray(post.relatedArticleSlugs) ? post.relatedArticleSlugs : [];

  if (!post.image) warnings.push('Missing article image.');
  if (!Array.isArray(post.outline)) warnings.push('Missing outline array.');
  if (!Array.isArray(post.sections)) warnings.push('Missing sections array.');
  if (Array.isArray(post.sections) && post.sections.length < 3) warnings.push('Article has fewer than 3 sections.');

  relatedSlugs.forEach((productSlug) => {
    if (!productSlugs.has(productSlug)) warnings.push(`Missing related product slug: ${productSlug}.`);
  });

  recommendedSlugs.forEach((productSlug) => {
    if (!productSlugs.has(productSlug)) warnings.push(`Missing recommended product slug: ${productSlug}.`);
  });

  if (post.ctaBundleSlug && !productSlugs.has(post.ctaBundleSlug)) {
    warnings.push(`Missing CTA bundle slug: ${post.ctaBundleSlug}.`);
  }

  relatedArticleSlugs.forEach((articleSlug) => {
    if (!blogSlugs.has(articleSlug)) warnings.push(`Missing related article slug: ${articleSlug}.`);
  });

  if (warnings.length) {
    console.warn(`[PawTrip blog route warning] ${post.slug}`, warnings);
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getSafeBlogPostBySlug(slug);
  if (!post) return {};
  const relatedSlugs = Array.isArray(post.relatedProductSlugs) ? post.relatedProductSlugs : [];
  const targetKeywords = Array.isArray(post.targetKeywords) ? post.targetKeywords : [];
  return pageMetadata({
    title: post.seoTitle || post.title || 'PawTrip SA Guide',
    description: post.seoDescription || post.excerpt || 'Practical PawTrip SA dog travel and pet essentials guide.',
    path: `/blog/${post.slug}`,
    image: post.image,
    type: 'article',
    keywords: [post.category, ...targetKeywords, ...relatedSlugs].filter(Boolean),
  });
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sourcePost = getBlogPostBySlug(slug);
  const post = getSafeBlogPost(sourcePost);
  if (!sourcePost || !post) notFound();
  const productCatalog = await getPublicProducts();
  warnAboutBrokenBlogData(sourcePost, productCatalog);
  const relatedSlugs = Array.isArray(post.relatedProductSlugs) ? post.relatedProductSlugs : [];
  const recommendedSlugs =
    Array.isArray(post.recommendedProductSlugs) && post.recommendedProductSlugs.length
      ? post.recommendedProductSlugs
      : relatedSlugs;
  const relatedProducts = relatedSlugs
    .map((productSlug) => productCatalog.find((product) => product.slug === productSlug))
    .filter((product): product is Product => Boolean(product));
  const recommendedProducts = recommendedSlugs
    .map((productSlug) => productCatalog.find((product) => product.slug === productSlug))
    .filter((product): product is Product => Boolean(product));
  const relatedArticleSlugs = Array.isArray(post.relatedArticleSlugs) ? post.relatedArticleSlugs : [];
  const relatedArticles = relatedArticleSlugs
    .map((articleSlug) => publishedBlogPosts.find((article) => article.slug === articleSlug))
    .filter((article): article is (typeof publishedBlogPosts)[number] => Boolean(article));
  const ctaBundle = post.ctaBundleSlug ? productCatalog.find((product) => product.slug === post.ctaBundleSlug) : undefined;
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Blog', path: '/blog' },
    { name: post.title || 'PawTrip SA Guide', path: `/blog/${post.slug}` },
  ];
  const faqs = Array.isArray(post.faqs) ? post.faqs.filter((faq) => faq?.question && faq?.answer) : [];
  const schemaData = [blogPostingSchema(post), breadcrumbSchema(breadcrumbItems), ...(faqs.length ? [faqSchema(faqs)] : [])];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={schemaData} />
        <Breadcrumbs items={breadcrumbItems} />
        <BlogArticleContent
          post={post}
          relatedProducts={relatedProducts}
          recommendedProducts={recommendedProducts}
          relatedArticles={relatedArticles}
          ctaBundle={ctaBundle}
        />
      </div>
    </section>
  );
}
