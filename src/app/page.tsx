import type { Metadata } from 'next';
import Link from 'next/link';
import { categories, getFeaturedProducts, blogPosts, products } from '@/lib/catalog';
import { Reveal } from '@/components/reveal';
import { ProductCard } from '@/components/product-card';
import { TrustStrip, HowItWorks, HomeTrustMessage, FinalCTA } from '@/components/page-sections';
import { AnimatedHero } from '@/components/animated-hero';
import { pageMetadata } from '@/lib/seo';
import { problemSolutions } from '@/data/problems';
import { EducationBlocks } from '@/components/education-blocks';
import { educationBlocks } from '@/lib/education';
import { KitFinderPreview } from '@/components/kit-finder-preview';
import { EmailCaptureBanner } from '@/components/email-capture-banner';
import { collections } from '@/data/collections';

export const metadata: Metadata = pageMetadata({
  title: 'Dog Travel Accessories, Car Protection and Pet Essentials South Africa',
  description:
    'Shop PawTrip SA for dog travel kits, car seat covers, dog toys, treats, grooming products and practical pet essentials for South African dog owners.',
  path: '/',
  keywords: [
    'dog travel accessories South Africa',
    'dog car seat cover South Africa',
    'dog travel kit South Africa',
    'dog toys online South Africa',
  ],
});

export default function HomePage() {
  const featured = getFeaturedProducts();
  const starterKits = products.filter((product) => product.isBundle).slice(0, 6);
  const bestSellers = featured.slice(0, 4);
  const guidePosts = blogPosts.slice(0, 6);
  const priorityCategories = categories.filter((category) =>
    ['travel-kits', 'car-protection', 'toys', 'grooming'].includes(category.slug),
  );

  return (
    <>
      <AnimatedHero products={featured} />

      <TrustStrip />

      <EmailCaptureBanner />

      <KitFinderPreview products={featured} />

      <section className="section sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Start here</span>
              <h2>Shop the core PawTrip SA range.</h2>
              <p>Dog travel kits, car protection, toys and grooming essentials are the fastest routes into the store.</p>
            </div>
          </Reveal>
          <div className="conversionCategoryRow">
            {priorityCategories.map((category) => (
              <Link href={`/shop/category/${category.slug}`} className="conversionCategoryLink" key={category.slug}>
                <strong>{category.name}</strong>
                <span>{category.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Starter kits</span>
                <h2>Start with a complete setup.</h2>
                <p>Bundles are the easiest first purchase when you want a practical setup without choosing every small add-on one by one.</p>
              </div>
              <Link href="/find-my-kit" className="button buttonSecondary">
                Use the kit finder
              </Link>
            </div>
          </Reveal>
          <div className="productGrid">
            {starterKits.map((product, index) => (
              <Reveal key={product.slug} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Best sellers</span>
                <h2>Popular launch picks.</h2>
                <p>Practical starting points for cleaner cars, easier travel, boredom fixes and puppy routines.</p>
              </div>
              <Link href="/shop" className="button buttonSecondary">
                Shop all products
              </Link>
            </div>
          </Reveal>
          <div className="productGrid">
            {bestSellers.map((product, index) => (
              <Reveal key={product.slug} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Curated collections</span>
              <h2>Shop by buying intent.</h2>
              <p>Fast routes for new dog owners, impulse add-ons, car protection and bored-dog fixes.</p>
            </div>
          </Reveal>
          <div className="collectionCardGrid">
            {collections.map((collection) => (
              <Reveal key={collection.slug}>
                <Link href={`/collections/${collection.slug}`} className="card collectionCard">
                  <span>{collection.eyebrow}</span>
                  <strong>{collection.title}</strong>
                  <p>{collection.description}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Shop by problem</span>
                <h2>Tell us what is getting annoying.</h2>
                <p>Choose a real dog-owner problem and we will point you to a kit, add-ons and a guide.</p>
              </div>
              <Link href="/problems" className="button buttonSecondary">
                View all problems
              </Link>
            </div>
          </Reveal>
          <div className="problemSolutionGrid">
            {problemSolutions.slice(0, 4).map((problem) => (
              <Reveal key={problem.slug}>
                <Link href="/problems" className="card problemCard">
                  <strong>{problem.title}</strong>
                  <p>{problem.solution}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Featured kits</span>
              <h2>Bundles that solve real problems.</h2>
            </div>
          </Reveal>
          <div className="productGrid">
            {featured.map((product, index) => (
              <Reveal key={product.slug} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Shop by category</span>
              <h2>Practical essentials without product overload.</h2>
            </div>
          </Reveal>
          <div className="gridFour">
            {categories
              .filter((category) => category.slug !== 'all')
              .map((category) => (
                <Reveal key={category.slug}>
                  <Link href={`/shop/category/${category.slug}`} className="card categoryCard">
                    <strong>{category.name}</strong>
                    <p>{category.description}</p>
                  </Link>
                </Reveal>
              ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Problem / solution</span>
              <h2>We focus on the everyday stuff that gets annoying fast.</h2>
            </div>
          </Reveal>
          <div className="problemSolutionGrid">
            {[
              ['Dog hair in the car', 'Seat covers, cargo liners and travel bundles keep cleanup lighter.'],
              ['Mud and beach sand', 'Useful materials and quick-clean accessories make the return trip easier.'],
              ['Boredom and chewing', 'Toys and enrichment bundles keep energy pointed somewhere better.'],
              ['Fast eating', 'Slow feeders and simple feeding tools help mealtimes feel calmer.'],
              ['Senior dogs struggling to climb into cars', 'Comfort-first travel options reduce the effort required.'],
            ].map(([problem, solution]) => (
              <Reveal key={problem}>
                <div className="card problemCard">
                  <strong>{problem}</strong>
                  <p>{solution}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <HomeTrustMessage />

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Which one should I choose?</span>
              <h2>Useful comparisons before you buy.</h2>
            </div>
          </Reveal>
          <EducationBlocks blocks={educationBlocks.slice(0, 3)} />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Blog and guides</span>
              <h2>Helpful reading for practical dog owners.</h2>
            </div>
          </Reveal>
          <div className="blogGrid">
            {guidePosts.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.03}>
                  <Link href={`/blog/${post.slug}`} className="blogCard card">
                  <div className="blogThumb">
                    <img src={post.image} alt={`${post.title} - PawTrip SA guide`} loading="lazy" />
                  </div>
                  <span className="guideBadge">{post.category}</span>
                  <strong className="blogTitle">{post.title}</strong>
                  <p>{post.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
