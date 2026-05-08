import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'About PawTrip SA',
  description: 'Learn about PawTrip SA and the practical brand position behind the store.',
  path: '/about',
});

export default function AboutPage() {
  return (
    <section className="section">
      <div className="container contentCard detailBlock">
        <span className="eyebrow">About</span>
        <h1>Built for dog owners who want practical products.</h1>
        <p>
          PawTrip SA exists to make everyday dog shopping feel calmer, clearer and more useful. We focus on products that solve genuine problems: messy cars,
          restless dogs, rushed feeding and the small routines that shape life with a dog.
        </p>
        <p>
          The brand is deliberately practical. We are not trying to overwhelm you with endless options or flashy claims. Instead, we want to make it easier to
          buy the kind of items that actually help.
        </p>
      </div>
    </section>
  );
}
