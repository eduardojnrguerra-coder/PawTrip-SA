import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, FileText, Gauge, ImageIcon, Link2, PackageCheck, Search, ShoppingCart } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listCategoriesAdmin, listKitsAdmin, listOrdersAdmin, listProductsAdmin } from '@/lib/supabase/admin';
import { getAdminProductReadiness } from '@/lib/admin-marketing';
import { publishedBlogPosts } from '@/data/blog';
import { collections } from '@/data/collections';
import { problemPageDefinitions } from '@/lib/problem-seo';

export const metadata: Metadata = {
  title: 'Marketing and SEO',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminMarketingPage() {
  await requireAdminUser();
  const [productsResult, categoriesResult, kitsResult, ordersResult] = await Promise.all([
    listProductsAdmin(),
    listCategoriesAdmin(),
    listKitsAdmin(),
    listOrdersAdmin(100),
  ]);
  const products = productsResult.data ?? [];
  const categories = categoriesResult.data ?? [];
  const kits = kitsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const readiness = products.map((product) => ({ product, readiness: getAdminProductReadiness(product) }));
  const activeProducts = products.filter((product) => product.is_active);
  const missingImages = readiness.filter((entry) => !entry.readiness.hasImage);
  const missingSeo = readiness.filter((entry) => !entry.readiness.hasSeo);
  const noProblemLinks = readiness.filter((entry) => !entry.readiness.matchedProblems.length);
  const lowMargin = readiness.filter((entry) => entry.readiness.marginWarning);
  const lowStock = readiness.filter((entry) => !entry.readiness.hasStock);
  const productsNeedingWork = readiness
    .filter((entry) => entry.readiness.score < 80 || entry.readiness.warnings.length)
    .sort((a, b) => a.readiness.score - b.readiness.score)
    .slice(0, 10);
  const categoriesNeedingWork = categories.filter(
    (category) =>
      category.is_active &&
      ((category.description?.trim().length ?? 0) < 80 || !category.seo_title || !category.seo_description),
  );
  const blogsWithoutProductLinks = publishedBlogPosts.filter(
    (post) => !(post.relatedProductSlugs?.length || post.recommendedProductSlugs?.length || post.ctaBundleSlug),
  );
  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const pendingPaymentOrders = orders.filter((order) => ['pending', 'pending_payment'].includes(order.payment_status));
  const sitemapCount =
    11 +
    activeProducts.length +
    categories.filter((category) => category.is_active).length +
    collections.length +
    problemPageDefinitions.length +
    publishedBlogPosts.length;
  const averageScore = readiness.length
    ? Math.round(readiness.reduce((sum, entry) => sum + entry.readiness.score, 0) / readiness.length)
    : 0;
  const liveKits = kits.filter((kit) => kit.active);

  return (
    <AdminShell
      title="Marketing / SEO"
      description="A practical readiness board for organic traffic, product discovery and conversion."
      actions={
        <>
          <Link href="/admin/products/new" className="button buttonPrimary buttonSheen">
            Add product
          </Link>
          <Link href="/blog" className="button buttonSecondary">
            View blog
          </Link>
        </>
      }
    >
      <div className="adminStatsGrid adminStatsGridWide">
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <Gauge size={14} /> Readiness score
          </span>
          <h2>{averageScore}%</h2>
          <p>Average product launch readiness.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <PackageCheck size={14} /> Live products
          </span>
          <h2>{activeProducts.length}</h2>
          <p>{liveKits.length} active kits.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <ImageIcon size={14} /> Missing images
          </span>
          <h2>{missingImages.length}</h2>
          <p>Products without a main or gallery image.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <Search size={14} /> Missing SEO
          </span>
          <h2>{missingSeo.length}</h2>
          <p>Products missing title or meta description depth.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <Link2 size={14} /> No problem links
          </span>
          <h2>{noProblemLinks.length}</h2>
          <p>Products not matching a computed problem cluster.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <AlertTriangle size={14} /> Low stock
          </span>
          <h2>{lowStock.length}</h2>
          <p>Products or variants with no available stock.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <ShoppingCart size={14} /> Pending payment
          </span>
          <h2>{pendingPaymentOrders.length}</h2>
          <p>{paidOrders.length} paid orders in the latest sample.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <FileText size={14} /> Sitemap URLs
          </span>
          <h2>{sitemapCount}</h2>
          <p>Estimated indexable routes after dynamic data loads.</p>
        </div>
      </div>

      <div className="adminDashboardColumns">
        <div className="contentCard detailBlock">
          <h2>Products needing work</h2>
          {!productsNeedingWork.length ? (
            <p>All products look launch-ready from the current checklist.</p>
          ) : (
            <div className="adminSimpleTable">
              {productsNeedingWork.map(({ product, readiness: score }) => (
                <div className="adminSimpleRow" key={product.id}>
                  <div>
                    <strong>{product.title}</strong>
                    <p>{score.warnings.slice(0, 3).join(', ')}</p>
                  </div>
                  <span className={score.score >= 80 ? 'statusPill status-paid' : 'statusPill status-pending'}>
                    {score.score}%
                  </span>
                  <Link href={`/admin/products/${product.id}/edit`} className="button buttonGhost buttonSmall">
                    Fix
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="contentCard detailBlock">
          <h2>SEO content gaps</h2>
          <div className="adminSimpleTable">
            <div className="adminSimpleRow">
              <div>
                <strong>Thin category pages</strong>
                <p>Missing useful description or SEO fields.</p>
              </div>
              <span className="statusPill status-pending">{categoriesNeedingWork.length}</span>
            </div>
            <div className="adminSimpleRow">
              <div>
                <strong>Blogs without product links</strong>
                <p>Guides should send readers toward relevant products.</p>
              </div>
              <span className="statusPill status-pending">{blogsWithoutProductLinks.length}</span>
            </div>
            <div className="adminSimpleRow">
              <div>
                <strong>Low-margin products</strong>
                <p>Price is equal to or below the stored cost price.</p>
              </div>
              <span className="statusPill status-pending">{lowMargin.length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Problem landing pages now in the SEO system</h2>
        <p>
          These pages are computed from existing product/category/blog data and added to the sitemap. No new Supabase relationship
          tables are required for this v1.
        </p>
        <div className="internalLinkList">
          {problemPageDefinitions.map((problem) => (
            <Link href={`/problems/${problem.slug}`} key={problem.slug}>
              <span>
                <strong>{problem.title}</strong>
                <br />
                {problem.seoDescription}
              </span>
              <strong>View</strong>
            </Link>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Admin guidance</h2>
        <ul className="bulletList">
          <li>
            <PackageCheck size={16} /> <span>Publish only products with strong images, clear SEO copy, stock and a problem match.</span>
          </li>
          <li>
            <Link2 size={16} /> <span>Use product tags and benefits to help the computed problem links become more accurate.</span>
          </li>
          <li>
            <FileText size={16} /> <span>Every blog should link to at least one relevant product, category or problem page.</span>
          </li>
        </ul>
      </div>
    </AdminShell>
  );
}
