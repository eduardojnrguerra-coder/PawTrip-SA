import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { PrintButton } from '@/components/print-button';
import { pageMetadata } from '@/lib/seo';

const checklistSections = [
  {
    title: 'Car setup',
    items: ['Seat cover, hammock or boot liner', 'Pet seat belt clip or suitable restraint setup', 'Travel blanket or mat', 'Towel for wet paws'],
  },
  {
    title: 'Water and feeding',
    items: ['Fresh water packed separately for your dog', 'Collapsible or no-spill travel bowl', 'Training treats or travel treat jar', 'Normal food for longer trips'],
  },
  {
    title: 'Stops and safety',
    items: ['Lead and harness', 'Poop bags and refill', 'Current ID tag or contact detail', 'Plan regular water and toilet breaks'],
  },
  {
    title: 'Cleanup',
    items: ['Pet hair removal brush', 'Dog drying towel', 'Paw cleaner cup for muddy or sandy paws', 'Small bag for damp towels or dirty accessories'],
  },
  {
    title: 'Comfort and boredom',
    items: ['Chew toy or lick mat for downtime', 'Familiar blanket for overnight stops', 'Cooling mat for warm weather where appropriate', 'A calmer loading routine before departure'],
  },
];

export const metadata: Metadata = pageMetadata({
  title: 'Dog Road Trip Checklist South Africa',
  description: 'A practical dog road trip checklist for South African pet owners covering car protection, water, safety, cleanup and comfort.',
  path: '/dog-road-trip-checklist-south-africa',
  keywords: ['dog road trip checklist South Africa', 'dog travel checklist', 'dog travel accessories South Africa'],
});

export default function DogRoadTripChecklistPage() {
  return (
    <section className="section checklistPage">
      <div className="container">
        <div className="sectionHeader checklistHeader">
          <span className="eyebrow">Downloadable guide</span>
          <h1>Dog Road Trip Checklist South Africa</h1>
          <p>
            A practical packing list for cleaner cars, safer stops and easier dog travel. Use it before weekends away,
            beach drives, family visits or longer South African road trips.
          </p>
          <div className="cardActions">
            <PrintButton>Print checklist</PrintButton>
            <Link href="/collections/car-protection-essentials" className="button buttonSecondary buttonSheen">
              Shop car protection
            </Link>
          </div>
        </div>

        <div className="checklistGrid">
          {checklistSections.map((section) => (
            <div className="contentCard detailBlock checklistCard" key={section.title}>
              <h2>{section.title}</h2>
              <ul className="bulletList">
                {section.items.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={16} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="contentCard detailBlock checklistNote">
          <h2>Before you leave</h2>
          <p>
            Delivery products and travel accessories help, but they do not replace good judgement. Plan around heat,
            distance, your dog&apos;s comfort and safe stops. If your dog has health or travel concerns, follow guidance
            from your vet.
          </p>
          <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
            Find the right kit
          </Link>
        </div>
      </div>
    </section>
  );
}
