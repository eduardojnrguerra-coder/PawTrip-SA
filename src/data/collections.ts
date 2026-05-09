export type Collection = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  productSlugs: string[];
  guideSlug?: string;
};

export const collections: Collection[] = [
  {
    slug: 'top-picks-new-dog-owners',
    title: 'Top picks for new dog owners',
    eyebrow: 'New dog owner setup',
    description:
      'A practical first basket for dog owners who want travel, training, cleanup and walking basics without buying every pet product on the internet.',
    seoTitle: 'Top Picks for New Dog Owners South Africa',
    seoDescription:
      'Shop practical PawTrip SA picks for new dog owners in South Africa, including travel kits, treats, walking gear and cleanup essentials.',
    productSlugs: [
      'road-trip-starter-kit',
      'puppy-starter-kit',
      'training-treats',
      'reflective-dog-leash',
      'adjustable-dog-harness',
      'poop-bag-holder-and-refill',
      'pet-hair-removal-brush',
      'collapsible-dog-travel-bowl',
    ],
    guideSlug: 'puppy-starter-kit-checklist-south-africa',
  },
  {
    slug: 'under-r250',
    title: 'Under R250',
    eyebrow: 'Useful add-ons',
    description:
      'Small, practical products under R250 for training, travel, grooming and quick cart add-ons. No fake urgency, just useful low-ticket essentials.',
    seoTitle: 'Dog Products Under R250 South Africa',
    seoDescription:
      'Browse PawTrip SA dog products under R250, including treats, travel bowls, leashes, grooming basics and enrichment add-ons.',
    productSlugs: [
      'collapsible-dog-travel-bowl',
      'pet-seat-belt-clip',
      'training-treats',
      'rubber-chew-ball',
      'rope-tug-toy',
      'lick-mat',
      'pet-hair-removal-brush',
      'poop-bag-holder-and-refill',
      'led-collar-safety-light',
      'training-treat-pouch',
      'dog-shampoo-bar',
      'travel-treat-jar',
    ],
    guideSlug: 'best-dog-products-under-r250',
  },
  {
    slug: 'car-protection-essentials',
    title: 'Car protection essentials',
    eyebrow: 'Cleaner car setup',
    description:
      'Seat covers, boot liners, towels and hair-removal basics for South African dog owners who want the car easier to reset after trips.',
    seoTitle: 'Dog Car Protection Essentials South Africa',
    seoDescription:
      'Shop dog car protection essentials in South Africa, including seat covers, boot liners, car cleaning kits and travel accessories.',
    productSlugs: [
      'clean-car-kit',
      'road-trip-starter-kit',
      'suv-protection-kit',
      'waterproof-dog-car-seat-cover',
      'dog-hammock-back-seat-cover',
      'suv-dog-boot-liner',
      'pet-hair-removal-brush',
      'dog-drying-towel',
      'paw-cleaner-cup',
    ],
    guideSlug: 'stop-dog-hair-taking-over-car',
  },
  {
    slug: 'bored-dog-fixes',
    title: 'Bored dog fixes',
    eyebrow: 'Enrichment setup',
    description:
      'Chew, sniff, lick and puzzle products for dogs that need better outlets for energy. A focused collection for boredom and chewing routines.',
    seoTitle: 'Bored Dog Toys and Enrichment South Africa',
    seoDescription:
      'Shop boredom-busting dog toys and enrichment products in South Africa, including lick mats, snuffle mats, chew toys and toy kits.',
    productSlugs: [
      'boredom-buster-toy-kit',
      'treat-dispensing-chew-toy',
      'lick-mat',
      'snuffle-mat',
      'puzzle-feeder-toy',
      'durable-chew-bone-toy',
      'rubber-chew-ball',
      'boredom-buster-toy-set',
    ],
    guideSlug: 'best-toys-bored-dogs-destroy-everything',
  },
];

export function getCollectionBySlug(slug: string) {
  return collections.find((collection) => collection.slug === slug);
}
