import type { Metadata } from 'next';
import { QuizClient } from '@/components/quiz-client';
import { pageMetadata } from '@/lib/seo';
import { getPublicProducts } from '@/lib/storefront';

export const metadata: Metadata = pageMetadata({
  title: 'Kit Finder | PawTrip SA',
  description: 'Answer five quick questions and get a practical PawTrip SA kit recommendation with add-ons and a useful guide.',
  path: '/find-my-kit',
});

export default async function FindMyKitPage() {
  const publicProducts = await getPublicProducts();
  return (
    <section className="section kitFinderPage">
      <div className="container">
        <div className="sectionHeader kitFinderHeader">
          <span className="eyebrow">Kit Finder</span>
          <h1>Find the right dog travel setup in under a minute</h1>
          <p>
            Answer a few practical questions and PawTrip SA will suggest the best setup for your dog, car and routine.
          </p>
        </div>
        <QuizClient products={publicProducts} />
      </div>
    </section>
  );
}
