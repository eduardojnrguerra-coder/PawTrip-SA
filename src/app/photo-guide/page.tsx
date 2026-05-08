import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Guide',
  description: 'Internal PawTrip SA product photography and image upload guide.',
};

const imageRules = [
  'Save product images as jpg or webp files inside public/products/.',
  'Use product slug naming, such as waterproof-dog-car-seat-cover-1.jpg.',
  'Use 1200x1200 for product images so cards and galleries crop cleanly.',
  'Use 1600x900 for hero, banner and lifestyle images.',
  'Compress images before upload to keep the storefront fast.',
];

const sourcingRules = [
  'Use supplier photos only when PawTrip SA has permission to use them.',
  'Buy samples and take real photos for hero products and best sellers.',
  'Do not copy photos from competitor sites.',
  'Use AI images only for banners or lifestyle sections, not exact product representation unless the result is accurate.',
];

export default function PhotoGuidePage() {
  return (
    <section className="section">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">Internal guide</span>
          <h1>Product photo guide</h1>
          <p>Keep PawTrip SA product images honest, consistent and fast-loading as the catalogue grows.</p>
        </div>

        <div className="gridTwo">
          <div className="contentCard detailBlock">
            <h2>How to add product photos</h2>
            <ul className="bulletList">
              {imageRules.map((rule) => (
                <li key={rule}>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="contentCard detailBlock">
            <h2>Photo sourcing rules</h2>
            <ul className="bulletList">
              {sourcingRules.map((rule) => (
                <li key={rule}>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="contentCard detailBlock" style={{ marginTop: 18 }}>
          <h2>Gallery naming pattern</h2>
          <p>
            Every product can have multiple gallery images. Use the product slug followed by a number, for example
            <code> /products/slow-feeder-bowl-1.jpg</code>, <code> /products/slow-feeder-bowl-2.jpg</code> and
            <code> /products/slow-feeder-bowl-3.webp</code>.
          </p>
          <p>
            If a file is not available yet, the storefront shows the PawTrip SA branded placeholder with the product category and the message
            “Product image coming soon”.
          </p>
        </div>
      </div>
    </section>
  );
}

