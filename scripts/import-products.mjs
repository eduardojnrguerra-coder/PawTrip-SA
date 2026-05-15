import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const inputPath = path.join(root, 'src', 'data', 'product-imports', 'products.csv');
const outputPath = path.join(root, 'src', 'data', 'product-imports', 'products-generated.ts');

const allowedShippingClasses = new Set(['small', 'standard', 'bulky', 'oversized']);
const allowedAvailability = new Set(['in_stock', 'checking_availability', 'made_to_order', 'unavailable']);

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

function deriveType(category) {
  const normalised = category.trim().toLowerCase();
  const slug = categorySlugFor(category);
  if (slug === 'travel-kits' || slug === 'car-protection') return 'accessory';
  if (slug === 'toys') return 'toy';
  if (slug === 'treats-chews') return 'treat';
  if (slug === 'grooming') return 'grooming';
  if (slug === 'bowls-feeding') return 'feeding';
  if (slug === 'beds-comfort') return 'comfort';
  if (slug === 'walking-gear') return 'walking';
  if (slug === 'puppy-essentials') return 'accessory';
  return undefined;
}

function readProducts() {
  const text = fs.readFileSync(inputPath, 'utf8');
  const [headers, ...rows] = parseCsv(text);
  const fields = headers.map((header) => header.trim());

  return rows.map((cells) => {
    const row = Object.fromEntries(fields.map((field, index) => [field, cells[index]?.trim() ?? '']));
    const slug = row.slug;
    if (!slug || !row.name) {
      console.warn(`Skipping row: missing slug or name`);
      return null;
    }

    const shippingClass = row.shippingClass || 'standard';
    const availability = row.availability || 'checking_availability';

    if (!allowedShippingClasses.has(shippingClass)) {
      throw new Error(`${slug} has invalid shippingClass: ${shippingClass}.`);
    }
    if (!allowedAvailability.has(availability)) {
      throw new Error(`${slug} has invalid availability: ${availability}.`);
    }

    const images = [row.image1, row.image2, row.image3].filter(Boolean);
    const image = images[0] || '/products/placeholder-brand.svg';
    const gallery = images.length ? images : ['/products/placeholder-brand.svg'];

    const benefits = splitList(row.benefits);
    const features = splitList(row.features);
    const bestFor = splitList(row.bestFor);
    const dimensions = splitList(row.dimensions);

    const name = row.name;
    const category = row.category || 'General';
    const categorySlug = categorySlugFor(category);
    const isBundle = name.toLowerCase().includes('kit');

    const deliveryNote = 'Delivery estimates depend on product availability and customer location.';
    const returnNote = 'Unused items can be returned in line with our returns policy.';

    return {
      slug,
      id: slug,
      name,
      price: toNumber(row.price, 'price', slug),
      compareAtPrice: toNumber(row.compareAtPrice || row.price, 'compareAtPrice', slug),
      category,
      subcategory: category,
      categorySlug,
      categoryName: category,
      image,
      gallery,
      galleryImages: gallery,
      shortDescription: row.shortDescription || name,
      fullDescription: row.fullDescription || row.shortDescription || name,
      benefits,
      features,
      bestFor,
      notIdealFor: [
        'Products without confirmed supplier specifications.',
        'Customers who need guaranteed fit before measurements are checked.',
      ],
      qualityNotes: [
        'Imported product. Confirm specifications, samples and photo permission before setting launchVisible to true.',
        'Check material, packaging and pricing before launch.',
      ],
      material: row.material || 'Material details to be confirmed with the supplier.',
      dimensions,
      measurements: dimensions,
      compatibility: ['Confirm fit against product measurements before ordering.'],
      whatsIncluded: [name],
      howToUse: [
        'Check the product details before first use.',
        'Follow care and safety instructions.',
      ],
      careInstructions: [
        'Clean according to material guidelines.',
        'Store in a dry place when not in use.',
      ],
      deliveryNote,
      returnNote,
      seoTitle: row.seoTitle || `${name} South Africa | PawTrip SA`,
      seoDescription: row.seoDescription || `Shop ${name.toLowerCase()} in South Africa.`,
      tags: [category, ...bestFor].filter(Boolean),
      isBundle,
      relatedProductSlugs: [],
      sourcePermissionStatus: 'original_photos_needed',
      availability,
      shippingClass,
      imageReady: toBoolean(row.imageReady),
      launchVisible: toBoolean(row.launchVisible),
      problemsSolved: benefits.length ? benefits : [row.shortDescription || name],
      faqs: [
        {
          question: `Is ${name.toLowerCase()} suitable for everyday use?`,
          answer: 'Yes, it is intended as a practical everyday product.',
        },
        {
          question: 'How should I care for it?',
          answer: 'Follow the care instructions and keep it clean and dry between uses.',
        },
      ],
      type: deriveType(category),
      longDescription: row.fullDescription || row.shortDescription || name,
      included: [name],
      care: [
        'Clean according to material guidelines.',
        'Store in a dry place when not in use.',
      ],
      returnsNote: returnNote,
      keywords: [category, ...bestFor].filter(Boolean),
      supplierCostEstimate: toNumber(row.supplierCost || 0, 'supplierCost', slug),
      supplierNotes: 'Imported from products.csv. Review before publishing.',
      supplierName: row.sourceStore || '',
      supplierUrl: row.sourceUrl || '',
    };
  }).filter(Boolean);
}

const importedProducts = readProducts();
const file = `// Generated by scripts/import-products.mjs. Do not edit manually.
// Add products by adding rows to src/data/product-imports/products.csv.
import type { InternalProduct } from '@/data/products';

export const importedCsvProducts = ${JSON.stringify(importedProducts, null, 2)} satisfies InternalProduct[];
`;

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, file);
console.log(`Generated ${path.relative(root, outputPath)} with ${importedProducts.length} product(s).`);
