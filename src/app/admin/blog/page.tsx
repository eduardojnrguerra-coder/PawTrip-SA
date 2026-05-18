import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { publishedBlogPosts } from '@/data/blog';

export const metadata: Metadata = {
  title: 'Admin blog',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage() {
  await requireAdminUser();

  return (
    <AdminShell title="Blog" description="Review published guide content and plan the move to database-managed posts.">
      <div className="contentCard detailBlock">
        <h2>Blog management status</h2>
        <p>
          Blog posts are currently managed in <code>src/data/blog.ts</code>. This page gives admin visibility now. Full create/edit/delete publishing needs a
          Supabase <code>blog_posts</code> table so content can be edited without code changes.
        </p>
      </div>

      <div className="contentCard detailBlock">
        <h2>Published guides</h2>
        <div className="adminProductTable">
          {publishedBlogPosts.map((post) => (
            <div className="adminProductRow" key={post.slug}>
              <div className="adminProductThumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={post.image || '/products/placeholder-brand.jpg'} alt={post.title} />
              </div>
              <div>
                <strong>{post.title}</strong>
                <p>{post.excerpt}</p>
                <div className="adminWarningList">
                  <span className="statusPill status-active">{post.category}</span>
                  <span className="statusPill status-processing">{post.readTime}</span>
                  {!post.seoTitle || !post.seoDescription ? <span className="statusPill status-pending">Missing SEO</span> : null}
                </div>
              </div>
              <div>
                <strong>{new Date(post.date).toLocaleDateString('en-ZA')}</strong>
                <p>{post.relatedProductSlugs?.length ?? 0} related products</p>
              </div>
              <div className="cardActions">
                <Link href={`/blog/${post.slug}`} className="button buttonGhost buttonSmall">
                  Preview article
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Database publishing fields needed</h2>
        <p>
          Recommended fields: title, slug, excerpt, content, category, featured_image, seo_title, seo_description, status, is_featured,
          related_product_slugs and timestamps.
        </p>
      </div>
    </AdminShell>
  );
}
