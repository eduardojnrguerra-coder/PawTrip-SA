import type { BlogPost } from '@/data/blog';
import { publishedBlogPosts } from '@/data/blog';
import type { Category, Product } from '@/data/products';

export type ProblemFaq = {
  question: string;
  answer: string;
};

export type ProblemPageDefinition = {
  slug: string;
  title: string;
  eyebrow: string;
  seoTitle: string;
  seoDescription: string;
  heroIntro: string;
  problem: string;
  solution: string;
  body: string;
  bestFor: string[];
  categorySlugs: string[];
  productSlugs: string[];
  kitSlugs: string[];
  guideSlugs: string[];
  keywords: string[];
  faqs: ProblemFaq[];
  relatedProblemSlugs: string[];
};

export type SimpleInternalLink = {
  title: string;
  href: string;
  description?: string;
  label?: string;
};

export const problemPageDefinitions: ProblemPageDefinition[] = [
  {
    slug: 'dog-hair-in-car',
    title: 'Dog hair in the car',
    eyebrow: 'Car cleanup',
    seoTitle: 'Dog Hair In Car Solutions South Africa',
    seoDescription:
      'Shop practical dog car protection and pet hair cleanup products for South African dog owners dealing with hair in seats, boots and upholstery.',
    heroIntro: 'Reduce the hair that works into upholstery, boot carpet and back seats after regular dog trips.',
    problem: 'Hair works into upholstery, boot carpet and seat fabric after everyday drives.',
    solution: 'Start with car protection, then keep a hair remover or cleanup kit ready for quick resets.',
    body:
      'The best setup is simple: protect the surface your dog uses most, then keep cleaning tools nearby for the hair that still follows you home.',
    bestFor: ['Shedding dogs', 'Daily car trips', 'Back-seat travel'],
    categorySlugs: ['car-protection', 'grooming', 'travel-kits'],
    productSlugs: ['clean-car-kit', 'waterproof-dog-car-seat-cover', 'pet-hair-removal-brush', 'dog-hammock-back-seat-cover'],
    kitSlugs: ['clean-car-kit', 'road-trip-starter-kit'],
    guideSlugs: ['stop-dog-hair-taking-over-car', 'how-to-keep-car-clean-with-dogs', 'best-dog-car-seat-covers-south-africa'],
    keywords: ['hair', 'shedding', 'fur', 'upholstery', 'car clean', 'seat cover', 'hammock'],
    faqs: [
      {
        question: 'What helps most with dog hair in the car?',
        answer:
          'A fitted seat cover or boot liner catches most hair before it reaches fabric, while a pet hair remover helps with quick cleanup after trips.',
      },
      {
        question: 'Should I choose a hammock or boot liner?',
        answer:
          'Choose a hammock for back-seat travel and a boot liner for SUVs, hatchbacks or dogs that ride in the cargo area.',
      },
    ],
    relatedProblemSlugs: ['mud-and-beach-sand', 'scratched-seats', 'shedding-and-grooming'],
  },
  {
    slug: 'mud-and-beach-sand',
    title: 'Wet paws, mud and beach sand',
    eyebrow: 'Beach and mud control',
    seoTitle: 'Wet Paw And Beach Sand Dog Products South Africa',
    seoDescription:
      'Find dog travel accessories for wet paws, beach sand, muddy walks and easier car cleanup after South African outings.',
    heroIntro: 'Contain wet paws, salt water and sand before the return trip spreads mess through the car.',
    problem: 'Wet paws, salt water and beach sand make the ride home harder than the outing.',
    solution: 'Use a washable protection layer with drying and paw-cleaning add-ons before your dog jumps back in.',
    body:
      'Beach and park trips need a reset routine. A protected travel zone, towel and paw cleaner keep the cleanup manageable.',
    bestFor: ['Beach dogs', 'Wet paws', 'Weekend trips'],
    categorySlugs: ['travel-kits', 'car-protection', 'grooming'],
    productSlugs: ['beach-dog-kit', 'paw-cleaner-cup', 'dog-drying-towel', 'waterproof-dog-car-seat-cover'],
    kitSlugs: ['beach-dog-kit', 'clean-car-kit'],
    guideSlugs: ['best-dog-travel-accessories-beach-trips', 'beach-day-checklist-dog-owners', 'dog-road-trip-checklist-south-africa'],
    keywords: ['beach', 'sand', 'mud', 'wet paws', 'paw cleaner', 'towel', 'waterproof'],
    faqs: [
      {
        question: 'What should I pack for a beach trip with my dog?',
        answer:
          'A washable car protection layer, drying towel, paw cleaner and travel bowl cover the most common beach-trip mess.',
      },
      {
        question: 'Can these products stop all sand?',
        answer:
          'No product can stop every grain of sand, but the right setup keeps most of it on washable surfaces instead of car upholstery.',
      },
    ],
    relatedProblemSlugs: ['dog-hair-in-car', 'dog-car-travel', 'shedding-and-grooming'],
  },
  {
    slug: 'scratched-seats',
    title: 'Scratched seats and boot trim',
    eyebrow: 'Car protection',
    seoTitle: 'Dog Car Seat Protection South Africa',
    seoDescription:
      'Protect car seats, boot liners and upholstery from dog claws, movement, mud and everyday travel wear.',
    heroIntro: 'Protect the surfaces your dog touches most before claws and movement start marking the car.',
    problem: 'Claws and movement can mark seats, boot trim and cargo surfaces over time.',
    solution: 'Match the protection to your dog travel zone: back seat, hammock, SUV boot or cargo liner.',
    body:
      'Seat covers and boot liners make dog travel easier to clean up and help keep the car feeling cared for.',
    bestFor: ['SUV owners', 'Energetic dogs', 'Cargo-area travel'],
    categorySlugs: ['car-protection', 'travel-kits'],
    productSlugs: ['suv-protection-kit', 'dog-hammock-back-seat-cover', 'waterproof-dog-boot-seat-cover-with-side-protection'],
    kitSlugs: ['suv-protection-kit', 'road-trip-starter-kit'],
    guideSlugs: ['dog-hammock-vs-dog-seat-cover', 'suv-dog-boot-liners-south-africa', 'best-dog-car-seat-covers-south-africa'],
    keywords: ['scratch', 'seat protection', 'boot liner', 'cargo', 'hammock', 'car protection', 'suv'],
    faqs: [
      {
        question: 'What is better for an SUV: a hammock or boot liner?',
        answer:
          'A boot liner usually fits SUV cargo travel better, while a hammock is better for dogs riding on the back seat.',
      },
      {
        question: 'Will a cover protect against heavy chewing?',
        answer:
          'Car covers help with claws, hair and mud, but determined chewing needs supervision and a safer chew outlet.',
      },
    ],
    relatedProblemSlugs: ['dog-hair-in-car', 'dog-car-travel', 'senior-dog-access'],
  },
  {
    slug: 'dog-car-travel',
    title: 'Safer, calmer dog car travel',
    eyebrow: 'Travel setup',
    seoTitle: 'Dog Car Travel Products South Africa',
    seoDescription:
      'Shop practical dog car travel products in South Africa, including travel bowls, seat protection, tethers and road-trip kits.',
    heroIntro: 'Build a simple travel setup that keeps your dog more comfortable and your car easier to manage.',
    problem: 'Road trips can quickly turn into spills, loose gear, hair and unsettled dogs.',
    solution: 'Pair car protection with hydration, restraint basics and a small cleanup routine.',
    body:
      'A good travel setup is not complicated. It should help your dog settle, keep essentials close and make the car easier to reset.',
    bestFor: ['Road trips', 'Weekend outings', 'New travel routines'],
    categorySlugs: ['travel-kits', 'car-protection', 'bowls-feeding', 'walking-gear'],
    productSlugs: ['road-trip-starter-kit', 'collapsible-dog-travel-bowl', 'pet-seat-belt-clip', 'waterproof-dog-travel-blanket'],
    kitSlugs: ['road-trip-starter-kit', 'beach-dog-kit', 'senior-dog-travel-kit'],
    guideSlugs: ['dog-road-trip-checklist-south-africa', 'what-to-pack-road-trip-with-dog', 'weekend-away-with-dog-south-africa'],
    keywords: ['travel', 'road trip', 'car', 'seat belt', 'travel bowl', 'kit', 'hydration'],
    faqs: [
      {
        question: 'What do I need for a dog road trip?',
        answer:
          'Start with water, a travel bowl, a protected seat or boot area, cleanup supplies and a restraint option suited to your dog and car.',
      },
      {
        question: 'Can PawTrip SA help me choose a setup?',
        answer: 'Yes. The Kit Finder is built to suggest a practical setup based on your dog, car and routine.',
      },
    ],
    relatedProblemSlugs: ['mud-and-beach-sand', 'scratched-seats', 'dog-id-tags'],
  },
  {
    slug: 'bored-dog',
    title: 'Bored chewing and indoor energy',
    eyebrow: 'Enrichment',
    seoTitle: 'Dog Toys For Bored Dogs South Africa',
    seoDescription:
      'Shop chew toys, puzzle toys and enrichment picks for bored dogs, puppies and high-energy dogs in South Africa.',
    heroIntro: 'Give chewing, sniffing and food motivation a better outlet than furniture, shoes or car trim.',
    problem: 'Restlessness, chewing and attention-seeking often show up when dogs need better enrichment.',
    solution: 'Combine chew, sniffing and licking products so boredom has a safer, more useful outlet.',
    body:
      'A small toy rotation can help daily routines feel calmer, especially for puppies, indoor days and high-energy dogs.',
    bestFor: ['Indoor days', 'Chewers', 'High-energy dogs'],
    categorySlugs: ['dog-toys', 'toys', 'treats-chews', 'puppy-essentials'],
    productSlugs: ['boredom-buster-toy-kit', 'treat-dispensing-chew-toy', 'snuffle-mat', 'lick-mat'],
    kitSlugs: ['boredom-buster-toy-kit', 'puppy-starter-kit'],
    guideSlugs: ['best-toys-bored-dogs-destroy-everything', 'best-dog-toys-for-boredom', 'lick-mat-vs-snuffle-mat'],
    keywords: ['bored', 'chew', 'toy', 'enrichment', 'puzzle', 'snuffle', 'lick mat', 'puppy energy'],
    faqs: [
      {
        question: 'What toys are best for bored dogs?',
        answer:
          'A mix of chew toys, puzzle toys and sniffing or licking activities usually works better than one toy used every day.',
      },
      {
        question: 'Should dog toys be supervised?',
        answer:
          'Yes. Always supervise play and remove a toy if it becomes damaged or if small parts become loose.',
      },
    ],
    relatedProblemSlugs: ['puppy-training', 'fast-eating', 'dog-beds-comfort'],
  },
  {
    slug: 'fast-eating',
    title: 'Fast eating and messy feeding',
    eyebrow: 'Feeding',
    seoTitle: 'Slow Feeder Bowls And Dog Feeding Products South Africa',
    seoDescription:
      'Shop slow feeder bowls, travel bowls and feeding accessories for dogs that eat too fast or make a mess at mealtimes.',
    heroIntro: 'Make meals slower, cleaner and easier to manage at home or on the go.',
    problem: 'Some dogs rush meals and leave bowls, mats and floors messy.',
    solution: 'Use a slow feeder, feeding mat and practical bowl setup to bring more structure to mealtime.',
    body:
      'Feeding products should be easy to clean, stable and matched to your dog size and routine.',
    bestFor: ['Fast eaters', 'Messy feeding', 'Puppies'],
    categorySlugs: ['bowls-feeding', 'treats-chews', 'puppy-essentials'],
    productSlugs: ['slow-feeder-bowl', 'silicone-feeding-mat', 'no-spill-dog-travel-bowl', 'collapsible-dog-travel-bowl'],
    kitSlugs: ['puppy-starter-kit', 'road-trip-starter-kit'],
    guideSlugs: ['best-slow-feeder-bowls-dogs-south-africa', 'slow-feeder-vs-normal-bowl', 'best-dog-products-under-r250-south-africa'],
    keywords: ['feeding', 'slow feeder', 'bowl', 'fast eating', 'messy', 'treat', 'food'],
    faqs: [
      {
        question: 'When should I use a slow feeder?',
        answer:
          'A slow feeder can help when a dog rushes food, scatters meals or needs a more structured feeding routine.',
      },
      {
        question: 'Are travel bowls only for road trips?',
        answer:
          'No. Collapsible and no-spill bowls can also be useful for parks, beach trips, training days and weekends away.',
      },
    ],
    relatedProblemSlugs: ['dog-car-travel', 'bored-dog', 'puppy-training'],
  },
  {
    slug: 'dog-beds-comfort',
    title: 'Dog beds and everyday comfort',
    eyebrow: 'Home comfort',
    seoTitle: 'Dog Beds And Comfort Products South Africa',
    seoDescription:
      'Shop dog beds, mats and comfort products for puppies, senior dogs and everyday rest in South African homes.',
    heroIntro: 'Create a warmer, cleaner resting spot for dogs at home, in crates or between trips.',
    problem: 'Cold floors, crate discomfort and daily wear can make rest areas harder to manage.',
    solution: 'Choose washable mats, beds and comfort picks that fit your dog size and home routine.',
    body:
      'Comfort products should be sized properly, easy to clean and practical enough for everyday use.',
    bestFor: ['Cold floors', 'Senior comfort', 'Crates and travel'],
    categorySlugs: ['beds-comfort', 'puppy-essentials', 'travel-kits'],
    productSlugs: ['foldable-travel-dog-bed', 'soft-crate-mat', 'waterproof-dog-travel-blanket', 'senior-dog-travel-kit'],
    kitSlugs: ['senior-dog-travel-kit', 'puppy-starter-kit'],
    guideSlugs: ['dog-bed-size-guide', 'senior-dog-travel-comfort-guide', 'puppy-starter-kit-checklist-south-africa'],
    keywords: ['bed', 'mat', 'comfort', 'senior', 'crate', 'blanket', 'cold floor', 'winter'],
    faqs: [
      {
        question: 'How do I choose the right dog bed size?',
        answer:
          'Measure your dog while lying naturally and choose a bed or mat with enough room for their usual sleeping position.',
      },
      {
        question: 'Are washable dog mats worth it?',
        answer:
          'Yes, especially for puppies, senior dogs, travel routines and dogs that come inside after wet or dusty outings.',
      },
    ],
    relatedProblemSlugs: ['senior-dog-access', 'puppy-training', 'mud-and-beach-sand'],
  },
  {
    slug: 'dog-id-tags',
    title: 'Dog ID tags and travel safety',
    eyebrow: 'Safety basics',
    seoTitle: 'Personalised Dog ID Tags South Africa',
    seoDescription:
      'Shop practical dog ID tag and walking safety essentials for South African dogs at home, on walks and while travelling.',
    heroIntro: 'Make your dog easier to identify if they slip out at home, on walks or during travel.',
    problem: 'A loose dog without visible contact details is harder to reunite quickly with its owner.',
    solution: 'Use a clear ID tag with walking safety basics and keep contact details up to date.',
    body:
      'Dog ID tags are simple, low-cost safety essentials that pair naturally with collars, harnesses and travel routines.',
    bestFor: ['Safer walks', 'Travel safety', 'Personalised products'],
    categorySlugs: ['walking-gear', 'puppy-essentials', 'travel-kits'],
    productSlugs: ['personalised-dog-id-tag', 'adjustable-dog-harness', 'reflective-dog-leash', 'led-collar-safety-light'],
    kitSlugs: ['puppy-starter-kit', 'road-trip-starter-kit'],
    guideSlugs: ['why-dog-id-tags-matter', 'dog-road-trip-checklist-south-africa', 'puppy-starter-kit-checklist-south-africa'],
    keywords: ['id tag', 'personalised', 'tag', 'engraving', 'safety', 'walk', 'harness', 'leash'],
    faqs: [
      {
        question: 'What should be on a dog ID tag?',
        answer:
          'Use your dog name if you want to, plus at least one reliable phone number. Keep the text short and easy to read.',
      },
      {
        question: 'Do ID tags replace microchips?',
        answer:
          'No. An ID tag is a visible first step, while a microchip should still be kept up to date with your vet or registry.',
      },
    ],
    relatedProblemSlugs: ['dog-car-travel', 'puppy-training', 'senior-dog-access'],
  },
  {
    slug: 'senior-dog-access',
    title: 'Senior dog access and comfort',
    eyebrow: 'Senior dogs',
    seoTitle: 'Senior Dog Travel And Comfort Products South Africa',
    seoDescription:
      'Shop senior dog travel, comfort and access products for older dogs that need easier loading, softer rest and calmer routines.',
    heroIntro: 'Make cars, crates and weekend routines easier for older dogs or dogs with sensitive mobility.',
    problem: 'Older or mobility-sensitive dogs may struggle to jump into SUVs, bakkies or higher cars.',
    solution: 'Reduce awkward jumps with access support, softer resting products and a calmer travel setup.',
    body:
      'Senior dog products should reduce effort for both dog and owner without adding complicated routines.',
    bestFor: ['Senior dogs', 'SUV loading', 'Mobility support'],
    categorySlugs: ['beds-comfort', 'travel-kits', 'car-protection'],
    productSlugs: ['senior-dog-travel-kit', 'foldable-dog-ramp-for-cars-and-suvs', 'soft-crate-mat', 'waterproof-dog-travel-blanket'],
    kitSlugs: ['senior-dog-travel-kit'],
    guideSlugs: ['senior-dog-travel-comfort-guide', 'dog-road-trip-checklist-south-africa', 'dog-bed-size-guide'],
    keywords: ['senior', 'older dog', 'ramp', 'comfort', 'mobility', 'bed', 'mat', 'suv'],
    faqs: [
      {
        question: 'What helps senior dogs get into cars?',
        answer:
          'A ramp, lower loading routine and stable travel surface can reduce awkward jumps and lifting strain.',
      },
      {
        question: 'Should senior dog products replace vet advice?',
        answer:
          'No. Comfort and access products can help daily routines, but mobility pain or sudden changes should be discussed with a vet.',
      },
    ],
    relatedProblemSlugs: ['dog-beds-comfort', 'scratched-seats', 'dog-car-travel'],
  },
  {
    slug: 'puppy-training',
    title: 'Puppy starter routines',
    eyebrow: 'Puppy essentials',
    seoTitle: 'Puppy Starter Products South Africa',
    seoDescription:
      'Shop practical puppy starter products for training rewards, chewing outlets, feeding, cleanup and early travel routines.',
    heroIntro: 'Start with a focused puppy setup instead of buying random extras that never get used.',
    problem: 'New puppies need chewing outlets, reward treats and simple routines from the start.',
    solution: 'Pair puppy-safe chewing, training rewards, feeding basics and cleanup products around your daily routine.',
    body:
      'Puppy products should help owners create repeatable routines: eat, chew, train, clean up and travel safely.',
    bestFor: ['New puppies', 'Training rewards', 'First-time owners'],
    categorySlugs: ['puppy-essentials', 'dog-toys', 'treats-chews', 'bowls-feeding'],
    productSlugs: ['puppy-starter-kit', 'training-treats', 'training-treat-pouch', 'puppy-chew-starter-set'],
    kitSlugs: ['puppy-starter-kit'],
    guideSlugs: ['puppy-starter-kit-checklist-south-africa', 'best-dog-toys-for-boredom', 'slow-feeder-vs-normal-bowl'],
    keywords: ['puppy', 'training', 'starter', 'chew', 'treat', 'mess', 'feeding'],
    faqs: [
      {
        question: 'What puppy products should I start with?',
        answer:
          'Start with training treats, a chew outlet, feeding basics, cleanup supplies and a simple travel plan.',
      },
      {
        question: 'Should puppy toys be softer than adult dog toys?',
        answer:
          'Often yes. Choose products suited to your puppy size and chewing strength, and supervise play.',
      },
    ],
    relatedProblemSlugs: ['bored-dog', 'fast-eating', 'dog-id-tags'],
  },
  {
    slug: 'shedding-and-grooming',
    title: 'Shedding and home grooming',
    eyebrow: 'Grooming',
    seoTitle: 'Dog Shedding And Grooming Products South Africa',
    seoDescription:
      'Shop dog grooming and shedding products for home coat care, post-walk cleanup and pet hair control in South Africa.',
    heroIntro: 'Keep loose coat and post-walk cleanup more manageable with a simple grooming routine.',
    problem: 'Loose coat, wet towels and basic grooming can become hard to keep up with at home.',
    solution: 'Use a focused grooming kit and drying routine so coat care feels less like a chore.',
    body:
      'Home grooming products should be practical, easy to store and useful between professional grooming visits.',
    bestFor: ['Shedding dogs', 'Home grooming', 'Post-walk cleanup'],
    categorySlugs: ['grooming', 'car-protection', 'travel-kits'],
    productSlugs: ['grooming-starter-kit', 'deshedding-grooming-brush', 'dog-drying-towel', 'pet-hair-removal-brush'],
    kitSlugs: ['grooming-starter-kit', 'clean-car-kit'],
    guideSlugs: ['best-grooming-tools-dogs-that-shed', 'dog-grooming-tools-shedding', 'stop-dog-hair-taking-over-car'],
    keywords: ['grooming', 'shedding', 'brush', 'drying towel', 'hair remover', 'coat', 'cleanup'],
    faqs: [
      {
        question: 'How often should I brush a shedding dog?',
        answer:
          'It depends on coat type, but regular short brushing sessions are usually easier than waiting until hair builds up everywhere.',
      },
      {
        question: 'Can grooming products help keep the car cleaner?',
        answer:
          'Yes. Removing loose hair before car trips reduces how much hair ends up in seats, boot carpet and blankets.',
      },
    ],
    relatedProblemSlugs: ['dog-hair-in-car', 'mud-and-beach-sand', 'dog-beds-comfort'],
  },
];

const definitionsBySlug = new Map(problemPageDefinitions.map((definition) => [definition.slug, definition]));

function normalise(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function productSearchText(product: Product) {
  return normalise(
    [
      product.name,
      product.slug,
      product.category,
      product.categoryName,
      product.categorySlug,
      product.shortDescription,
      product.fullDescription,
      ...(product.tags ?? []),
      ...(product.keywords ?? []),
      ...(product.benefits ?? []),
      ...(product.features ?? []),
      ...(product.bestFor ?? []),
      ...(product.problemsSolved ?? []),
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function blogSearchText(post: BlogPost) {
  return normalise([post.title, post.slug, post.category, post.excerpt, ...(post.targetKeywords ?? [])].filter(Boolean).join(' '));
}

function termMatches(haystack: string, term: string) {
  const cleanTerm = normalise(term);
  return cleanTerm.length > 1 && haystack.includes(cleanTerm);
}

export function getProblemPageDefinition(slug: string) {
  return definitionsBySlug.get(slug) ?? null;
}

export function getProblemPagePath(slug: string) {
  return `/problems/${slug}`;
}

export function scoreProductForProblem(problem: ProblemPageDefinition, product: Product) {
  const haystack = productSearchText(product);
  let score = 0;

  if (problem.productSlugs.includes(product.slug)) score += 12;
  if (problem.kitSlugs.includes(product.slug)) score += 10;
  if (problem.categorySlugs.includes(product.categorySlug)) score += 4;
  if (product.isBundle || product.type === 'kit') score += problem.kitSlugs.some((slug) => slug === product.slug) ? 4 : 1;
  for (const keyword of problem.keywords) {
    if (termMatches(haystack, keyword)) score += 2;
  }
  for (const bestFor of problem.bestFor) {
    if (termMatches(haystack, bestFor)) score += 1;
  }

  return score;
}

export function getProductsForProblem(problem: ProblemPageDefinition, products: Product[], options?: { kitsOnly?: boolean; excludeKits?: boolean }) {
  return products
    .filter((product) => {
      const isKit = product.isBundle || product.type === 'kit';
      if (options?.kitsOnly && !isKit) return false;
      if (options?.excludeKits && isKit) return false;
      return scoreProductForProblem(problem, product) > 0;
    })
    .map((product) => ({ product, score: scoreProductForProblem(problem, product) }))
    .sort((a, b) => b.score - a.score || Number(b.product.featured) - Number(a.product.featured) || a.product.name.localeCompare(b.product.name))
    .map((entry) => entry.product);
}

export function getGuidesForProblem(problem: ProblemPageDefinition, posts: BlogPost[] = publishedBlogPosts) {
  return posts
    .map((post) => {
      const haystack = blogSearchText(post);
      let score = problem.guideSlugs.includes(post.slug) ? 12 : 0;
      for (const keyword of problem.keywords) {
        if (termMatches(haystack, keyword)) score += 2;
      }
      if (problem.categorySlugs.some((slug) => termMatches(haystack, slug))) score += 1;
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.post.title.localeCompare(b.post.title))
    .map((entry) => entry.post);
}

export function getCategoriesForProblem(problem: ProblemPageDefinition, categories: Category[]) {
  return categories.filter((category) => category.slug !== 'all' && problem.categorySlugs.includes(String(category.slug)));
}

export function getRelatedProblems(problem: ProblemPageDefinition) {
  return problem.relatedProblemSlugs.map((slug) => getProblemPageDefinition(slug)).filter((entry): entry is ProblemPageDefinition => Boolean(entry));
}

export function getProblemsForProduct(product: Product) {
  return problemPageDefinitions
    .map((problem) => ({ problem, score: scoreProductForProblem(problem, product) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.problem.title.localeCompare(b.problem.title))
    .map((entry) => entry.problem);
}

export function getProblemsForCategorySlug(categorySlug: string) {
  return problemPageDefinitions.filter((problem) => problem.categorySlugs.includes(categorySlug));
}

export function getGuidesForProduct(product: Product, posts: BlogPost[] = publishedBlogPosts) {
  const relatedProblems = getProblemsForProduct(product).slice(0, 3);
  const guideSlugs = new Set(relatedProblems.flatMap((problem) => problem.guideSlugs));
  const productText = productSearchText(product);

  return posts
    .map((post) => {
      const haystack = blogSearchText(post);
      let score = guideSlugs.has(post.slug) ? 10 : 0;
      if (termMatches(haystack, product.categorySlug)) score += 2;
      for (const tag of product.tags ?? []) {
        if (termMatches(haystack, tag)) score += 1;
      }
      for (const term of productText.split(' ').filter((entry) => entry.length > 4).slice(0, 12)) {
        if (haystack.includes(term)) score += 0.25;
      }
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.post.title.localeCompare(b.post.title))
    .map((entry) => entry.post);
}

export function getProblemLinksForProduct(product: Product): SimpleInternalLink[] {
  return getProblemsForProduct(product)
    .slice(0, 4)
    .map((problem) => ({
      title: problem.title,
      href: getProblemPagePath(problem.slug),
      description: problem.heroIntro,
      label: problem.eyebrow,
    }));
}

export function getGuideLinksForProduct(product: Product): SimpleInternalLink[] {
  return getGuidesForProduct(product)
    .slice(0, 4)
    .map((post) => ({
      title: post.title,
      href: `/blog/${post.slug}`,
      description: post.excerpt,
      label: post.category,
    }));
}

export function getCategoryFaqs(categorySlug: string, categoryName: string): ProblemFaq[] {
  const relatedProblems = getProblemsForCategorySlug(categorySlug).slice(0, 3);
  const firstProblem = relatedProblems[0];

  return [
    {
      question: `Which ${categoryName.toLowerCase()} product should I start with?`,
      answer: firstProblem
        ? `Start with the product that matches your main problem, such as ${firstProblem.title.toLowerCase()}, then add only the extras you will actually use.`
        : 'Start with the product that solves the most frequent problem in your daily routine, then add extras only when they make cleanup or travel easier.',
    },
    {
      question: `Are PawTrip SA ${categoryName.toLowerCase()} products suitable for South African routines?`,
      answer:
        'The range is curated around practical South African dog-owner situations such as car travel, beach trips, dust, wet paws, shedding and everyday home use.',
    },
  ];
}

export const blogTopicClusters = [
  { title: 'Dog car travel South Africa', href: '/problems/dog-car-travel' },
  { title: 'Dog car seat covers and hammocks', href: '/problems/scratched-seats' },
  { title: 'Pet hair cleanup', href: '/problems/dog-hair-in-car' },
  { title: 'Dog beach trips', href: '/problems/mud-and-beach-sand' },
  { title: 'Dog travel kits', href: '/shop/category/travel-kits' },
  { title: 'Dog bowls and feeding', href: '/problems/fast-eating' },
  { title: 'Slow feeders and enrichment', href: '/problems/fast-eating' },
  { title: 'Dog toys for boredom', href: '/problems/bored-dog' },
  { title: 'Dog beds and comfort', href: '/problems/dog-beds-comfort' },
  { title: 'Personalised dog ID tags', href: '/problems/dog-id-tags' },
  { title: 'Puppy starter products', href: '/problems/puppy-training' },
  { title: 'Senior dog comfort', href: '/problems/senior-dog-access' },
];
