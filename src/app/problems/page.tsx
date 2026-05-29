import type { Metadata } from 'next';
import Link from 'next/link';
import { problemSolutions } from '@/data/problems';
import { blogPosts } from '@/lib/catalog';
import { getPublicProducts } from '@/lib/storefront';
import { ProductCard } from '@/components/product-card';
import { EducationBlocks } from '@/components/education-blocks';
import { educationBlocks } from '@/lib/education';
import { pageMetadata } from '@/lib/seo';
import { getProblemPageDefinition, getProblemPagePath } from '@/lib/problem-seo';

export const metadata: Metadata = pageMetadata({
  title: 'Shop Dog Products by Problem South Africa',
  description:
    'Find PawTrip SA kits and products by real dog-owner problems: car hair, mud, scratched seats, boredom, fast eating, senior access, puppy training and shedding.',
  path: '/problems',
  keywords: ['dog car hair products South Africa', 'dog travel kit South Africa', 'puppy starter kit South Africa'],
});

export const dynamic = 'force-dynamic';

export default async function ProblemsPage() {
  const products = await getPublicProducts();
  const problemMainSlugs = new Set(problemSolutions.map((problem) => problem.mainProductSlug));
  const adminKits = products
    .filter((product) => (product.type === 'kit' || product.isBundle) && !problemMainSlugs.has(product.slug))
    .sort((a, b) => Number(b.featured) - Number(a.featured));

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
            const problemPage = getProblemPageDefinition(problem.slug);

            return (
              <article className="contentCard problemSolutionCard" id={problem.slug} key={problem.slug}>
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
                  {problemPage ? (
                    <Link href={getProblemPagePath(problemPage.slug)} className="button buttonSecondary">
                      View problem guide
                    </Link>
                  ) : null}
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

        {adminKits.length ? (
          <>
            <div className="sectionHeader" style={{ marginTop: 40 }}>
              <span className="eyebrow">More PawTrip kits</span>
              <h2>Admin-managed bundles ready to shop.</h2>
              <p>These kits are controlled from the admin Kit Editor and can be updated without touching code.</p>
            </div>
            <div className="productGrid">
              {adminKits.map((kit) => (
                <ProductCard key={kit.slug} product={kit} />
              ))}
            </div>
          </>
        ) : null}

        <div className="sectionHeader" style={{ marginTop: 40 }}>
          <span className="eyebrow">Which one should I choose?</span>
          <h2>Quick comparisons before you buy.</h2>
        </div>
        <EducationBlocks blocks={educationBlocks} />
      </div>
    </section>
  );
}
