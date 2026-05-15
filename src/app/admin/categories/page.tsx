import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { saveCategoryAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { listCategoriesAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Manage categories',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const categoriesResult = await listCategoriesAdmin();
  const categories = categoriesResult.data ?? [];

  return (
    <AdminShell title="Categories" description="Control the public category menu and category status.">
      {params.saved ? <p className="successText">Category saved.</p> : null}
      {params.error ? <p className="errorText">Category could not be saved.</p> : null}

      <div className="contentCard detailBlock">
        <h2>Add category</h2>
        <form action={saveCategoryAction} className="adminFormGrid">
          <label className="field">
            <span>Name</span>
            <input className="input" name="name" required />
          </label>
          <label className="field">
            <span>Slug</span>
            <input className="input" name="slug" />
          </label>
          <label className="field fieldFull">
            <span>Description</span>
            <textarea className="textarea" name="description" rows={3} />
          </label>
          <label className="field">
            <span>Image URL</span>
            <input className="input" name="imageUrl" />
          </label>
          <label className="field">
            <span>Sort order</span>
            <input className="input" name="sortOrder" type="number" defaultValue={0} />
          </label>
          <label className="adminToggle">
            <input type="checkbox" name="isActive" defaultChecked />
            <span>Active</span>
          </label>
          <div className="field fieldFull">
            <button className="button buttonPrimary buttonSheen" type="submit">
              Save category
            </button>
          </div>
        </form>
      </div>

      <div className="adminCategoryGrid">
        {categories.map((category) => (
          <div className="contentCard detailBlock" key={category.id}>
            <h2>{category.name}</h2>
            <form action={saveCategoryAction} className="adminFormGrid">
              <input type="hidden" name="id" value={category.id} />
              <label className="field">
                <span>Name</span>
                <input className="input" name="name" defaultValue={category.name} required />
              </label>
              <label className="field">
                <span>Slug</span>
                <input className="input" name="slug" defaultValue={category.slug} required />
              </label>
              <label className="field fieldFull">
                <span>Description</span>
                <textarea className="textarea" name="description" defaultValue={category.description ?? ''} rows={3} />
              </label>
              <label className="field">
                <span>Image URL</span>
                <input className="input" name="imageUrl" defaultValue={category.image_url ?? ''} />
              </label>
              <label className="field">
                <span>Sort order</span>
                <input className="input" name="sortOrder" type="number" defaultValue={category.sort_order ?? 0} />
              </label>
              <label className="adminToggle">
                <input type="checkbox" name="isActive" defaultChecked={category.is_active} />
                <span>{category.is_active ? 'Active' : 'Inactive'}</span>
              </label>
              <div className="field fieldFull">
                <button className="button buttonSecondary" type="submit">
                  Update category
                </button>
              </div>
            </form>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
