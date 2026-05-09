import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Car, CheckCircle2, HelpCircle, ShieldCheck, Sparkles, Wand2 } from 'lucide-react';
import { AnimatedHero } from '@/components/animated-hero';
import { EmailCaptureBanner } from '@/components/email-capture-banner';
import { KitFinderPreview } from '@/components/kit-finder-preview';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { collections } from '@/data/collections';
import { categories, getFeaturedProducts, products } from '@/lib/catalog';
import { pageMetadata } from '@/lib/seo';

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

const shopNeeds = [
  {
    title: 'Cleaner cars',
    copy: 'Seat covers, boot liners and cleanup tools for hair, mud and beach sand.',
    href: '/collections/car-protection-essentials',
    icon: <Car size={20} />,
  },
  {
    title: 'Travel-ready kits',
    copy: 'Bundles for road trips, SUVs, beach days and senior dog access.',
    href: '/shop/category/travel-kits',
    icon: <ShieldCheck size={20} />,
  },
  {
    title: 'Bored dog fixes',
    copy: 'Chew, sniff, lick and puzzle products for better outlets at home or away.',
    href: '/collections/bored-dog-fixes',
    icon: <Sparkles size={20} />,
  },
  {
    title: 'New dog owner basics',
    copy: 'A calmer first setup for training, feeding, walking and car trips.',
    href: '/collections/top-picks-new-dog-owners',
    icon: <BadgeCheck size={20} />,
  },
];

const benefits = [
  ['Curated, not cluttered', 'Focused products and bundles built around real dog-owner problems.'],
  ['Clear delivery wording', 'Delivery estimates depend on product availability and your location.'],
  ['Secure PayFast checkout', 'Payments redirect through PayFast. PawTrip SA does not store card details.'],
  ['Helpful before and after', 'Use the Kit Finder, guides or support email before you commit.'],
];

const proofCards = [
  ['No fake reviews', 'PawTrip SA is a new store. Real reviews will be added as orders are fulfilled.'],
  ['Practical bundles', 'Kits are grouped around use cases like car protection, beach trips and boredom.'],
  ['South Africa-focused', 'Copy, guides and product choices are written for local dog-owner routines.'],
];

const faqs = [
  ['Do you keep my card details?', 'No. PayFast handles the hosted payment flow, and PawTrip SA does not store card details.'],
  ['How do delivery estimates work?', 'Delivery estimates depend on product availability and your location. Orders are processed after payment confirmation.'],
  ['Where should I start?', 'Use the Kit Finder if you are unsure, or start with a travel kit if your main goal is a cleaner car setup.'],
  ['Are there real customer reviews yet?', 'Not yet. PawTrip SA does not use fake reviews. Real customer reviews will be added as orders are fulfilled.'],
];

export default function HomePage() {
  const featured = getFeaturedProducts();
  const starterKits = products.filter((product) => product.isBundle).slice(0, 6);
  const bestSellers = featured.slice(0, 4);
  const coreCategories = categories.filter((category) =>
    ['travel-kits', 'car-protection', 'toys', 'grooming'].includes(category.slug),
  );

  return (
    <>
      <AnimatedHero products={featured} />

      <section className="homeTrustBar" aria-label="Store trust points">
        <div className="container homeTrustBarInner">
          <span>Secure PayFast checkout</span>
          <span>Clear delivery estimates</span>
          <span>Useful bundles</span>
          <Link href="/contact">Support before paying</Link>
        </div>
      </section>

      <section className="section premiumHomeSection">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Shop by need</span>
                <h2>Start with the problem you want solved.</h2>
              </div>
              <Link href="/find-my-kit" className="button buttonSecondary buttonSheen">
                Find My Kit <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
          <div className="needGrid">
            {shopNeeds.map((need, index) => (
              <Reveal key={need.title} delay={index * 0.04}>
                <Link href={need.href} className="needCard">
                  <span>{need.icon}</span>
                  <strong>{need.title}</strong>
                  <p>{need.copy}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section premiumHomeSection sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Starter kits</span>
                <h2>Complete setups before tiny add-ons.</h2>
                <p>Bundles reduce guesswork by grouping the products most likely to work together.</p>
              </div>
              <Link href="/shop/category/travel-kits" className="button buttonSecondary buttonSheen">
                Shop kits
              </Link>
            </div>
          </Reveal>
          <div className="productGrid premiumProductGrid">
            {starterKits.map((product, index) => (
              <Reveal key={product.slug} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section premiumHomeSection sectionTight">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Best sellers</span>
                <h2>Popular launch picks.</h2>
                <p>Strong starting points for travel, cleaner cars, enrichment and puppy routines.</p>
              </div>
              <Link href="/shop" className="button buttonSecondary buttonSheen">
                Shop best sellers
              </Link>
            </div>
          </Reveal>
          <div className="productGrid premiumProductGrid">
            {bestSellers.map((product, index) => (
              <Reveal key={product.slug} delay={index * 0.04}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="section premiumHomeSection">
        <div className="container whyPawTrip">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Why PawTrip SA</span>
              <h2>Practical pet shopping with a calmer point of view.</h2>
              <p>
                PawTrip SA is built around everyday friction: messy cars, rushed trips, bored dogs and the small products
                that make routines easier.
              </p>
            </div>
          </Reveal>
          <div className="whyGrid">
            {benefits.map(([title, copy], index) => (
              <Reveal key={title} delay={index * 0.04}>
                <div className="whyCard">
                  <CheckCircle2 size={18} />
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <KitFinderPreview products={featured} />

      <section className="section premiumHomeSection">
        <div className="container">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Curated collections</span>
              <h2>Shop by buying intent.</h2>
              <p>Fast routes for new dog owners, impulse add-ons, car protection and bored-dog fixes.</p>
            </div>
          </Reveal>
          <div className="collectionCardGrid">
            {collections.map((collection, index) => (
              <Reveal key={collection.slug} delay={index * 0.04}>
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

      <section className="section premiumHomeSection">
        <div className="container proofGridWrap">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">Proof and trust</span>
              <h2>Trust without theatre.</h2>
            </div>
          </Reveal>
          <div className="proofGrid">
            {proofCards.map(([title, copy], index) => (
              <Reveal key={title} delay={index * 0.04}>
                <div className="proofCard">
                  <Wand2 size={18} />
                  <strong>{title}</strong>
                  <p>{copy}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <EmailCaptureBanner />

      <section className="section premiumHomeSection">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Shop by category</span>
                <h2>Four quick ways into the range.</h2>
              </div>
            </div>
          </Reveal>
          <div className="conversionCategoryRow premiumCategoryRow">
            {coreCategories.map((category) => (
              <Link href={`/shop/category/${category.slug}`} className="conversionCategoryLink" key={category.slug}>
                <strong>{category.name}</strong>
                <span>{category.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section premiumHomeSection">
        <div className="container faqHome">
          <Reveal>
            <div className="sectionHeader">
              <span className="eyebrow">FAQ</span>
              <h2>Before you buy.</h2>
            </div>
          </Reveal>
          <div className="faqHomeGrid">
            {faqs.map(([question, answer]) => (
              <details className="faqHomeItem" key={question}>
                <summary>
                  <HelpCircle size={16} /> {question}
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section finalCta premiumFinalCta">
        <div className="container finalCtaInner premiumFinalCtaInner">
          <div>
            <span className="eyebrow">Ready for a cleaner first trip?</span>
            <h2>Find the right setup for your dog.</h2>
            <p>Answer five quick questions or start with the most practical best sellers.</p>
          </div>
          <div className="cardActions">
            <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
              Find My Kit
            </Link>
            <Link href="/shop" className="button buttonSecondary buttonSheen">
              Shop Best Sellers
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
