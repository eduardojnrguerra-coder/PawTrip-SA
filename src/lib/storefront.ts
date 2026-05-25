import { categories as fallbackCategories, publicProducts as fallbackProducts, type Category, type Product } from '@/data/products';
import { blogPosts } from '@/data/blog';
import { categorySeoCopy } from '@/data/products';
import {
  listActiveCategories,
  listPublicKitsWithItems,
  listPublicProductsWithCategories,
  type DbCategory,
  type DbKit,
  type DbKitItem,
  type DbProduct,
  type DbProductCustomOption,
  type DbProductFaq,
  type DbProductVariant,
} from '@/lib/supabase/admin';

export { blogPosts, categorySeoCopy };

type ProductRecord = DbProduct & {
  categories?: DbCategory | null;
  product_faqs?: DbProductFaq[] | null;
  product_variants?: DbProductVariant[] | null;
  product_custom_options?: DbProductCustomOption[] | null;
};
type KitRecord = DbKit & { kit_items?: Array<DbKitItem & { products?: (DbProduct & { categories?: DbCategory | null }) | null }> | null };

const placeholderImage = '/products/placeholder-brand.jpg';

function normaliseCategorySlug(name: string) {
  const slug = name.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  if (slug.includes('car')) return 'car-protection';
  if (slug.includes('travel')) return 'travel-kits';
  if (slug.includes('toy')) return 'dog-toys';
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
    seoTitle: row.seo_title || undefined,
    seoDescription: row.seo_description || undefined,
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
  const variants =
    row.product_variants
      ?.filter((variant) => variant.option_value && variant.price)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((variant) => ({
        id: variant.id,
        optionName: variant.option_name || 'Size',
        optionValue: variant.option_value,
        price: Number(variant.price || 0),
        compareAtPrice: variant.compare_at_price === null ? null : Number(variant.compare_at_price),
        costPrice: variant.cost_price === null ? null : Number(variant.cost_price),
        sku: variant.sku,
        stockQuantity: Number.isFinite(variant.stock_quantity) ? variant.stock_quantity : 0,
        active: variant.active,
        sortOrder: variant.sort_order ?? 0,
      })) ?? [];
  const activeVariants = variants.filter((variant) => variant.active);
  const defaultVariant = activeVariants[0];
  const customOptions =
    row.product_custom_options
      ?.filter((option) => option.label)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((option) => ({
        id: option.id,
        label: option.label,
        inputType: option.input_type || 'text',
        required: option.required,
        helpText: option.help_text,
        placeholder: option.placeholder,
        maxLength: option.max_length,
        choices: option.choices?.filter(Boolean) ?? [],
        active: option.active,
        sortOrder: option.sort_order ?? 0,
      })) ?? [];
  const availability = activeVariants.length
    ? activeVariants.some((variant) => variant.stockQuantity > 0)
      ? 'in_stock'
      : 'unavailable'
    : stockQuantity > 0
      ? 'in_stock'
      : 'checking_availability';

  return {
    id: row.id,
    sku: defaultVariant?.sku || row.sku || row.id,
    slug: row.slug,
    name: row.title,
    price: defaultVariant ? defaultVariant.price : Number(row.price || 0),
    compareAtPrice: defaultVariant ? Number(defaultVariant.compareAtPrice ?? defaultVariant.price) : Number(row.compare_at_price ?? row.price ?? 0),
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
    stockQuantity: activeVariants.length ? activeVariants.reduce((sum, variant) => sum + variant.stockQuantity, 0) : stockQuantity,
    variants,
    customOptions,
  };
}

function mapKit(row: KitRecord): Product {
  const sortedItems = [...(row.kit_items ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const includedProducts = sortedItems
    .map((item) => {
      const product = item.products;
      if (!product) return null;
      const quantity = item.quantity > 1 ? ` x ${item.quantity}` : '';
      return `${product.title}${quantity}`;
    })
    .filter(Boolean) as string[];
  const compareAtPrice = Number(row.compare_at_price ?? row.price ?? 0);
  const image = row.image_url || placeholderImage;
  const bestFor = row.best_for?.filter(Boolean) ?? [];
  const shortDescription = row.short_description || 'A practical PawTrip SA bundle built around a real dog-owner problem.';
  const fullDescription = row.full_description || row.why_it_helps || shortDescription;
  const categoryName = row.category || 'Travel Kits';

  return {
    id: row.id,
    sku: `KIT-${row.slug}`,
    slug: row.slug,
    name: row.title,
    price: Number(row.price || 0),
    compareAtPrice,
    category: categoryName,
    subcategory: categoryName,
    categorySlug: 'travel-kits',
    categoryName,
    image,
    gallery: [image],
    galleryImages: [image],
    shortDescription,
    fullDescription,
    benefits: [row.why_it_helps || shortDescription, row.savings_text || 'Bundle selected to reduce product overload.'].filter(Boolean),
    features: ['Admin-managed kit', 'Manual kit pricing', 'Includes practical products'],
    bestFor: bestFor.length ? bestFor : ['Dog travel', 'Practical bundles'],
    notIdealFor: ['Owners who only need one small add-on.'],
    qualityNotes: ['Kit contents are fulfilled from the products listed in the bundle.', 'Check each included product for detailed material notes.'],
    material: 'Mixed materials across the included products.',
    dimensions: [],
    compatibility: [],
    measurements: [],
    whatsIncluded: includedProducts.length ? includedProducts : ['Included products will be confirmed before launch.'],
    howToUse: ['Use the included products together as a simple setup for the problem this kit solves.'],
    careInstructions: ['Follow the care instructions for each included product.'],
    deliveryNote: 'Delivery estimates depend on product availability and customer location.',
    returnNote: 'Unused items can be returned in line with our returns policy.',
    seoTitle: row.seo_title || `${row.title} South Africa | PawTrip SA`,
    seoDescription: row.seo_description || shortDescription,
    tags: ['kit', row.problem_key, row.badge_text].filter(Boolean) as string[],
    isBundle: true,
    relatedProductSlugs: sortedItems.map((item) => item.products?.slug).filter(Boolean) as string[],
    sourcePermissionStatus: image === placeholderImage ? 'original_photos_needed' : 'supplier_permission_confirmed',
    availability: sortedItems.some((item) => item.products && item.products.stock_quantity <= 0) ? 'checking_availability' : 'in_stock',
    shippingClass: 'bulky',
    imageReady: Boolean(row.image_url),
    launchVisible: row.active,
    featured: row.featured,
    problemsSolved: [row.why_it_helps || shortDescription],
    faqs: [
      {
        question: 'What is included in this kit?',
        answer: includedProducts.length ? includedProducts.join(', ') : 'The included products are listed on this page and may be updated by PawTrip SA.',
      },
      {
        question: 'Can I buy the products separately?',
        answer: 'Yes. Included products can also be browsed individually where they are available in the shop.',
      },
    ],
    longDescription: fullDescription,
    included: includedProducts,
    care: ['Follow the care instructions for each included product.'],
    returnsNote: 'Unused items can be returned in line with our returns policy.',
    keywords: ['dog travel kit South Africa', 'dog bundle South Africa', row.title],
    type: 'kit',
    stockQuantity: sortedItems.length && sortedItems.every((item) => (item.products?.stock_quantity ?? 0) > 0) ? 20 : 0,
  };
}

async function loadDbCategories() {
  const result = await listActiveCategories();
  return result.data?.map(mapCategory) ?? [];
}

async function loadDbProducts() {
  const result = await listPublicProductsWithCategories();
  const productRows = result.data?.map(mapProduct) ?? [];
  const kitsResult = await listPublicKitsWithItems();
  const kitRows = kitsResult.data?.map(mapKit) ?? [];
  return [...kitRows, ...productRows];
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
