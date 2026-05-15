import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listOrdersAdmin } from '@/lib/supabase/admin';
import { formatZar } from '@/lib/money';
import { updateOrderFulfillmentAction } from '@/app/admin/actions';

export const metadata: Metadata = {
  title: 'Admin orders',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function deliveryAddress(order: { delivery_address: Record<string, unknown> }) {
  const address = order.delivery_address;
  return [address.address, address.suburb, address.city, address.province, address.postalCode].filter(Boolean).join(', ');
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ updated?: string; error?: string }> }) {
  await requireAdminUser();
  const params = await searchParams;
  const ordersResult = await listOrdersAdmin(100);
  const orders = ordersResult.data ?? [];

  return (
    <AdminShell title="Orders" description="Review payment status, customer details and fulfilment progress.">
      {params.updated ? <p className="successText">Fulfilment status updated.</p> : null}
      {params.error ? <p className="errorText">The order update could not be completed.</p> : null}

      {!ordersResult.configured ? (
        <div className="contentCard detailBlock">
          <h2>Supabase is not configured.</h2>
          <p>Add the Supabase environment variables before using the admin portal.</p>
        </div>
      ) : !orders.length ? (
        <div className="contentCard detailBlock">
          <h2>No orders yet.</h2>
          <p>Orders will appear here after checkout creates them in the database.</p>
        </div>
      ) : (
        <div className="adminOrdersGrid">
          {orders.map((order) => (
            <article className="adminOrderCard" key={order.id}>
              <div className="adminOrderTop">
                <div>
                  <span className="eyebrow">{order.order_reference}</span>
                  <h2>{order.customer_name}</h2>
                  <p>
                    {order.customer_email} · {order.customer_phone}
                  </p>
                </div>
                <div className="adminOrderTotal">
                  <strong>{formatZar(Number(order.total))}</strong>
                  <span>{new Date(order.created_at).toLocaleDateString('en-ZA')}</span>
                </div>
              </div>

              <div className="adminStatusRow">
                <span className={`statusPill status-${order.payment_status}`}>Payment: {order.payment_status}</span>
                <span className={`statusPill status-${order.fulfillment_status}`}>Fulfilment: {order.fulfillment_status}</span>
              </div>

              <div className="adminOrderDetails">
                <div>
                  <strong>Delivery</strong>
                  <p>{deliveryAddress(order) || 'No delivery address stored'}</p>
                </div>
                <div>
                  <strong>Items</strong>
                  <ul>
                    {(order.order_items?.length
                      ? order.order_items.map((item) => ({ key: item.id, label: `${item.product_title} x ${item.quantity}` }))
                      : Array.isArray(order.items)
                        ? order.items.map((item, index) => ({
                            key: `${order.id}-${index}`,
                            label: `${String(item.name ?? item.productSlug ?? 'Product')} x ${Number(item.quantity ?? 1)}`,
                          }))
                        : []
                    ).map((item) => (
                      <li key={item.key}>{item.label}</li>
                    ))}
                  </ul>
                </div>
                {order.payfast_payment_id ? (
                  <div>
                    <strong>PayFast payment ID</strong>
                    <p>{order.payfast_payment_id}</p>
                  </div>
                ) : null}
              </div>

              <form className="adminFulfillmentForm" action={updateOrderFulfillmentAction}>
                <input type="hidden" name="orderReference" value={order.order_reference} />
                <label className="field">
                  <span>Fulfilment status</span>
                  <select className="input" name="fulfillmentStatus" defaultValue={order.fulfillment_status}>
                    <option value="unfulfilled">Unfulfilled</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>
                <button className="button buttonSecondary" type="submit">
                  Update
                </button>
              </form>
            </article>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
