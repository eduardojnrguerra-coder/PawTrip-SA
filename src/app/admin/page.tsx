import Link from 'next/link';
import type { Metadata } from 'next';
import { AlertTriangle, Banknote, Boxes, Package2, ShoppingCart, Tags } from 'lucide-react';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listKitsAdmin, listOrdersAdmin, listProductsAdmin } from '@/lib/supabase/admin';

export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  await requireAdminUser();
  const [productsResult, ordersResult, kitsResult] = await Promise.all([listProductsAdmin(), listOrdersAdmin(100), listKitsAdmin()]);
  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const kits = kitsResult.data ?? [];
  const activeProducts = products.filter((product) => product.is_active).length;
  const draftProducts = products.filter((product) => !product.is_active).length;
  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const pendingOrders = orders.filter((order) => ['pending', 'pending_payment'].includes(order.payment_status));
  const unfulfilledOrders = orders.filter((order) => order.fulfillment_status === 'unfulfilled');
  const revenue = paidOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const averageOrderValue = paidOrders.length ? revenue / paidOrders.length : 0;
  const lowStock = products.filter((product) => Number(product.stock_quantity || 0) <= 3);
  const lowStockProducts = lowStock.length;
  const productCostBySlug = new Map(products.map((product) => [product.slug, Number(product.cost_price || 0)]));
  const estimatedCost = paidOrders.reduce((sum, order) => {
    const itemCost = (order.order_items ?? []).reduce((itemSum, item) => {
      const cost = productCostBySlug.get(item.product_slug || '') ?? 0;
      return itemSum + cost * Number(item.quantity || 0);
    }, 0);
    return sum + itemCost;
  }, 0);
  const estimatedGrossProfit = Math.max(0, revenue - estimatedCost);
  const salesByProduct = new Map<string, { title: string; quantity: number; revenue: number }>();
  paidOrders.forEach((order) => {
    (order.order_items ?? []).forEach((item) => {
      const key = item.product_slug || item.product_title;
      const current = salesByProduct.get(key) ?? { title: item.product_title, quantity: 0, revenue: 0 };
      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.line_total || 0);
      salesByProduct.set(key, current);
    });
  });
  const topSellingProducts = Array.from(salesByProduct.values()).sort((a, b) => b.quantity - a.quantity).slice(0, 5);
  const ordersNeedingAction = orders.filter((order) => order.payment_status === 'paid' && order.fulfillment_status === 'unfulfilled');

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
      <div className="adminStatsGrid adminStatsGridWide">
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
          <span className="eyebrow">Active kits</span>
          <h2>{kits.filter((kit) => kit.active).length}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Low stock</span>
          <h2>{lowStockProducts}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <ShoppingCart size={14} /> Total orders
          </span>
          <h2>{orders.length}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Paid orders</span>
          <h2>{paidOrders.length}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Pending payment</span>
          <h2>{pendingOrders.length}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Unfulfilled</span>
          <h2>{unfulfilledOrders.length}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <Banknote size={14} /> Revenue
          </span>
          <h2>R{revenue.toFixed(2)}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Gross profit estimate</span>
          <h2>R{estimatedGrossProfit.toFixed(2)}</h2>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Average order value</span>
          <h2>R{averageOrderValue.toFixed(2)}</h2>
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
        <Link href="/admin/kits" className="contentCard detailBlock adminQuickCard">
          <Boxes size={18} />
          <strong>Manage kits</strong>
          <p>Create bundles for Shop by Problem and guided shopping.</p>
        </Link>
      </div>

      <div className="contentCard detailBlock">
        <h2>Orders needing action</h2>
        {!ordersNeedingAction.length ? (
          <p>No paid unfulfilled orders right now.</p>
        ) : (
          <div className="adminSimpleTable">
            {ordersNeedingAction.slice(0, 6).map((order) => (
              <div className="adminSimpleRow" key={order.id}>
                <div>
                  <strong>{order.order_reference}</strong>
                  <p>{order.customer_name}</p>
                </div>
                <div>
                  <strong>{order.payment_status}</strong>
                  <p>{order.fulfillment_status}</p>
                </div>
                <Link href={`/admin/orders/${order.order_reference}`} className="button buttonGhost buttonSmall">
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="adminDashboardColumns">
        <div className="contentCard detailBlock">
          <h2>Top-selling products</h2>
          {!topSellingProducts.length ? (
            <p>No paid product sales yet.</p>
          ) : (
            <div className="adminSimpleTable">
              {topSellingProducts.map((item) => (
                <div className="adminSimpleRow" key={item.title}>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.quantity} sold</p>
                  </div>
                  <strong>R{item.revenue.toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="contentCard detailBlock">
          <h2>Low-stock products</h2>
          {!lowStock.length ? (
            <p>No low-stock products.</p>
          ) : (
            <div className="adminSimpleTable">
              {lowStock.slice(0, 8).map((product) => (
                <div className="adminSimpleRow" key={product.id}>
                  <div>
                    <strong>{product.title}</strong>
                    <p>{product.sku || product.slug}</p>
                  </div>
                  <span className="statusPill status-pending">
                    <AlertTriangle size={13} /> {product.stock_quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
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
                <Link href={`/admin/orders/${order.order_reference}`} className="button buttonGhost buttonSmall">
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
