'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight, Clock, Filter, Sparkles } from 'lucide-react';
import { BlogImage } from '@/components/blog-image';
import { blogPosts, validateBlogPost, type BlogPost } from '@/data/blog';

const filterCategories = ['All', 'Car Protection', 'Travel', 'Puppy', 'Toys', 'Feeding', 'Grooming', 'Senior Dogs'];

const shopProblems = [
  { label: 'Dog hair in the car', href: '/problems#dog-hair-in-car' },
  { label: 'Mud and beach sand', href: '/problems#mud-and-beach-sand' },
  { label: 'Bored dog energy', href: '/problems#bored-dog' },
  { label: 'Fast eating', href: '/problems#fast-eating' },
  { label: 'Senior dog access', href: '/problems#senior-dog-access' },
  { label: 'Puppy chaos control', href: '/shop/category/puppy-essentials' },
];

function normaliseCategory(category: string) {
  if (category === 'Puppy Essentials') return 'Puppy';
  if (category === 'Treats') return 'Feeding';
  if (category === 'Comfort') return 'Senior Dogs';
  return category;
}

function matchesFilter(post: BlogPost, activeCategory: string) {
  if (activeCategory === 'All') return true;
  const haystack = `${post.title} ${post.slug} ${post.category}`.toLowerCase();
  if (activeCategory === 'Senior Dogs') return haystack.includes('senior') || haystack.includes('older') || haystack.includes('ramp');
  if (activeCategory === 'Puppy') return haystack.includes('puppy');
  if (activeCategory === 'Feeding') return normaliseCategory(post.category || '') === 'Feeding' || haystack.includes('treat') || haystack.includes('bowl');
  return normaliseCategory(post.category || '') === activeCategory;
}

function BlogCard({ post, featured = false, index = 0 }: { post: BlogPost; featured?: boolean; index?: number }) {
  const category = post.category || 'PawTrip SA Guide';
  const title = post.title || 'PawTrip SA Guide';
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.04, 0.18) }}
      whileHover={reduceMotion ? undefined : { y: -6 }}
      className={featured ? 'blogFeaturedCard' : 'blogCardPremium'}
    >
      <Link href={`/blog/${post.slug}`} className="blogCardLink" aria-label={`Read ${title}`}>
        <div className="blogCardMedia">
          <BlogImage src={post.image} alt={`${title} - PawTrip SA ${category} guide`} category={category} />
          <span className="blogCategoryPill">{category}</span>
        </div>
        <div className="blogCardBody">
          <div className="blogMetaRow">
            <span>
              <Clock size={15} aria-hidden="true" /> {post.readTime || 'Guide'}
            </span>
            <span>{post.date || 'PawTrip SA'}</span>
          </div>
          <h2>{title}</h2>
          <p>{post.excerpt || 'Practical guidance for South African dog owners.'}</p>
          <div className="blogFunnyTeaser">
            <Sparkles size={16} aria-hidden="true" />
            <span>{post.funnyHook || 'Useful advice, fewer mystery purchases.'}</span>
          </div>
          <strong className="blogReadMore">
            Read guide <ArrowRight size={16} aria-hidden="true" />
          </strong>
        </div>
      </Link>
    </motion.article>
  );
}

export function BlogBrowser() {
  const validPosts = useMemo(() => blogPosts.filter((post) => validateBlogPost(post).valid), []);
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState('All');
  const featuredPost = validPosts[0];
  const mostUseful = validPosts.slice(0, 6);
  const filteredPosts = validPosts.filter((post) => matchesFilter(post, activeCategory));

  return (
    <div className="blogHub">
      <section className="blogHubHero">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="eyebrow">PawTrip SA Guides</span>
          <h1>Dog advice for cleaner cars, calmer trips and fewer tiny disasters.</h1>
          <p>
            Practical guides for South African dog owners who love their dogs, but maybe not the hair, mud and chaos
            they bring along.
          </p>
          <div className="blogHeroActions">
            <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
              Find My Kit
            </Link>
            <Link href="/shop" className="button buttonSecondary">
              Shop practical picks
            </Link>
          </div>
        </motion.div>
        <motion.div
          className="blogHeroVisual"
          initial={reduceMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.1 }}
        >
          <span>Clean car energy</span>
          <strong>No fake fluff. Just useful dog-owner decisions.</strong>
          <p>Seat covers, travel bowls, bored-dog fixes and the occasional polite warning about wet towels.</p>
        </motion.div>
      </section>

      <section className="blogFilterPanel" aria-label="Blog category filters">
        <div className="blogFilterTitle">
          <Filter size={18} aria-hidden="true" />
          <span>Filter by dog-owner problem</span>
        </div>
        <div className="blogFilterRow">
          {filterCategories.map((category) => (
            <button
              className={category === activeCategory ? 'filterChip active' : 'filterChip'}
              type="button"
              key={category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {featuredPost ? (
        <section className="blogFeaturedSection" aria-labelledby="featured-guide">
          <div className="sectionHeaderInline">
            <div>
              <span className="eyebrow">Featured guide</span>
              <h2 id="featured-guide">Start here if your car has seen things.</h2>
            </div>
            <Link href={`/blog/${featuredPost.slug}`} className="textLink">
              Open featured guide
            </Link>
          </div>
          <BlogCard post={featuredPost} featured />
        </section>
      ) : null}

      <section aria-labelledby="blog-grid-title">
        <div className="sectionHeaderInline">
          <div>
            <span className="eyebrow">{activeCategory === 'All' ? 'All guides' : activeCategory}</span>
            <h2 id="blog-grid-title">Practical reads, sorted by real-life mess.</h2>
          </div>
          <p className="blogCount">{filteredPosts.length} guides</p>
        </div>
        <div className="blogGridPremium">
          {filteredPosts.map((post, index) => (
            <BlogCard post={post} index={index} key={post.slug} />
          ))}
        </div>
      </section>

      <section className="blogUtilityGrid" aria-labelledby="useful-guides">
        <div className="blogUsefulPanel">
          <span className="eyebrow">Most useful guides</span>
          <h2 id="useful-guides">The "I need an answer before checkout" shelf.</h2>
          <div className="blogUsefulLinks">
            {mostUseful.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug}>
                <span>{post.category}</span>
                <strong>{post.title}</strong>
              </Link>
            ))}
          </div>
        </div>

        <div className="blogProblemPanel">
          <span className="eyebrow">Shop the problem</span>
          <h2>Skip the marketplace scroll spiral.</h2>
          <p>Choose the problem first, then compare the products that actually fit it.</p>
          <div className="blogProblemLinks">
            {shopProblems.map((problem) => (
              <Link href={problem.href} key={problem.label}>
                {problem.label} <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
