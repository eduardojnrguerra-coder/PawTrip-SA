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
          <h1>Find the PawTrip setup that fits your dog, car and routine.</h1>
          <p>
            Five guided questions. One main recommendation, two useful add-ons and a related guide. Practical shopping,
            without product overload.
          </p>
        </div>
        <QuizClient products={publicProducts} />
      </div>
    </section>
  );
}
