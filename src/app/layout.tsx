import type { Metadata, Viewport } from 'next';
import '@/app/globals.css';
import '@fontsource/inter/index.css';
import '@fontsource/sora/index.css';
import { CartProvider } from '@/components/cart-provider';
import { CartDrawer } from '@/components/cart-drawer';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { Toasts } from '@/components/toasts';
import { AnalyticsPlaceholder } from '@/components/analytics-placeholder';
import { JsonLd } from '@/components/json-ld';
import { siteDescription, siteName, siteTagline, getSiteUrl } from '@/lib/site';
import { defaultOgImage, organizationSchema, websiteSchema } from '@/lib/seo';
import { getPublicCatalogSnapshot } from '@/lib/storefront';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteName} | ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  alternates: {
    canonical: '/',
  },
  keywords: [
    'dog travel accessories South Africa',
    'dog car seat cover South Africa',
    'dog toys online South Africa',
    'dog treats online South Africa',
    'pet grooming products South Africa',
    'dog travel kit South Africa',
  ],
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || 'google-search-console-verification-placeholder',
  },
  openGraph: {
    type: 'website',
    siteName,
    title: siteName,
    description: siteDescription,
    url: '/',
    images: [defaultOgImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  themeColor: '#174132',
};

export const dynamic = 'force-dynamic';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { categories, products } = await getPublicCatalogSnapshot();

  return (
    <html lang="en">
      <body>
        <CartProvider products={products}>
          <SiteHeader categories={categories} />
          <main className="siteMain">{children}</main>
          <SiteFooter />
          <JsonLd data={[organizationSchema(), websiteSchema()]} />
          <AnalyticsPlaceholder />
          <CartDrawer />
          <Toasts />
        </CartProvider>
      </body>
    </html>
  );
}
