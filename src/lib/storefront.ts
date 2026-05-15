import { categories as fallbackCategories, publicProducts as fallbackProducts, type Category, type Product } from '@/data/products';
import { blogPosts } from '@/data/blog';
import { categorySeoCopy } from '@/data/products';
import {
  listActiveCategories,
  listPublicProductsWithCategories,
  type DbCategory,
  type DbProduct,
  type DbProductFaq,
} from '@/lib/supabase/admin';

export { blogPosts, categorySeoCopy };

type ProductRecord = DbProduct & { categories?: DbCategory | null; product_faqs?: DbProductFaq[] | null };

const placeholderImage = '/products/placeholder-brand.jpg';

function normaliseCategorySlug(name: string) {
  const slug = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (slug.includes('car')) return 'car-protection';
  if (slug.includes('travel')) return 'travel-kits';
  if (slug.includes('toy')) return 'toys';
  if (slug.includes('treat')) return 'treats-chews';
  if (slug.includes('groom')) return 'grooming';
  if (slug.includes('feed') || slug.includes('bowl')) return 'bowls-feeding';
  if (slug.includes('bed') || slug.includes('comfort') || slug.includes('mat')) return 'beds-comfort';
  if (slug.includes('walk') || slug.includes('lead') || slug.includes('leash') || slug.includes('harness')) return 'walking-gear';
  if (slug.includes('puppy')) return 'puppy-essentials';
  return 'travel-kits';
}

function mapCategory(row: DbCategory): Category {
  return {
    slug: normaliseCategorySlug(row.slug || row.name),
    name: row.name,
    description: row.description || `Browse ${row.name.toLowerCase()} at PawTrip SA.`,
  };
}

function mapProduct(row: ProductRecord): Product {
  const categoryName = row.categories?.name || 'Dog essentials';
  const categorySlug = normaliseCategorySlug(row.categories?.slug || categoryName);
  const mainImage = row.main_image_url || row.gallery_image_urls?.[0] || placeholderImage;
  const gallery = (row.gallery_image_urls?.filter(Boolean) ?? []).length
    ? row.gallery_image_urls!.filter(Boolean)
    : [mainImage];
  const benefits = row.benefits?.filter(Boolean) ?? [];
  const tags = row.tags?.filter(Boolean) ?? [];
  const description = row.description || row.short_description || 'Practical dog gear for everyday South African routines.';
  const faqs =
    row.product_faqs?.filter((faq) => faq.question && faq.answer).sort((a, b) => a.sort_order - b.sort_order).map((faq) => ({
      question: faq.question,
      answer: faq.answer,
    })) ?? [];
  const stockQuantity = Number.isFinite(row.stock_quantity) ? row.stock_quantity : 0;
  const availability = stockQuantity > 0 ? 'in_stock' : 'checking_availability';

  return {
    id: row.id,
    slug: row.slug,
    name: row.title,
    price: Number(row.price || 0),
    compareAtPrice: Number(row.compare_at_price ?? row.price ?? 0),
    category: categoryName,
    subcategory: categoryName,
    categorySlug,
    categoryName,
    image: mainImage,
    gallery,
    galleryImages: gallery,
    shortDescription: row.short_description || 'Practical product for everyday dog-owner routines.',
    fullDescription: description,
    benefits: benefits.length ? benefits : [row.short_description || 'Built to solve a practical everyday dog-owner problem.'],
    features: benefits.length ? benefits : ['Practical everyday use', 'PawTrip SA curated pick'],
    bestFor: tags.length ? tags.slice(0, 3) : ['Dog travel', 'Everyday routines'],
    notIdealFor: [],
    qualityNotes: ['Check measurements, photos and compatibility before ordering.', 'Selected for practical use rather than decorative novelty.'],
    material: 'Material details will be expanded as supplier-approved specifications are added.',
    dimensions: [],
    compatibility: [],
    measurements: [],
    whatsIncluded: row.is_bundle ? ['Bundle contents listed in the description and benefits.'] : [row.title],
    howToUse: ['Check fit and product details before use.', 'Clean and store according to the care notes for the product category.'],
    careInstructions: ['Wipe clean or wash as appropriate for the product material.', 'Allow the product to dry fully before storing where needed.'],
    deliveryNote: 'Delivery estimates depend on product availability and customer location.',
    returnNote: 'Unused items can be returned in line with our returns policy.',
    seoTitle: row.seo_title || row.title,
    seoDescription: row.seo_description || row.short_description || description,
    tags,
    isBundle: row.is_bundle,
    relatedProductSlugs: [],
    sourcePermissionStatus: 'supplier_permission_confirmed',
    availability,
    shippingClass: row.is_bundle ? 'bulky' : row.price > 1200 ? 'oversized' : row.price > 350 ? 'standard' : 'small',
    imageReady: Boolean(mainImage),
    launchVisible: row.is_active,
    featured: row.is_featured,
    problemsSolved: benefits.length ? benefits : ['Built to solve a practical dog-owner problem.'],
    faqs,
    longDescription: description,
    included: row.is_bundle ? ['See the product description and benefits for the included items.'] : [row.title],
    care: ['Refer to the product material and care notes.'],
    returnsNote: 'Unused items can be returned in line with our returns policy.',
    keywords: tags,
    type: row.is_bundle ? 'kit' : 'accessory',
    stockQuantity,
  };
}

async function loadDbCategories() {
  const result = await listActiveCategories();
  return result.data?.map(mapCategory) ?? [];
}

async function loadDbProducts() {
  const result = await listPublicProductsWithCategories();
  return result.data?.map(mapProduct) ?? [];
}

export async function getPublicCategories() {
  const categories = await loadDbCategories();
  const activeCategories = categories.length ? categories : fallbackCategories.filter((category) => category.slug !== 'all');
  return [{ slug: 'all', name: 'All products', description: 'Browse the full PawTrip SA range.' }, ...activeCategories];
}

export async function getPublicProducts() {
  const products = await loadDbProducts();
  return products.length ? products : fallbackProducts;
}

export async function getFeaturedProductsFromStore() {
  const products = await getPublicProducts();
  const featured = products.filter((product) => product.featured).slice(0, 8);
  return featured.length ? featured : products.slice(0, 8);
}

export async function getProductBySlugFromStore(slug: string) {
  const products = await getPublicProducts();
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getProductsByCategoryFromStore(categorySlug: string) {
  const products = await getPublicProducts();
  if (categorySlug === 'puppy-essentials') {
    return products.filter((product) => product.tags.some((tag) => tag.toLowerCase().includes('puppy')) || product.slug.includes('puppy'));
  }
  return products.filter((product) => product.categorySlug === categorySlug);
}

export async function getRelatedProductsFromStore(product: Product) {
  const products = await getPublicProducts();
  const explicit = product.relatedProductSlugs
    .map((slug) => products.find((entry) => entry.slug === slug))
    .filter(Boolean) as Product[];
  if (explicit.length) return explicit.slice(0, 4);
  return products.filter((entry) => entry.slug !== product.slug && entry.categorySlug === product.categorySlug).slice(0, 4);
}

export async function getPublicCatalogSnapshot() {
  const [categories, products] = await Promise.all([getPublicCategories(), getPublicProducts()]);
  return { categories, products };
}
