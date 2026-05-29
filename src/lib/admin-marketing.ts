import type { DbCategory, DbProduct, DbProductCustomOption, DbProductVariant } from '@/lib/supabase/admin';
import { problemPageDefinitions } from '@/lib/problem-seo';

export type AdminMarketingProduct = DbProduct & {
  categories?: Pick<DbCategory, 'id' | 'name' | 'slug'> | null;
  product_variants?: Pick<DbProductVariant, 'id' | 'active' | 'stock_quantity'>[] | null;
  product_custom_options?: Pick<DbProductCustomOption, 'id' | 'active'>[] | null;
};

export type ProductReadinessResult = {
  score: number;
  warnings: string[];
  matchedProblems: string[];
  hasImage: boolean;
  hasSeo: boolean;
  hasStock: boolean;
  marginWarning: boolean;
};

function hasText(value: unknown, minLength = 1) {
  return typeof value === 'string' && value.trim().length >= minLength;
}

function hasList(value: unknown) {
  return Array.isArray(value) && value.some((entry) => typeof entry === 'string' && entry.trim().length > 0);
}

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function productText(product: AdminMarketingProduct) {
  return normalise(
    [
      product.title,
      product.slug,
      product.short_description,
      product.description,
      product.categories?.name,
      product.categories?.slug,
      ...(product.tags ?? []),
      ...(product.benefits ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

export function getAdminProductProblemMatches(product: AdminMarketingProduct) {
  const text = productText(product);
  const categorySlug = product.categories?.slug ?? '';

  return problemPageDefinitions.filter((problem) => {
    if (categorySlug && problem.categorySlugs.includes(categorySlug)) return true;
    return problem.keywords.some((keyword) => text.includes(normalise(keyword)));
  });
}

export function getAdminProductReadiness(product: AdminMarketingProduct): ProductReadinessResult {
  const activeVariants = product.product_variants?.filter((variant) => variant.active) ?? [];
  const hasVariantStock = activeVariants.length ? activeVariants.some((variant) => Number(variant.stock_quantity || 0) > 0) : false;
  const hasStock = activeVariants.length ? hasVariantStock : Number(product.stock_quantity || 0) > 0;
  const hasImage = Boolean(product.main_image_url || product.gallery_image_urls?.some(Boolean));
  const hasSeo = hasText(product.seo_title, 20) && hasText(product.seo_description, 50);
  const matchedProblems = getAdminProductProblemMatches(product).map((problem) => problem.title);
  const marginWarning = product.cost_price !== null && Number(product.cost_price) > 0 && Number(product.price || 0) <= Number(product.cost_price);
  const checks = [
    { label: 'Missing title', passed: hasText(product.title), points: 8 },
    { label: 'Missing slug', passed: hasText(product.slug), points: 8 },
    { label: 'Price is missing or zero', passed: Number(product.price || 0) > 0, points: 8 },
    { label: 'Compare-at price missing', passed: product.compare_at_price !== null && Number(product.compare_at_price) > Number(product.price || 0), points: 5 },
    { label: 'Cost price missing', passed: product.cost_price !== null && Number(product.cost_price) > 0, points: 6 },
    { label: 'No stock available', passed: hasStock, points: 8 },
    { label: 'Missing category', passed: Boolean(product.category_id || product.categories?.slug), points: 8 },
    { label: 'Missing product image', passed: hasImage, points: 10 },
    { label: 'Short description is thin', passed: hasText(product.short_description, 40), points: 7 },
    { label: 'Full description is thin', passed: hasText(product.description, 120), points: 8 },
    { label: 'Missing benefit bullets', passed: hasList(product.benefits), points: 7 },
    { label: 'Missing tags or best-for terms', passed: hasList(product.tags), points: 5 },
    { label: 'Missing SEO title', passed: hasText(product.seo_title, 20), points: 5 },
    { label: 'Missing SEO meta description', passed: hasText(product.seo_description, 50), points: 5 },
    { label: 'No computed problem links assigned', passed: matchedProblems.length > 0, points: 7 },
    { label: 'Margin looks low', passed: !marginWarning, points: 5 },
  ];
  const total = checks.reduce((sum, check) => sum + check.points, 0);
  const earned = checks.reduce((sum, check) => sum + (check.passed ? check.points : 0), 0);

  return {
    score: Math.round((earned / total) * 100),
    warnings: checks.filter((check) => !check.passed).map((check) => check.label),
    matchedProblems,
    hasImage,
    hasSeo,
    hasStock,
    marginWarning,
  };
}
