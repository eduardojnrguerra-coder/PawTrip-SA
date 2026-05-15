import Link from 'next/link';
import type { Metadata } from 'next';
import { Package2, ShoppingCart, Tags } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listOrdersAdmin, listProductsAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const [productsResult, ordersResult] = await Promise.all([listProductsAdmin(), listOrdersAdmin(6)]);
  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const activeProducts = products.filter((product) => product.is_active).length;
  const draftProducts = products.filter((product) => !product.is_active).length;
  const lowStockProducts = products.filter((product) => Number(product.stock_quantity || 0) <= 3).length;

  return (
    <AdminShell
      title="Dashboard"
      description="A simple control room for products, categories and orders."
      actions={
        <>
          <Link href="/admin/products/new" className="button buttonPrimary buttonSheen">
            Add product
          </Link>
          <Link href="/admin/orders" className="button buttonSecondary">
            View orders
          </Link>
        </>
      }
    >
      <div className="adminStatsGrid">
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <Package2 size={14} /> Active products
          </span>
          <h2>{activeProducts}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Draft products</span>
          <h2>{draftProducts}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Low stock</span>
          <h2>{lowStockProducts}</h2>
        </div>
      </div>

      <div className="adminQuickGrid">
        <Link href="/admin/products" className="contentCard detailBlock adminQuickCard">
          <Package2 size={18} />
          <strong>View products</strong>
          <p>Search, filter and edit the live catalogue.</p>
        </Link>
        <Link href="/admin/orders" className="contentCard detailBlock adminQuickCard">
          <ShoppingCart size={18} />
          <strong>View orders</strong>
          <p>Check payment status and fulfilment updates.</p>
        </Link>
        <Link href="/admin/categories" className="contentCard detailBlock adminQuickCard">
          <Tags size={18} />
          <strong>Manage categories</strong>
          <p>Control the active public menu and category copy.</p>
        </Link>
      </div>

      <div className="contentCard detailBlock">
        <h2>Latest orders</h2>
        {!orders.length ? (
          <p>No orders yet.</p>
        ) : (
          <div className="adminSimpleTable">
            {orders.map((order) => (
              <div className="adminSimpleRow" key={order.id}>
                <div>
                  <strong>{order.order_reference}</strong>
                  <p>{order.customer_name}</p>
                </div>
                <div>
                  <strong>{order.payment_status}</strong>
                  <p>{order.fulfillment_status}</p>
                </div>
                <Link href="/admin/orders" className="button buttonGhost buttonSmall">
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
