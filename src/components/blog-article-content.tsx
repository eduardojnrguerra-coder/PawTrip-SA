import Link from 'next/link';
import { ArrowRight, CheckCircle2, Clock, HelpCircle, Lightbulb, ShieldCheck, XCircle } from 'lucide-react';
import { BlogImage } from '@/components/blog-image';
import { Reveal } from '@/components/reveal';
import type { BlogPost } from '@/data/blog';
import type { Product } from '@/data/products';
import { ProductImage } from '@/components/product-image';
import { formatZar } from '@/lib/money';
import { BlogArticleViewTracker } from '@/components/analytics-events';

function ProductLinkCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/product/${product.slug}`} className="productCard">
      <div className="productCardMedia">
        <ProductImage
          src={product.image}
          alt={`${product.name} - ${product.category} product recommendation from PawTrip SA`}
          productName={product.name}
          category={product.category}
          className="productImage"
        />
      </div>
      <div className="productCardBody">
        <span className="chip">{product.categoryName || product.category}</span>
        <strong>{product.name}</strong>
        <p>{product.shortDescription}</p>
        <div className="priceRow">
          <strong>{formatZar(product.price)}</strong>
          <span>{formatZar(product.compareAtPrice)}</span>
        </div>
      </div>
    </Link>
  );
}

function RelatedArticleCard({ post }: { post: BlogPost }) {
  const title = post.title || 'PawTrip SA Guide';
  const category = post.category || 'Guide';

  return (
    <Link href={`/blog/${post.slug}`} className="relatedArticleCard">
      <div className="relatedArticleImage">
        <BlogImage src={post.image} alt={`${title} - related PawTrip SA guide`} category={category} />
      </div>
      <span>{category}</span>
      <strong>{title}</strong>
      <p>{post.funnyHook || post.excerpt || 'Another useful guide for practical dog-owner decisions.'}</p>
    </Link>
  );
}

export function BlogArticleContent({
  post,
  relatedProducts,
  recommendedProducts,
  relatedArticles,
  ctaBundle,
}: {
  post: BlogPost;
  relatedProducts: Product[];
  recommendedProducts: Product[];
  relatedArticles: BlogPost[];
  ctaBundle?: Product;
}) {
  const outline = Array.isArray(post.outline) ? post.outline.filter(Boolean) : [];
  const sections = Array.isArray(post.sections)
    ? post.sections.filter((section) => section?.heading || (Array.isArray(section?.paragraphs) && section.paragraphs.length))
    : [];
  const internalLinks = Array.isArray(post.internalLinks)
    ? post.internalLinks.filter((link) => link?.href && link?.label)
    : [];
  const faqs = Array.isArray(post.faqs) ? post.faqs.filter((faq) => faq?.question && faq?.answer) : [];
  const checklist = Array.isArray(post.checklist) ? post.checklist.filter(Boolean) : [];
  const mistakes = Array.isArray(post.commonMistakes) ? post.commonMistakes.filter(Boolean) : [];
  const pullQuotes = Array.isArray(post.pullQuotes) ? post.pullQuotes.filter(Boolean) : [];
  const keywords = Array.isArray(post.targetKeywords) ? post.targetKeywords.filter(Boolean) : [];
  const safeRelatedProducts = Array.isArray(relatedProducts) ? relatedProducts : [];
  const safeRecommendedProducts = Array.isArray(recommendedProducts) ? recommendedProducts : [];
  const safeRelatedArticles = Array.isArray(relatedArticles) ? relatedArticles : [];
  const articleTitle = post.title || 'PawTrip SA Guide';
  const articleCategory = post.category || 'Dog Guides';
  const productBlockTitle = post.productBlockTitle || 'PawTrip picks for this problem';

  return (
    <article className="blogArticle blogArticlePremium">
      <BlogArticleViewTracker slug={post.slug} title={articleTitle} category={articleCategory} />

      <header className="blogArticleHeroPremium">
        <div className="blogArticleHeroCopy">
          <span className="eyebrow">{articleCategory}</span>
          <h1>{articleTitle}</h1>
          <p className="blogHeroSubtitle">{post.heroSubtitle || post.excerpt}</p>
          <div className="blogArticleMeta">
            <span>
              <Clock size={16} aria-hidden="true" /> {post.readTime || 'Guide'}
            </span>
            <span>Updated {post.updatedAt || post.date || 'recently'}</span>
          </div>
          <p>{post.excerpt || 'Practical pet travel and everyday essentials guidance from PawTrip SA.'}</p>
        </div>
        <div className="blogArticleHeroMedia">
          <BlogImage
            src={post.image}
            alt={`${articleTitle} - PawTrip SA ${articleCategory} guide`}
            category={articleCategory}
            loading="eager"
          />
          <div className="blogHeroFloat">
            <strong>Useful, not fluffy</strong>
            <span>{post.funnyHook || 'A calmer way to choose dog gear.'}</span>
          </div>
        </div>
      </header>

      <div className="blogArticleLayout">
        <aside className="blogArticleSidebar" aria-label="Article shortcuts">
          {outline.length ? (
            <div className="articleOutlinePremium">
              <strong>What you will learn</strong>
              <ol>
                {outline.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </div>
          ) : null}

          {keywords.length ? (
            <div className="articleKeywordBox">
              <strong>Search focus</strong>
              <div>
                {keywords.slice(0, 4).map((keyword) => (
                  <span key={keyword}>{keyword}</span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="blogArticleMain">
          {post.quickAnswer ? (
            <section className="quickAnswerBox">
              <div>
                <Lightbulb size={22} aria-hidden="true" />
              </div>
              <div>
                <h2>Quick answer</h2>
                <p>{post.quickAnswer}</p>
              </div>
            </section>
          ) : null}

          {sections.length ? (
            sections.map((section, index) => {
              const paragraphs = Array.isArray(section.paragraphs) ? section.paragraphs.filter(Boolean) : [];
              const quote = pullQuotes[index % pullQuotes.length];
              const shouldShowQuote = quote && index > 0 && index % 2 === 1;

              return (
                <Reveal key={section.heading || `section-${index}`} delay={index * 0.04}>
                  <section className="articleSection articleSectionPremium">
                    {section.heading ? <h2>{section.heading}</h2> : null}
                    {paragraphs.map((paragraph) => (
                      <p key={paragraph}>{paragraph}</p>
                    ))}
                  </section>
                  {shouldShowQuote ? (
                    <aside className="articlePullQuote">
                      <span>Small truth</span>
                      <strong>{quote}</strong>
                    </aside>
                  ) : null}
                </Reveal>
              );
            })
          ) : (
            <section className="articleSection articleFallback">
              <h2>Guide coming soon</h2>
              <p>
                This PawTrip SA guide is being expanded. In the meantime, use the linked products and categories to
                compare practical dog travel and everyday essentials without the guesswork.
              </p>
            </section>
          )}

          {checklist.length ? (
            <section className="articleInfoBlock checklistBlock">
              <h2>Checklist before you buy</h2>
              <ul>
                {checklist.map((item) => (
                  <li key={item}>
                    <CheckCircle2 size={18} aria-hidden="true" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {mistakes.length ? (
            <section className="articleInfoBlock mistakeBlock">
              <h2>Common mistakes</h2>
              <ul>
                {mistakes.map((item) => (
                  <li key={item}>
                    <XCircle size={18} aria-hidden="true" /> <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {internalLinks.length ? (
            <section className="articleSection articleSectionPremium">
              <h2>Useful next clicks</h2>
              <div className="internalLinkList">
                {internalLinks.map((link) => (
                  <Link href={link.href} key={link.href}>
                    <span>{link.label}</span>
                    <strong>Open</strong>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {safeRecommendedProducts.length ? (
            <section className="articleProductBlock">
              <div className="articleProductHeader">
                <span className="eyebrow">Product help</span>
                <h2>{productBlockTitle}</h2>
                <p>Curated products linked to the problem in this guide. No fake urgency, no mystery "must-haves".</p>
              </div>
              <div className="relatedCarousel">
                {safeRecommendedProducts.map((product) => (
                  <ProductLinkCard product={product} key={product.slug} />
                ))}
              </div>
            </section>
          ) : null}

          {ctaBundle ? (
            <section className="articleCta articleCtaPremium">
              <div>
                <span className="eyebrow">Bundle shortcut</span>
                <h2>Start with the right PawTrip SA bundle</h2>
                <h3>{ctaBundle.name}</h3>
                <p>{ctaBundle.shortDescription}</p>
              </div>
              <Link href={`/shop/product/${ctaBundle.slug}`} className="button buttonPrimary buttonSheen">
                View {ctaBundle.name}
              </Link>
            </section>
          ) : null}

          {faqs.length ? (
            <section className="articleSection articleSectionPremium">
              <h2>FAQ</h2>
              <div className="articleFaqAccordion">
                {faqs.map((faq) => (
                  <details className="articleFaq" key={faq.question}>
                    <summary>
                      <HelpCircle size={17} aria-hidden="true" />
                      {faq.question}
                    </summary>
                    <p>{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <section className="articleFinalCta">
            <div>
              <ShieldCheck size={24} aria-hidden="true" />
              <span className="eyebrow">Guided shopping</span>
              <h2>Find the right setup for your dog</h2>
              <p>Answer a few practical questions and get a kit recommendation based on your car, dog and biggest mess.</p>
            </div>
            <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
              Find My Kit
            </Link>
          </section>

          {safeRelatedArticles.length ? (
            <section className="articleSection articleSectionPremium">
              <h2>Related guides</h2>
              <div className="relatedArticleGrid">
                {safeRelatedArticles.map((article) => (
                  <RelatedArticleCard post={article} key={article.slug} />
                ))}
              </div>
            </section>
          ) : null}

          {safeRelatedProducts.length ? (
            <section className="articleSection articleSectionPremium">
              <h2>Related PawTrip SA products</h2>
              <div className="relatedCarousel">
                {safeRelatedProducts.map((product) => (
                  <ProductLinkCard product={product} key={product.slug} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </article>
  );
}
