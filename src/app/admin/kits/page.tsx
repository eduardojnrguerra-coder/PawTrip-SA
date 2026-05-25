import Link from 'next/link';
import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { deactivateKitAction } from '@/app/admin/actions';
import { listKitsAdmin } from '@/lib/supabase/admin';
import { formatZar } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Admin kits',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function statusBadge(active: boolean) {
  return <span className={active ? 'statusBadge statusPaid' : 'statusBadge statusPending'}>{active ? 'Active' : 'Inactive'}</span>;
}

export default async function AdminKitsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: 'active' | 'inactive' | 'all'; featured?: string; created?: string; deactivated?: string; error?: string }>;
}) {
  await requireAdminUser();
  const params = await searchParams;
  const kitsResult = await listKitsAdmin({
    status: params.status || 'all',
    featured: params.featured === 'true' ? true : undefined,
  });
  const kits = kitsResult.data ?? [];

  return (
    <AdminShell
      title="Kits"
      description="Create and manage problem-led product kits shown on Shop by Problem and the public catalog."
      actions={<Link href="/admin/kits/new" className="button buttonPrimary buttonSheen">Create kit</Link>}
    >
      {params.created ? <p className="successText">Kit created.</p> : null}
      {params.deactivated ? <p className="successText">Kit deactivated.</p> : null}
      {params.error ? <p className="errorText">Kit action failed: {params.error}</p> : null}
      {kitsResult.error ? <p className="errorText">Kits could not be loaded. Run the kits SQL migration if this is the first setup.</p> : null}

      <form className="contentCard detailBlock adminFilters" method="get">
        <select className="input" name="status" defaultValue={params.status ?? 'all'}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select className="input" name="featured" defaultValue={params.featured ?? ''}>
          <option value="">All featured states</option>
          <option value="true">Featured only</option>
        </select>
        <button className="button buttonSecondary" type="submit">Filter</button>
      </form>

      <div className="adminTableWrap contentCard">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Kit</th>
              <th>Status</th>
              <th>Price</th>
              <th>Items</th>
              <th>Problem/category</th>
              <th>Sort</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {!kits.length ? (
              <tr>
                <td colSpan={7}>No kits yet. Create your first kit to power Shop by Problem.</td>
              </tr>
            ) : (
              kits.map((kit) => (
                <tr key={kit.id}>
                  <td>
                    <strong>{kit.title}</strong>
                    <span>{kit.slug}</span>
                    {!kit.image_url ? <small className="formWarning">No kit image added</small> : null}
                  </td>
                  <td>
                    {statusBadge(kit.active)}
                    {kit.featured ? <span className="statusBadge statusPaid">Featured</span> : null}
                  </td>
                  <td>
                    <strong>{formatZar(Number(kit.price || 0))}</strong>
                    {kit.compare_at_price ? <span>{formatZar(Number(kit.compare_at_price))}</span> : null}
                  </td>
                  <td>{kit.kit_items?.length ?? 0}</td>
                  <td>
                    <span>{kit.problem_key || 'No problem key'}</span>
                    <small>{kit.category || 'No category label'}</small>
                  </td>
                  <td>{kit.sort_order ?? 0}</td>
                  <td>
                    <div className="adminRowActions">
                      <Link href={`/admin/kits/${kit.id}/edit`} className="button buttonSecondary buttonSmall">Edit</Link>
                      <Link href={`/shop/product/${kit.slug}`} className="button buttonGhost buttonSmall">View</Link>
                      <form action={deactivateKitAction}>
                        <input type="hidden" name="id" value={kit.id} />
                        <button className="button buttonGhost buttonSmall" type="submit">Deactivate</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
