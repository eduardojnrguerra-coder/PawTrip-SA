import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminKitForm } from '@/components/admin-kit-form';
import { updateKitAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { getKitByIdAdmin, listCategoriesAdmin, listProductsAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Edit kit',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function EditKitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdminUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [kitResult, categoriesResult, productsResult] = await Promise.all([
    getKitByIdAdmin(id),
    listCategoriesAdmin(),
    listProductsAdmin({ status: 'all' }),
  ]);

  if (!kitResult.data) notFound();

  return (
    <AdminShell title={`Edit ${kitResult.data.title}`} description="Update kit pricing, contents, images and publishing state.">
      {kitResult.error ? <p className="errorText">Kit could not be loaded: {kitResult.error}</p> : null}
      {categoriesResult.error ? <p className="errorText">Categories could not be loaded: {categoriesResult.error}</p> : null}
      {productsResult.error ? <p className="errorText">Products could not be loaded: {productsResult.error}</p> : null}
      <AdminKitForm
        categories={categoriesResult.data ?? []}
        products={productsResult.data ?? []}
        initialKit={kitResult.data}
        action={updateKitAction}
        submitLabel="Save kit"
        error={query.error}
        saved={query.saved === '1'}
      />
    </AdminShell>
  );
}
