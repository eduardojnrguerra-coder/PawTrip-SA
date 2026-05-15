import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import ts from 'typescript';

const root = process.cwd();
const moduleCache = new Map();
const nativeRequire = createRequire(import.meta.url);

function resolveLocalFile(specifier, fromFile) {
  if (specifier.startsWith('@/')) {
    return path.join(root, 'src', `${specifier.slice(2)}.ts`);
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    const resolved = path.resolve(path.dirname(fromFile), specifier);
    if (fs.existsSync(resolved)) return resolved;
    if (fs.existsSync(`${resolved}.ts`)) return `${resolved}.ts`;
    if (fs.existsSync(path.join(resolved, 'index.ts'))) return path.join(resolved, 'index.ts');
  }

  return null;
}

function loadTsModule(filePath) {
  const normalized = path.normalize(filePath);
  if (moduleCache.has(normalized)) return moduleCache.get(normalized);

  const source = fs.readFileSync(normalized, 'utf8');
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
    },
    fileName: normalized,
  }).outputText;

  const module = { exports: {} };
  moduleCache.set(normalized, module.exports);

  const sandbox = {
    module,
    exports: module.exports,
    process,
    console,
    __filename: normalized,
    __dirname: path.dirname(normalized),
    require: (specifier) => {
      const localFile = resolveLocalFile(specifier, normalized);
      if (localFile) {
        return loadTsModule(localFile);
      }

      if (specifier === 'next/link' || specifier === 'next/navigation' || specifier === 'next') {
        return {};
      }

      return nativeRequire(specifier);
    },
  };

  vm.runInNewContext(transpiled, sandbox, { filename: normalized });
  moduleCache.set(normalized, module.exports);
  return module.exports;
}

function fail(messages) {
  messages.forEach((message) => console.error(message));
  process.exit(1);
}

const catalog = loadTsModule(path.join(root, 'src/lib/catalog.ts'));
const data = loadTsModule(path.join(root, 'src/data/products.ts'));

const products = Array.isArray(catalog.products) ? catalog.products : [];
const categories = Array.isArray(catalog.categories) ? catalog.categories : [];
const errors = [];
const warnings = [];
const slugSet = new Set();

for (const product of products) {
  if (!product?.slug) {
    errors.push(`Product is missing a slug: ${product?.name ?? 'Unnamed product'}`);
    continue;
  }

  if (slugSet.has(product.slug)) {
    errors.push(`Duplicate product slug detected: ${product.slug}`);
  }
  slugSet.add(product.slug);

  if (!catalog.getProductBySlug(product.slug)) {
    errors.push(`Product slug does not resolve through getProductBySlug(): ${product.slug}`);
  }

  if (typeof product.price !== 'number' || Number.isNaN(product.price)) {
    warnings.push(`Product is missing a valid price and will fall back to R0: ${product.slug}`);
  }

  if (!product.categoryName && !product.category) {
    warnings.push(`Product is missing category display data: ${product.slug}`);
  }

  if (!product.shortDescription && !product.fullDescription) {
    warnings.push(`Product is missing both short and full description: ${product.slug}`);
  }

  if (!product.image && !(Array.isArray(product.galleryImages) && product.galleryImages.length)) {
    warnings.push(`Product is missing a primary image and gallery images: ${product.slug}`);
  }

  if (!Array.isArray(product.faqs) || product.faqs.length === 0) {
    warnings.push(`Product is missing FAQ entries and will use runtime fallbacks: ${product.slug}`);
  }

  const relatedSlugs = Array.isArray(product.relatedProductSlugs) ? product.relatedProductSlugs : [];
  for (const relatedSlug of relatedSlugs) {
    if (relatedSlug && !catalog.getProductBySlug(relatedSlug)) {
      warnings.push(`Related product slug is not publicly resolvable from ${product.slug}: ${relatedSlug}`);
    }
  }
}

const homeFeatured = typeof catalog.getFeaturedProducts === 'function' ? catalog.getFeaturedProducts() : [];
for (const product of homeFeatured) {
  if (!product?.slug || !catalog.getProductBySlug(product.slug)) {
    errors.push(`Homepage featured product link is invalid: ${product?.slug ?? product?.name ?? 'unknown'}`);
  }
}

const shopProducts = Array.isArray(data.publicProducts) ? data.publicProducts : products;
for (const product of shopProducts) {
  if (!product?.slug || !catalog.getProductBySlug(product.slug)) {
    errors.push(`Shop page product link is invalid: ${product?.slug ?? product?.name ?? 'unknown'}`);
  }
}

for (const category of categories.filter((entry) => entry.slug !== 'all')) {
  const categoryProducts = catalog.getProductsByCategory(category.slug);
  for (const product of categoryProducts) {
    if (!product?.slug || !catalog.getProductBySlug(product.slug)) {
      errors.push(`Category page product link is invalid for ${category.slug}: ${product?.slug ?? product?.name ?? 'unknown'}`);
    }
  }
}

if (errors.length) {
  fail(errors);
}

warnings.forEach((warning) => console.warn(warning));
console.log(`Validated ${products.length} public products across homepage, shop and category routes.`);
