export type ProblemSolution = {
  slug: string;
  title: string;
  problem: string;
  solution: string;
  bestFor: string[];
  mainProductSlug: string;
  addOnSlugs: string[];
  guideSlug: string;
};

export const problemSolutions: ProblemSolution[] = [
  {
    slug: 'dog-hair-in-car',
    title: 'Dog hair in car',
    problem: 'Hair works into upholstery, boot carpet and seat seams after regular trips.',
    solution: 'Start with a protective cover or clean-car kit, then add a brush for quick resets after outings.',
    bestFor: ['Shedding dogs', 'Daily car trips', 'Back-seat travel'],
    mainProductSlug: 'clean-car-kit',
    addOnSlugs: ['waterproof-dog-car-seat-cover', 'pet-hair-removal-brush'],
    guideSlug: 'stop-dog-hair-taking-over-car',
  },
  {
    slug: 'mud-and-beach-sand',
    title: 'Mud and beach sand',
    problem: 'Wet paws, salt water and sand make the return trip harder than the outing.',
    solution: 'Use a beach-ready bundle with drying and cleanup add-ons so mess is contained before it spreads.',
    bestFor: ['Beach dogs', 'Wet paws', 'Weekend trips'],
    mainProductSlug: 'beach-dog-kit',
    addOnSlugs: ['paw-cleaner-cup', 'dog-drying-towel'],
    guideSlug: 'best-dog-travel-accessories-beach-trips',
  },
  {
    slug: 'scratched-seats',
    title: 'Scratched seats',
    problem: 'Claws and movement can mark seats, boot trim and cargo surfaces over time.',
    solution: 'Match the protection to where your dog travels: seat cover, hammock or boot liner.',
    bestFor: ['SUV owners', 'Energetic dogs', 'Cargo-area travel'],
    mainProductSlug: 'suv-protection-kit',
    addOnSlugs: ['dog-hammock-back-seat-cover', 'waterproof-dog-boot-seat-cover-with-side-protection'],
    guideSlug: 'dog-hammock-vs-dog-seat-cover',
  },
  {
    slug: 'bored-dog',
    title: 'Bored dog',
    problem: 'Restlessness, chewing and attention-seeking often show up when dogs need better enrichment.',
    solution: 'Combine chew, sniffing and licking products so boredom has a better outlet.',
    bestFor: ['Indoor days', 'Chewers', 'High-energy dogs'],
    mainProductSlug: 'boredom-buster-toy-kit',
    addOnSlugs: ['treat-dispensing-chew-toy', 'snuffle-mat'],
    guideSlug: 'best-toys-bored-dogs-destroy-everything',
  },
  {
    slug: 'fast-eating',
    title: 'Fast eating',
    problem: 'Some dogs rush meals and leave bowls, mats and floors messy.',
    solution: 'Use a slow feeder and feeding mat to make mealtimes more structured and easier to clean.',
    bestFor: ['Fast eaters', 'Messy feeding', 'Puppies'],
    mainProductSlug: 'slow-feeder-bowl',
    addOnSlugs: ['silicone-feeding-mat', 'no-spill-dog-travel-bowl'],
    guideSlug: 'best-slow-feeder-bowls-dogs-south-africa',
  },
  {
    slug: 'senior-dog-access',
    title: 'Senior dog access',
    problem: 'Older or mobility-sensitive dogs may struggle to jump into SUVs, bakkies or higher cars.',
    solution: 'Reduce lifting and awkward jumps with a travel kit built around access and comfort.',
    bestFor: ['Senior dogs', 'SUV loading', 'Mobility support'],
    mainProductSlug: 'senior-dog-travel-kit',
    addOnSlugs: ['foldable-dog-ramp-for-cars-and-suvs', 'soft-crate-mat'],
    guideSlug: 'dog-road-trip-checklist-south-africa',
  },
  {
    slug: 'puppy-training',
    title: 'Puppy training',
    problem: 'New puppies need chewing outlets, reward treats and simple routines from the start.',
    solution: 'Start with a focused puppy kit instead of buying random extras.',
    bestFor: ['New puppies', 'Training rewards', 'First-time owners'],
    mainProductSlug: 'puppy-starter-kit',
    addOnSlugs: ['training-treats', 'training-treat-pouch'],
    guideSlug: 'puppy-starter-kit-checklist-south-africa',
  },
  {
    slug: 'shedding-and-grooming',
    title: 'Shedding and grooming',
    problem: 'Loose coat, wet towels and basic grooming can become hard to keep up with at home.',
    solution: 'Use a small grooming kit and drying routine so coat care feels manageable.',
    bestFor: ['Shedding dogs', 'Home grooming', 'Post-walk cleanup'],
    mainProductSlug: 'grooming-starter-kit',
    addOnSlugs: ['deshedding-grooming-brush', 'dog-drying-towel'],
    guideSlug: 'best-grooming-tools-dogs-that-shed',
  },
];
