import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { AdminProductForm } from '@/components/admin-product-form';
import { deleteProductAction, updateProductAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { getProductByIdAdmin, listCategoriesAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Edit product',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  await requireAdminUser();
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const [categoriesResult, productResult] = await Promise.all([listCategoriesAdmin(), getProductByIdAdmin(id)]);

  if (!productResult.data) notFound();

  return (
    <AdminShell title="Edit product" description="Update pricing, descriptions, images and publishing status.">
      <AdminProductForm
        categories={categoriesResult.data ?? []}
        initialProduct={productResult.data}
        action={updateProductAction}
        deleteAction={deleteProductAction}
        error={query.error}
        saved={Boolean(query.saved)}
      />
    </AdminShell>
  );
}
