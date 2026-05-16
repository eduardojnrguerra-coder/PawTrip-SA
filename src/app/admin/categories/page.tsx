import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { AdminCategoryForm } from '@/components/admin-category-form';
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
      {params.error === 'duplicate' ? <p className="errorText">That category slug is already in use. Choose a different slug.</p> : null}
      {params.error && params.error !== 'duplicate' ? <p className="errorText">Category could not be saved.</p> : null}
      {categoriesResult.error ? <p className="errorText">Categories could not be loaded: {categoriesResult.error}</p> : null}

      <div className="contentCard detailBlock">
        <h2>Add category</h2>
        <AdminCategoryForm action={saveCategoryAction} submitLabel="Save category" />
      </div>

      <div className="adminCategoryGrid">
        {categories.map((category) => (
          <div className="contentCard detailBlock" key={category.id}>
            <h2>{category.name}</h2>
            <AdminCategoryForm category={category} action={saveCategoryAction} submitLabel="Update category" />
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
