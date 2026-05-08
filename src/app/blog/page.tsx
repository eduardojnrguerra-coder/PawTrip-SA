import type { Metadata } from 'next';
import { BlogBrowser } from '@/components/blog-browser';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Dog Travel, Car Protection and Pet Product Guides South Africa',
  description:
    'Read PawTrip SA guides about dog car seat covers, dog travel accessories, puppy essentials, grooming tools, toys, treats and South African road trips.',
  path: '/blog',
  keywords: ['dog travel accessories South Africa', 'dog car seat cover South Africa', 'puppy starter kit South Africa'],
});

export default function BlogPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">Blog</span>
          <h1>Useful guides for dog owners.</h1>
          <p>Short, practical articles focused on travel, comfort, feeding and everyday care.</p>
        </div>
        <BlogBrowser />
      </div>
    </section>
  );
}
