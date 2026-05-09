import type { Metadata } from 'next';
import { BlogBrowser } from '@/components/blog-browser';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Dog Advice for Cleaner Cars and Calmer Trips South Africa',
  description:
    'Funny, practical PawTrip SA guides for South African dog owners shopping for dog car seat covers, travel kits, toys, feeding, grooming and puppy essentials.',
  path: '/blog',
  keywords: [
    'dog advice South Africa',
    'dog travel accessories South Africa',
    'dog car seat cover South Africa',
    'dog toys online South Africa',
  ],
});

export default function BlogPage() {
  return (
    <section className="section blogHubSection">
      <div className="container">
        <BlogBrowser />
      </div>
    </section>
  );
}
