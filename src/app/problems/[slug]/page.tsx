import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { JsonLd } from '@/components/json-ld';
import { ProductCard } from '@/components/product-card';
import { breadcrumbSchema, faqSchema, pageMetadata } from '@/lib/seo';
import {
  getCategoriesForProblem,
  getGuidesForProblem,
  getProblemPageDefinition,
  getProblemPagePath,
  getProductsForProblem,
  getRelatedProblems,
  problemPageDefinitions,
} from '@/lib/problem-seo';
import { getPublicCategories, getPublicProducts } from '@/lib/storefront';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return problemPageDefinitions.map((problem) => ({ slug: problem.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const problem = getProblemPageDefinition(slug);
  if (!problem) return {};

  return pageMetadata({
    title: problem.seoTitle,
    description: problem.seoDescription,
    path: getProblemPagePath(problem.slug),
    keywords: problem.keywords,
  });
}

export default async function ProblemDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const problem = getProblemPageDefinition(slug);
  if (!problem) notFound();

  const [products, categories] = await Promise.all([getPublicProducts(), getPublicCategories()]);
  const kits = getProductsForProblem(problem, products, { kitsOnly: true }).slice(0, 3);
  const recommendedProducts = getProductsForProblem(problem, products, { excludeKits: true }).slice(0, 8);
  const relatedCategories = getCategoriesForProblem(problem, categories).slice(0, 4);
  const relatedGuides = getGuidesForProblem(problem).slice(0, 4);
  const relatedProblems = getRelatedProblems(problem).slice(0, 4);
  const breadcrumbItems = [
    { name: 'Home', path: '/' },
    { name: 'Shop by Problem', path: '/problems' },
    { name: problem.title, path: getProblemPagePath(problem.slug) },
  ];

  return (
    <section className="section">
      <div className="container">
        <JsonLd data={[breadcrumbSchema(breadcrumbItems), faqSchema(problem.faqs)]} />
        <Breadcrumbs items={breadcrumbItems} />

        <div className="sectionHeader">
          <span className="eyebrow">{problem.eyebrow}</span>
          <h1>{problem.title}</h1>
          <p>{problem.heroIntro}</p>
          <div className="cardMeta">
            {problem.bestFor.map((item) => (
              <span className="chip" key={item}>
                Best for: {item}
              </span>
            ))}
          </div>
        </div>

        <div className="internalLinkGrid">
          <div className="contentCard detailBlock">
            <span className="eyebrow">The problem</span>
            <h2>{problem.problem}</h2>
            <p>{problem.body}</p>
          </div>
          <div className="contentCard detailBlock">
            <span className="eyebrow">The PawTrip setup</span>
            <h2>{problem.solution}</h2>
            <ul className="bulletList">
              {problem.bestFor.map((item) => (
                <li key={item}>
                  <CheckCircle2 size={16} /> <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {kits.length ? (
          <>
            <div className="sectionHeader">
              <span className="eyebrow">Best starting kits</span>
              <h2>Start with a complete setup.</h2>
              <p>These bundles reduce guesswork by grouping practical products around this exact problem.</p>
            </div>
            <div className="productGrid">
              {kits.map((product) => (
                <ProductCard product={product} key={product.slug} />
              ))}
            </div>
          </>
        ) : null}

        <div className="sectionHeader">
          <span className="eyebrow">Recommended products</span>
          <h2>Products that match this problem.</h2>
          <p>Choose the main product first, then add only the extras that fit your dog, car and routine.</p>
        </div>
        {recommendedProducts.length ? (
          <div className="productGrid">
            {recommendedProducts.map((product) => (
              <ProductCard product={product} key={product.slug} />
            ))}
          </div>
        ) : (
          <div className="contentCard detailBlock">
            <h2>Products coming soon</h2>
            <p>Products for this problem will appear here as the live catalogue grows.</p>
            <Link href="/shop" className="button buttonPrimary">
              Browse the shop
            </Link>
          </div>
        )}

        <div className="internalLinkGrid">
          <div className="contentCard detailBlock">
            <h2>Related categories</h2>
            <div className="internalLinkList">
              {relatedCategories.length ? (
                relatedCategories.map((category) => (
                  <Link href={`/shop/category/${category.slug}`} key={category.slug}>
                    <span>{category.name}</span>
                    <strong>Shop</strong>
                  </Link>
                ))
              ) : (
                <Link href="/shop">
                  <span>Browse all PawTrip SA products</span>
                  <strong>Shop</strong>
                </Link>
              )}
            </div>
          </div>
          <div className="contentCard detailBlock">
            <h2>Helpful guides</h2>
            <div className="internalLinkList">
              {relatedGuides.length ? (
                relatedGuides.map((post) => (
                  <Link href={`/blog/${post.slug}`} key={post.slug}>
                    <span>{post.title}</span>
                    <strong>Read</strong>
                  </Link>
                ))
              ) : (
                <Link href="/blog">
                  <span>Browse PawTrip SA dog guides</span>
                  <strong>Read</strong>
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="contentCard detailBlock">
          <span className="eyebrow">FAQ</span>
          <h2>Common questions about {problem.title.toLowerCase()}.</h2>
          <div className="internalLinkList">
            {problem.faqs.map((faq) => (
              <div key={faq.question}>
                <span>
                  <strong>{faq.question}</strong>
                  <br />
                  {faq.answer}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="contentCard detailBlock buyingIntentBlock">
          <span className="eyebrow">Keep exploring</span>
          <h2>Other real-life dog-owner problems.</h2>
          <div className="internalLinkList">
            {relatedProblems.map((entry) => (
              <Link href={getProblemPagePath(entry.slug)} key={entry.slug}>
                <span>{entry.title}</span>
                <strong>
                  View <ArrowRight size={14} />
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
