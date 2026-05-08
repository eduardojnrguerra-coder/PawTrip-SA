import type { Metadata } from 'next';
import Link from 'next/link';
import { problemSolutions } from '@/data/problems';
import { blogPosts, products } from '@/lib/catalog';
import { ProductCard } from '@/components/product-card';
import { EducationBlocks } from '@/components/education-blocks';
import { educationBlocks } from '@/lib/education';
import { pageMetadata } from '@/lib/seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shop Dog Products by Problem South Africa',
  description:
    'Find PawTrip SA kits and products by real dog-owner problems: car hair, mud, scratched seats, boredom, fast eating, senior access, puppy training and shedding.',
  path: '/problems',
  keywords: ['dog car hair products South Africa', 'dog travel kit South Africa', 'puppy starter kit South Africa'],
});

export default function ProblemsPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">Shop by problem</span>
          <h1>Start with the problem you actually want solved.</h1>
          <p>PawTrip SA is built to reduce product overload. Choose the issue, then compare a practical kit, add-ons and guide.</p>
        </div>

        <div className="problemSolutionCards">
          {problemSolutions.map((problem) => {
            const mainProduct = products.find((product) => product.slug === problem.mainProductSlug);
            const guide = blogPosts.find((post) => post.slug === problem.guideSlug);
            const addOns = problem.addOnSlugs
              .map((slug) => products.find((product) => product.slug === slug))
              .filter(Boolean);

            return (
              <article className="contentCard problemSolutionCard" key={problem.slug}>
                <div>
                  <span className="eyebrow">{problem.title}</span>
                  <h2>{problem.problem}</h2>
                  <p>{problem.solution}</p>
                  <div className="cardMeta">
                    {problem.bestFor.map((item) => (
                      <span className="chip" key={item}>
                        Best for: {item}
                      </span>
                    ))}
                  </div>
                </div>
                {mainProduct ? <ProductCard product={mainProduct} /> : null}
                <div className="internalLinkList">
                  {addOns.map((product) => (
                    <Link href={`/shop/product/${product!.slug}`} key={product!.slug}>
                      <span>Complete the setup: {product!.name}</span>
                      <strong>View</strong>
                    </Link>
                  ))}
                  {guide ? (
                    <Link href={`/blog/${guide.slug}`}>
                      <span>Guide: {guide.title}</span>
                      <strong>Read</strong>
                    </Link>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="sectionHeader" style={{ marginTop: 40 }}>
          <span className="eyebrow">Which one should I choose?</span>
          <h2>Quick comparisons before you buy.</h2>
        </div>
        <EducationBlocks blocks={educationBlocks} />
      </div>
    </section>
  );
}
