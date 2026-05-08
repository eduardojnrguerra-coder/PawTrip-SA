import type { MetadataRoute } from 'next';
import { blogPosts, categories, products } from '@/lib/catalog';
import { collections } from '@/data/collections';
import { getSiteUrl } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  const staticRoutes = [
    '',
    '/shop',
    '/problems',
    '/find-my-kit',
    '/blog',
    '/about',
    '/shipping-returns',
    '/privacy',
    '/terms',
    '/contact',
    '/photo-guide',
    '/dog-road-trip-checklist-south-africa',
  ].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' || route === '/shop' ? ('weekly' as const) : ('monthly' as const),
    priority: route === '' ? 1 : route === '/shop' ? 0.9 : 0.6,
  }));

  const productRoutes = products.map((product) => ({
    url: `${base}/shop/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: product.featured ? 0.85 : 0.75,
  }));

  const categoryRoutes = categories
    .filter((category) => category.slug !== 'all')
    .map((category) => ({
      url: `${base}/shop/category/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority: post.sections.length > 1 ? 0.75 : 0.45,
  }));

  const collectionRoutes = collections.map((collection) => ({
    url: `${base}/collections/${collection.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.72,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...collectionRoutes, ...blogRoutes];
}
