import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { AdminKitForm } from '@/components/admin-kit-form';
import { createKitAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { listCategoriesAdmin, listProductsAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Create kit',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function NewKitPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const [categoriesResult, productsResult] = await Promise.all([listCategoriesAdmin(), listProductsAdmin({ status: 'all' })]);

  return (
    <AdminShell title="Create kit" description="Build a bundle from existing products and control how it appears on Shop by Problem.">
      {categoriesResult.error ? <p className="errorText">Categories could not be loaded: {categoriesResult.error}</p> : null}
      {productsResult.error ? <p className="errorText">Products could not be loaded: {productsResult.error}</p> : null}
      <AdminKitForm
        categories={categoriesResult.data ?? []}
        products={productsResult.data ?? []}
        action={createKitAction}
        submitLabel="Create kit"
        error={params.error}
      />
    </AdminShell>
  );
}
