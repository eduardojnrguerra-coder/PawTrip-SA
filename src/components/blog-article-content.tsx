import Link from 'next/link';
import { Reveal } from '@/components/reveal';
import type { BlogPost } from '@/data/blog';
import type { Product } from '@/data/products';
import { ProductImage, getProductImageAlt } from '@/components/product-image';
import { formatZar } from '@/lib/money';
import { BlogArticleViewTracker } from '@/components/analytics-events';

function ProductLinkCard({ product }: { product: Product }) {
  return (
    <Link href={`/shop/product/${product.slug}`} className="productCard">
      <div className="productCardMedia">
        <ProductImage
          src={product.image}
          alt={getProductImageAlt(product.name, product.category, 'blog product recommendation')}
          productName={product.name}
          category={product.category}
          className="productImage"
        />
      </div>
      <div className="productCardBody">
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

export function BlogArticleContent({
  post,
  relatedProducts,
  recommendedProducts,
  ctaBundle,
}: {
  post: BlogPost;
  relatedProducts: Product[];
  recommendedProducts: Product[];
  ctaBundle?: Product;
}) {
  return (
    <article className="blogArticle">
      <BlogArticleViewTracker slug={post.slug} title={post.title} category={post.category} />
      <div className="blogArticleHero">
        <span className="eyebrow">{post.category}</span>
        <h1>{post.title}</h1>
        <p>
          {post.date} • {post.readTime}
        </p>
        <p>{post.excerpt}</p>
      </div>

      {post.outline.length ? (
        <div className="articleOutline">
          <strong>Article outline</strong>
          <ul>
            {post.outline.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {post.sections.map((section, index) => (
        <Reveal key={section.heading} delay={index * 0.05}>
          <section className="articleSection">
            <h2>{section.heading}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        </Reveal>
      ))}

      {post.internalLinks?.length ? (
        <section className="articleSection">
          <h2>Helpful internal links</h2>
          <div className="internalLinkList">
            {post.internalLinks.map((link) => (
              <Link href={link.href} key={link.href}>
                <span>{link.label}</span>
                <strong>Open</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {recommendedProducts.length ? (
        <section className="articleSection">
          <h2>Recommended products</h2>
          <div className="relatedCarousel">
            {recommendedProducts.map((product) => (
              <ProductLinkCard product={product} key={product.slug} />
            ))}
          </div>
        </section>
      ) : null}

      {ctaBundle ? (
        <section className="articleSection articleCta">
          <h2>CTA: Start with the right PawTrip SA bundle</h2>
          <h3>{ctaBundle.name}</h3>
          <p>{ctaBundle.shortDescription}</p>
          <Link href={`/shop/product/${ctaBundle.slug}`} className="button buttonPrimary buttonSheen">
            View {ctaBundle.name}
          </Link>
        </section>
      ) : null}

      {post.faqs?.length ? (
        <section className="articleSection">
          <h2>FAQ</h2>
          {post.faqs.map((faq) => (
            <div className="articleFaq" key={faq.question}>
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}
        </section>
      ) : null}

      {relatedProducts.length ? (
        <section className="articleSection">
          <h2>Related PawTrip SA products</h2>
          <div className="relatedCarousel">
            {relatedProducts.map((product) => (
              <ProductLinkCard product={product} key={product.slug} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
