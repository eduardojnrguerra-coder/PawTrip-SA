import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, BadgeCheck, Bone, Car, CheckCircle2, Dog, Gauge, HelpCircle, ShieldCheck, Waves, Wand2 } from 'lucide-react';
import { AnimatedHero } from '@/components/animated-hero';
import { EmailCaptureBanner } from '@/components/email-capture-banner';
import { KitFinderPreview } from '@/components/kit-finder-preview';
import { ProductCard } from '@/components/product-card';
import { Reveal } from '@/components/reveal';
import { collections } from '@/data/collections';
import { blogPosts } from '@/data/blog';
import { pageMetadata } from '@/lib/seo';
import { getFeaturedProductsFromStore, getPublicCategories, getPublicProducts } from '@/lib/storefront';

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
    title: 'Hair everywhere',
    copy: 'Seat covers, boot liners and hair tools for the fur that somehow reaches the dashboard.',
    href: '/collections/car-protection-essentials',
    icon: <Car size={20} />,
  },
  {
    title: 'Muddy beach paws',
    copy: 'Towels, bowls and beach-ready kits for sandy returns and wet-dog logistics.',
    href: '/blog/best-dog-travel-accessories-beach-trips',
    icon: <Waves size={20} />,
  },
  {
    title: 'Seat scratches',
    copy: 'Protection for claws, loading scuffs and back-seat trips that get a little too enthusiastic.',
    href: '/shop/category/car-protection',
    icon: <ShieldCheck size={20} />,
  },
  {
    title: 'Bored chewing',
    copy: 'Chew, sniff, lick and puzzle products for dogs with demolition energy.',
    href: '/shop/category/dog-toys',
    icon: <Bone size={20} />,
  },
  {
    title: 'Fast eating',
    copy: 'Slow feeders and mats for meals that should not look like a motorsport event.',
    href: '/blog/best-slow-feeder-bowls-dogs-south-africa',
    icon: <Gauge size={20} />,
  },
  {
    title: 'Puppy mess',
    copy: 'Starter-kit basics for tiny teeth, training treats and everyday puppy admin.',
    href: '/collections/top-picks-new-dog-owners',
    icon: <Dog size={20} />,
  },
  {
    title: 'Senior dog access',
    copy: 'Travel support for older dogs who need a kinder way into the car.',
    href: '/shop/product/senior-dog-travel-kit',
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

export default async function HomePage() {
  const [featured, products, categories] = await Promise.all([getFeaturedProductsFromStore(), getPublicProducts(), getPublicCategories()]);
  const starterKits = products.filter((product) => product.isBundle).slice(0, 6);
  const bestSellers = featured.slice(0, 4);
  const coreCategories = categories.filter((category) =>
    ['travel-kits', 'car-protection', 'dog-toys', 'grooming'].includes(category.slug),
  );
  const guideTeasers = blogPosts.slice(0, 3);

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

      <section className="section premiumHomeSection chaosSection">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Shop by your dog&apos;s chaos</span>
                <h2>Start with the mess, not the menu.</h2>
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

      <section className="section premiumHomeSection cleanCarStory">
        <div className="container cleanCarPanel">
          <Reveal>
              <div className="cleanCarCopyCard">
                <span className="eyebrow">Car protection</span>
                <h2>Protect your car from the chaos dogs bring with them.</h2>
                <p className="cleanCarLead">
                  Seat covers, boot liners and travel accessories that help keep hair, sand, mud and scratches under control.
                </p>
                <p>
                  Create a protected travel zone for your dog and keep your back seats easier to clean after parks, beaches
                  and road trips.
                </p>
                <div className="beforeAfterGrid">
                  <div className="beforeAfterCard beforeCard">
                    <span>Before</span>
                    <strong>Hair, sand and muddy paws after every trip.</strong>
                    <p>Hair, sand and muddy paws after every trip.</p>
                  </div>
                  <div className="beforeAfterCard afterCard">
                    <span>After</span>
                    <strong>Protected seats and easier clean-up.</strong>
                    <p>Protected seats and easier clean-up.</p>
                  </div>
                </div>
              <div className="cleanCarActions">
                <Link href="/shop/category/car-protection" className="button buttonPrimary buttonSheen">
                  Shop Car Protection <ArrowRight size={15} />
                </Link>
                <Link href="/find-my-kit" className="cleanCarTextLink">
                  Find my pet kit
                </Link>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.06}>
            <div className="cleanCarVisualCard">
              <img
                src="/brand-assets/pawtrip-hero-dog-car.png"
                alt="Dog relaxing in a protected PawTrip SA car travel setup"
                className="cleanCarVisualImage"
                loading="lazy"
                decoding="async"
              />
            </div>
          </Reveal>
        </div>
        <div className="container">
          <div className="cleanCarFeatureRow" aria-label="Car protection features">
            <span>Waterproof-style protection</span>
            <span>Scratch resistant</span>
            <span>Easy to clean</span>
            <span>Universal fit for most cars</span>
          </div>
        </div>
      </section>

      <KitFinderPreview products={featured} />

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

      <section className="section premiumHomeSection blogTeaserHome">
        <div className="container">
          <Reveal>
            <div className="sectionHeader sectionHeaderInline">
              <div>
                <span className="eyebrow">Guides with personality</span>
                <h2>Dog advice for fewer tiny disasters.</h2>
                <p>Funny, practical reads for hair, mud, road trips, feeding and bored-dog chaos.</p>
              </div>
              <Link href="/blog" className="button buttonSecondary buttonSheen">
                Read guides
              </Link>
            </div>
          </Reveal>
          <div className="homeGuideGrid">
            {guideTeasers.map((post, index) => (
              <Reveal key={post.slug} delay={index * 0.04}>
                <Link href={`/blog/${post.slug}`} className="homeGuideCard">
                  <span>{post.category}</span>
                  <strong>{post.title}</strong>
                  <p>{post.funnyHook || post.excerpt}</p>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

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
