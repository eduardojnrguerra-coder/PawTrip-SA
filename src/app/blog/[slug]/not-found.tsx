import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <section className="section">
      <div className="container contentCard">
        <span className="eyebrow">Blog not found</span>
        <h1>We could not find that guide.</h1>
        <p>Try the blog hub for published PawTrip SA articles, or browse practical products directly from the shop.</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <Link href="/blog" className="button buttonPrimary">
            Back to blog
          </Link>
          <Link href="/shop" className="button buttonSecondary">
            Shop products
          </Link>
        </div>
      </div>
    </section>
  );
}
