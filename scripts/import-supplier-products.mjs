import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'src', 'data', 'product-imports', 'supplier-products.csv');
const outputPath = path.join(root, 'src', 'data', 'product-imports', 'generated-products.ts');

const allowedShippingClasses = new Set(['small', 'standard', 'bulky', 'oversized']);
const allowedAvailability = new Set(['in_stock', 'checking_availability', 'made_to_order', 'unavailable']);
const allowedPermission = new Set(['needs_supplier_images', 'supplier_permission_confirmed', 'original_photos_needed']);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      quoted = !quoted;
      continue;
    }

    if (char === ',' && !quoted) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function splitList(value) {
  return String(value || '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
}

function toNumber(value, field, slug) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(`${slug || 'unknown row'} has invalid ${field}: "${value}".`);
  }
  return parsed;
}

function toBoolean(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function categorySlugFor(category) {
  const normalised = category.trim().toLowerCase();
  if (normalised.includes('travel')) return 'travel-kits';
  if (normalised.includes('car')) return 'car-protection';
  if (normalised.includes('toy')) return 'toys';
  if (normalised.includes('treat') || normalised.includes('chew')) return 'treats-chews';
  if (normalised.includes('groom')) return 'grooming';
  if (normalised.includes('bowl') || normalised.includes('feeding')) return 'bowls-feeding';
  if (normalised.includes('bed') || normalised.includes('comfort')) return 'beds-comfort';
  if (normalised.includes('walk') || normalised.includes('leash') || normalised.includes('harness')) return 'walking-gear';
  if (normalised.includes('puppy')) return 'puppy-essentials';
  return 'travel-kits';
}

function readProducts() {
  const text = fs.readFileSync(inputPath, 'utf8');
  const [headers, ...rows] = parseCsv(text);
  const fields = headers.map((header) => header.trim());

  return rows.map((cells) => {
    const row = Object.fromEntries(fields.map((field, index) => [field, cells[index]?.trim() ?? '']));
    const slug = row.slug;
    if (!slug || !row.name) throw new Error('Every product row needs at least slug and name.');

    const shippingClass = row.shippingClass || 'standard';
    const availability = row.availability || 'checking_availability';
    const sourcePermissionStatus = row.sourcePermissionStatus || 'needs_supplier_images';

    if (!allowedShippingClasses.has(shippingClass)) throw new Error(`${slug} has invalid shippingClass: ${shippingClass}.`);
    if (!allowedAvailability.has(availability)) throw new Error(`${slug} has invalid availability: ${availability}.`);
    if (!allowedPermission.has(sourcePermissionStatus)) throw new Error(`${slug} has invalid sourcePermissionStatus: ${sourcePermissionStatus}.`);

    const images = [row.image1, row.image2, row.image3].filter(Boolean);
    const benefits = splitList(row.benefits);
    const features = splitList(row.features);
    const bestFor = splitList(row.bestFor);
    const dimensions = splitList(row.dimensions);

    return {
      slug,
      id: slug,
      name: row.name,
      price: toNumber(row.price, 'price', slug),
      compareAtPrice: toNumber(row.compareAtPrice || row.price, 'compareAtPrice', slug),
      category: row.category,
      categorySlug: categorySlugFor(row.category),
      categoryName: row.category,
      subcategory: row.category,
      image: images[0] || '/products/placeholder-brand.svg',
      gallery: images.length ? images : ['/products/placeholder-brand.svg'],
      galleryImages: images.length ? images : ['/products/placeholder-brand.svg'],
      shortDescription: row.shortDescription,
      fullDescription: row.fullDescription,
      benefits,
      features,
      bestFor,
      notIdealFor: ['Products without confirmed supplier specifications.', 'Customers who need guaranteed fit before measurements are checked.'],
      qualityNotes: [
        'Imported supplier product. Confirm specifications, samples and photo permission before setting launchVisible to true.',
        'Check material, stitching, fasteners and packaging before launch.',
      ],
      material: row.material,
      dimensions,
      measurements: dimensions,
      compatibility: ['Confirm fit against supplier measurements before launch.'],
      whatsIncluded: [row.name],
      howToUse: ['Confirm usage instructions with the supplier before publishing.', 'Add practical PawTrip SA usage notes after sample testing.'],
      careInstructions: ['Confirm care instructions with the supplier before publishing.'],
      deliveryNote: 'Delivery estimates depend on product availability and customer location.',
      returnNote: 'Unused items can be returned in line with our returns policy.',
      seoTitle: row.seoTitle,
      seoDescription: row.seoDescription,
      tags: [row.category, ...bestFor].filter(Boolean),
      isBundle: row.category.toLowerCase().includes('kit'),
      relatedProductSlugs: [],
      sourcePermissionStatus,
      availability,
      shippingClass,
      imageReady: toBoolean(row.imageReady),
      launchVisible: toBoolean(row.launchVisible),
      problemsSolved: benefits.length ? benefits : [row.shortDescription],
      faqs: [
        {
          question: `Is ${row.name.toLowerCase()} ready to launch?`,
          answer: 'Only publish once supplier details, image rights, price and availability have been checked.',
        },
        {
          question: 'How are delivery estimates handled?',
          answer: 'Delivery estimates depend on product availability and customer location.',
        },
      ],
      supplierCostEstimate: toNumber(row.supplierCost || 0, 'supplierCost', slug),
      supplierNotes: 'Imported from supplier-products.csv. Review before adding to live catalogue.',
      supplierName: row.supplierName,
      supplierUrl: row.supplierUrl,
    };
  });
}

const importedProducts = readProducts();
const file = `// Generated by scripts/import-supplier-products.mjs. Review before merging into src/data/products.ts.
// Do not expose supplierCostEstimate, supplierName or supplierUrl in public UI.
import type { InternalProduct } from '@/data/products';

export const importedSupplierProducts = ${JSON.stringify(importedProducts, null, 2)} satisfies InternalProduct[];
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, file);
console.log(`Generated ${path.relative(root, outputPath)} with ${importedProducts.length} product(s).`);
