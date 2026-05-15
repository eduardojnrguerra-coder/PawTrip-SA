import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { AdminProductForm } from '@/components/admin-product-form';
import { createProductAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { listCategoriesAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Add product',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminNewProductPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const categoriesResult = await listCategoriesAdmin();

  return (
    <AdminShell title="Add product" description="Create a new product or draft without touching code.">
      <AdminProductForm categories={categoriesResult.data ?? []} action={createProductAction} error={params.error} />
    </AdminShell>
  );
}
