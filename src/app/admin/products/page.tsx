import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listCategoriesAdmin, listProductsAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Admin products',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; status?: 'active' | 'draft' | 'all'; created?: string; deleted?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const [categoriesResult, productsResult] = await Promise.all([
    listCategoriesAdmin(),
    listProductsAdmin({
      search: params.q,
      categoryId: params.category,
      status: params.status || 'all',
    }),
  ]);

  const categories = categoriesResult.data ?? [];
  const products = productsResult.data ?? [];

  return (
    <AdminShell
      title="Products"
      description="Search, filter and edit public and draft products."
      actions={<Link href="/admin/products/new" className="button buttonPrimary buttonSheen">Add product</Link>}
    >
      {params.created ? <p className="successText">Product created.</p> : null}
      {params.deleted ? <p className="successText">Product deleted.</p> : null}
      {categoriesResult.error ? <p className="errorText">Categories could not be loaded: {categoriesResult.error}</p> : null}
      {productsResult.error ? <p className="errorText">Products could not be loaded: {productsResult.error}</p> : null}
      <form className="contentCard detailBlock adminFilters" method="get">
        <input className="input" type="search" name="q" defaultValue={params.q ?? ''} placeholder="Search by title, slug or SKU" />
        <select className="input" name="category" defaultValue={params.category ?? ''}>
          <option value="">All categories</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select className="input" name="status" defaultValue={params.status ?? 'all'}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
        </select>
        <button className="button buttonSecondary" type="submit">
          Filter
        </button>
      </form>

      <div className="contentCard detailBlock">
        <div className="adminProductTable">
          {products.map((product) => (
            <div className="adminProductRow" key={product.id}>
              <div className="adminProductThumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.main_image_url || '/products/placeholder-brand.jpg'} alt={product.title} />
              </div>
              <div>
                <strong>{product.title}</strong>
                <p>{product.categories?.name || 'No category'}</p>
              </div>
              <div>
                <strong>R{Number(product.price || 0).toFixed(2)}</strong>
                <p>Stock: {Number(product.stock_quantity || 0)}</p>
              </div>
              <div>
                <span className={product.is_active ? 'statusPill status-active' : 'statusPill status-draft'}>
                  {product.is_active ? 'Active' : 'Draft'}
                </span>
                {product.is_featured ? <span className="statusPill status-processing">Featured</span> : null}
                <span className={product.main_image_url ? 'statusPill status-active' : 'statusPill status-draft'}>
                  {product.main_image_url ? 'Image ready' : 'No image'}
                </span>
              </div>
              <div className="cardActions">
                <Link href={`/admin/products/${product.id}/edit`} className="button buttonSecondary buttonSmall">
                  Edit
                </Link>
                <Link href={`/shop/product/${product.slug}`} className="button buttonGhost buttonSmall">
                  View
                </Link>
              </div>
            </div>
          ))}
          {!products.length ? <p>No products found.</p> : null}
        </div>
      </div>
    </AdminShell>
  );
}
