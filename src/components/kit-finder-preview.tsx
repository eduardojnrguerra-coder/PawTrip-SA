import Link from 'next/link';
import { ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import type { Product } from '@/data/products';
import { ProductImage } from '@/components/product-image';

const previewSlugs = ['road-trip-starter-kit', 'suv-protection-kit', 'boredom-buster-toy-kit'];

export function KitFinderPreview({ products }: { products: Product[] }) {
  const previewProducts = previewSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const primaryPreview = previewProducts[0];
  const secondaryPreviews = previewProducts.slice(1);

  return (
    <section className="section kitFinderPreviewSection">
      <div className="container">
        <div className="kitFinderPreview">
          <div className="kitFinderPreviewCopy">
            <span className="eyebrow">Find my kit</span>
            <h2>Get a practical recommendation in under a minute.</h2>
            <p>
              Answer five quick questions about your pet, car, problem and buying style. We will suggest one main kit,
              two useful add-ons and a related guide.
            </p>
            <div className="kitFinderPreviewChecks">
              <span>
                <CheckCircle2 size={15} /> Built around real dog-owner problems
              </span>
              <span>
                <CheckCircle2 size={15} /> No fake urgency or overstuffed baskets
              </span>
              <span>
                <CheckCircle2 size={15} /> Good for travel, feeding, grooming and play
              </span>
            </div>
            <Link href="/find-my-kit" className="button buttonPrimary buttonSheen">
              Start the Kit Finder <ArrowRight size={16} />
            </Link>
          </div>

          <div className="kitFinderPreviewVisual" aria-hidden="true">
            {primaryPreview ? (
              <div className="kitFinderPreviewFeature">
                <ProductImage
                  src={primaryPreview.image}
                  alt={`${primaryPreview.name} ${primaryPreview.category} kit finder preview - PawTrip SA`}
                  productName={primaryPreview.name}
                  category={primaryPreview.category}
                  className="kitFinderPreviewHeroImage"
                />
                <div className="kitFinderPreviewFeatureBody">
                  <span>
                    <Sparkles size={13} /> Likely match
                  </span>
                  <strong>{primaryPreview.name}</strong>
                  <p>{primaryPreview.shortDescription}</p>
                </div>
              </div>
            ) : null}
            <div className="kitFinderPreviewCards">
              {secondaryPreviews.map((product) => (
                <div className="kitFinderPreviewCard" key={product.slug}>
                  <ProductImage
                    src={product.image}
                    alt={`${product.name} ${product.category} kit finder preview - PawTrip SA`}
                    productName={product.name}
                    category={product.category}
                    className="kitFinderPreviewImage"
                  />
                  <div>
                    <span>
                      <Sparkles size={13} /> Add-on route
                    </span>
                    <strong>{product.name}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
