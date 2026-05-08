import Link from 'next/link';
import { siteName, siteTagline } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div>
          <strong>{siteName}</strong>
          <p>{siteTagline}</p>
        </div>
        <div>
          <h3>Shop</h3>
          <Link href="/shop/category/travel-kits">Travel Kits</Link>
          <Link href="/shop/category/car-protection">Car Protection</Link>
          <Link href="/shop/category/toys">Toys</Link>
          <Link href="/collections/under-r250">Under R250</Link>
          <Link href="/collections/car-protection-essentials">Car Protection Essentials</Link>
        </div>
        <div>
          <h3>Company</h3>
          <Link href="/about">About</Link>
          <Link href="/shipping-returns">Shipping & Returns</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/photo-guide">Photo Guide</Link>
        </div>
        <div>
          <h3>Support</h3>
          <Link href="/contact">Contact</Link>
          <a href="mailto:support@pawtripsa.co.za">Email support</a>
          <Link href="/shipping-returns">Order support</Link>
          <Link href="/find-my-kit">Kit Finder</Link>
          <Link href="/dog-road-trip-checklist-south-africa">Road Trip Checklist</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </div>
      <div className="container footerBottom">PawTrip SA is built for practical pet shopping in South Africa.</div>
    </footer>
  );
}
