import type { Metadata } from 'next';
import type { BlogPost } from '@/data/blog';
import type { Category, Product } from '@/data/products';
import { getSiteUrl, siteDescription, siteName, siteTagline } from '@/lib/site';

export const defaultOgImage = '/opengraph-image';

export function absoluteUrl(path = '/') {
  const base = getSiteUrl().replace(/\/$/, '');
  const route = path.startsWith('/') ? path : `/${path}`;
  return `${base}${route}`;
}

export function absoluteImageUrl(path: string) {
  if (path.startsWith('http')) return path;
  return absoluteUrl(path);
}

export function pageMetadata(input: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: 'website' | 'article';
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(input.path);
  const image = absoluteImageUrl(input.image ?? defaultOgImage);
  const title = input.title.includes(siteName) ? input.title : `${input.title} | ${siteName}`;

  return {
    title: {
      absolute: title,
    },
    description: input.description,
    keywords: input.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: input.type ?? 'website',
      siteName,
      title,
      description: input.description,
      url,
      images: [{ url: image, width: 1200, height: 630, alt: `${siteName} - ${input.title}` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: input.description,
      images: [image],
    },
  };
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: absoluteUrl('/'),
    slogan: siteTagline,
    description: siteDescription,
    email: 'support@pawtripsa.co.za',
    areaServed: {
      '@type': 'Country',
      name: 'South Africa',
    },
    sameAs: [],
  };
}

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: absoluteUrl('/'),
    description: siteDescription,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl('/shop')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

export function productSchema(product: Product) {
  const name = product.name || 'PawTrip SA product';
  const description = product.fullDescription || product.shortDescription || siteDescription;
  const galleryImages = Array.isArray(product.galleryImages) && product.galleryImages.length
    ? product.galleryImages
    : Array.isArray(product.gallery) && product.gallery.length
      ? product.gallery
      : product.image
        ? [product.image]
        : [defaultOgImage];
  const price = typeof product.price === 'number' && Number.isFinite(product.price) ? product.price : 0;
  const offer: Record<string, unknown> = {
    '@type': 'Offer',
    priceCurrency: 'ZAR',
    price: price.toFixed(2),
    url: absoluteUrl(`/shop/product/${product.slug}`),
    itemCondition: 'https://schema.org/NewCondition',
  };

  const isInStock = typeof product.stockQuantity === 'number' ? product.stockQuantity > 0 : product.availability === 'in_stock';

  offer.availability =
    isInStock
      ? 'https://schema.org/InStock'
      : product.availability === 'unavailable'
        ? 'https://schema.org/OutOfStock'
        : 'https://schema.org/PreOrder';

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: galleryImages.map(absoluteImageUrl),
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: 'PawTrip SA',
    },
    category: product.categoryName || product.category || 'Dog essentials',
    offers: offer,
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function blogPostingSchema(post: BlogPost) {
  const title = post.title || 'PawTrip SA Guide';
  const description = post.seoDescription || post.excerpt || siteDescription;
  const publishedDate = post.date || new Date().toISOString();
  const keywords = Array.isArray(post.targetKeywords) ? post.targetKeywords : [];

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    image: absoluteImageUrl(post.image || defaultOgImage),
    datePublished: publishedDate,
    dateModified: post.updatedAt ?? publishedDate,
    author: {
      '@type': 'Organization',
      name: siteName,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug || 'blog'}`),
    articleSection: post.category || 'PawTrip SA Guides',
    keywords,
  };
}

export function categoryMetadata(category: Category) {
  return pageMetadata({
    title: `${category.name} South Africa`,
    description: category.description,
    path: `/shop/category/${category.slug}`,
    keywords: [`${category.name.toLowerCase()} South Africa`, 'PawTrip SA', 'dog products South Africa'],
  });
}
