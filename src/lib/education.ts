export type EducationBlock = {
  title: string;
  summary: string;
  rows: Array<{
    option: string;
    bestFor: string;
    consider: string;
  }>;
  guideHref?: string;
};

export const educationBlocks: EducationBlock[] = [
  {
    title: 'Seat cover vs hammock',
    summary: 'Choose by how much your dog moves around on the back seat.',
    rows: [
      { option: 'Seat cover', bestFor: 'Calmer back-seat dogs', consider: 'Simple to remove when passengers need the seat.' },
      { option: 'Hammock', bestFor: 'Dogs that shift, shed or slide', consider: 'Adds footwell coverage and a more contained travel space.' },
    ],
    guideHref: '/blog/best-dog-car-seat-covers-south-africa',
  },
  {
    title: 'Seat cover vs boot liner',
    summary: 'Match the product to where your dog actually travels.',
    rows: [
      { option: 'Seat cover', bestFor: 'Sedans, hatchbacks and rear-seat travel', consider: 'Protects the rear bench from hair and paw marks.' },
      { option: 'Boot liner', bestFor: 'SUVs, crossovers and cargo-area travel', consider: 'Protects boot carpet and loading areas.' },
    ],
    guideHref: '/blog/dog-hammock-vs-dog-seat-cover',
  },
  {
    title: 'Lick mat vs snuffle mat',
    summary: 'Both are enrichment tools, but they slow dogs down in different ways.',
    rows: [
      { option: 'Lick mat', bestFor: 'Calm licking and settling', consider: 'Useful with spreadable treats and quieter routines.' },
      { option: 'Snuffle mat', bestFor: 'Sniffing and searching', consider: 'Better when your dog enjoys foraging-style games.' },
    ],
    guideHref: '/blog/lick-mats-vs-snuffle-mats',
  },
  {
    title: 'Slow feeder vs normal bowl',
    summary: 'Use a slow feeder when pace or mess is the issue.',
    rows: [
      { option: 'Slow feeder', bestFor: 'Dogs that rush meals', consider: 'Adds structure and makes eating less frantic.' },
      { option: 'Normal bowl', bestFor: 'Dogs with calm, tidy meals', consider: 'Simpler if speed is not a concern.' },
    ],
    guideHref: '/blog/best-slow-feeder-bowls-dogs-south-africa',
  },
  {
    title: 'Harness vs leash only',
    summary: 'A harness can improve control for daily walks and travel stops.',
    rows: [
      { option: 'Harness', bestFor: 'Better body control and comfort', consider: 'Helpful for active dogs and unfamiliar stops.' },
      { option: 'Leash only', bestFor: 'Calm dogs with good lead manners', consider: 'Still needs secure fit and visibility.' },
    ],
    guideHref: '/shop/category/walking-gear',
  },
  {
    title: 'Ramp vs lifting your dog',
    summary: 'For older or larger dogs, access support can be kinder and more repeatable.',
    rows: [
      { option: 'Ramp', bestFor: 'Senior dogs, SUVs and repeat loading', consider: 'Reduces awkward jumps and repeated lifting.' },
      { option: 'Lifting', bestFor: 'Small dogs and occasional help', consider: 'Can be awkward for large or sore dogs.' },
    ],
    guideHref: '/blog/dog-road-trip-checklist-south-africa',
  },
];

export function getEducationBlocksForCategory(slug: string) {
  if (slug === 'car-protection') return educationBlocks.slice(0, 2);
  if (slug === 'toys') return educationBlocks.filter((block) => block.title === 'Lick mat vs snuffle mat');
  if (slug === 'bowls-feeding') return educationBlocks.filter((block) => block.title === 'Slow feeder vs normal bowl');
  if (slug === 'walking-gear') return educationBlocks.filter((block) => block.title === 'Harness vs leash only');
  if (slug === 'travel-kits' || slug === 'beds-comfort') return educationBlocks.filter((block) => block.title === 'Ramp vs lifting your dog');
  return educationBlocks.slice(0, 2);
}
