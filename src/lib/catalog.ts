import { blogArticles, categories, categorySeoCopy, publicProducts, products as allProducts, type CategorySlug, type Product } from '@/data/products';
import { blogPosts } from '@/data/blog';
export { calculateDeliveryFee, formatZar } from '@/lib/money';

export const products = publicProducts;
export const allProductsForOperations = allProducts;
export { blogPosts } from '@/data/blog';
export { categories, categorySeoCopy };

export function getProductBySlug(slug: string) {
  return publicProducts.find((product) => product.slug === slug);
}

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getProductsByCategory(slug: CategorySlug) {
  if (slug === 'puppy-essentials') {
    return publicProducts.filter((product) => product.tags.some((tag) => tag.toLowerCase().includes('puppy')) || product.slug.includes('puppy'));
  }
  return publicProducts.filter((product) => product.categorySlug === slug);
}

export function getRelatedProducts(product: Product) {
  const explicit = product.relatedProductSlugs
    .map((slug) => publicProducts.find((entry) => entry.slug === slug))
    .filter(Boolean) as Product[];
  if (explicit.length) return explicit.slice(0, 4);
  return publicProducts
    .filter((entry) => entry.slug !== product.slug && entry.categorySlug === product.categorySlug)
    .slice(0, 4);
}

export function getFeaturedProducts() {
  return publicProducts.filter((product) => product.featured);
}

export function searchProducts(query: string, categorySlug?: string) {
  const term = query.trim().toLowerCase();
  return publicProducts.filter((product) => {
    const matchesCategory = !categorySlug || categorySlug === 'all' || product.categorySlug === categorySlug;
    const matchesQuery =
      !term ||
      product.name.toLowerCase().includes(term) ||
      product.shortDescription.toLowerCase().includes(term) ||
      (product.keywords ?? product.tags ?? []).some((keyword) => keyword.toLowerCase().includes(term));
    return matchesCategory && matchesQuery;
  });
}

export function getBlogPostBySlug(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getBlogArticles() {
  return blogArticles;
}
