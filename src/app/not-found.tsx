import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="section">
      <div className="container contentCard">
        <span className="eyebrow">404</span>
        <h1>We could not find that page.</h1>
        <p>Try heading back to the shop or the homepage.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/" className="button buttonPrimary">
            Home
          </Link>
          <Link href="/shop" className="button buttonSecondary">
            Shop
          </Link>
        </div>
      </div>
    </section>
  );
}

