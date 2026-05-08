import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { LockKeyhole, PackageCheck, ShieldCheck } from 'lucide-react';
import { ADMIN_COOKIE_NAME, isAdminConfigured, isAdminTokenValid } from '@/lib/admin-auth';
import { listSupabaseOrders, type SupabaseOrder } from '@/lib/supabase';
import { formatZar } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Admin orders',
  description: 'Internal PawTrip SA order management.',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

function deliveryAddress(order: SupabaseOrder) {
  const address = order.delivery_address;
  return [
    address.address,
    address.suburb,
    address.city,
    address.province,
    address.postalCode,
  ]
    .filter(Boolean)
    .join(', ');
}

function orderItems(order: SupabaseOrder) {
  return order.items.map((item) => {
    const name = String(item.name ?? item.productSlug ?? 'Product');
    const quantity = Number(item.quantity ?? 1);
    return `${name} x ${quantity}`;
  });
}

function LoginPanel({ error }: { error?: string }) {
  return (
    <section className="section">
      <div className="container narrowContainer">
        <div className="contentCard detailBlock">
          <span className="eyebrow">
            <LockKeyhole size={14} /> Internal admin
          </span>
          <h1>Orders are password protected.</h1>
          <p>Enter the admin password to view and manage PawTrip SA orders.</p>
          {error ? <p className="errorText">Password check failed. Please try again.</p> : null}
          <form className="adminLoginForm" action="/admin/orders/login" method="post">
            <label className="field">
              <span>Admin password</span>
              <input className="input" type="password" name="password" autoComplete="current-password" required />
            </label>
            <button className="button buttonPrimary buttonSheen" type="submit">
              View orders
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: { error?: string; updated?: string } }) {
  if (!isAdminConfigured()) {
    return (
      <section className="section">
        <div className="container narrowContainer">
          <div className="contentCard detailBlock">
            <span className="eyebrow">
              <ShieldCheck size={14} /> Locked
            </span>
            <h1>Admin is not configured.</h1>
            <p>Add `ADMIN_PASSWORD` to your environment before using the internal order admin.</p>
          </div>
        </div>
      </section>
    );
  }

  const cookieStore = await cookies();
  const authorized = isAdminTokenValid(cookieStore.get(ADMIN_COOKIE_NAME)?.value);

  if (!authorized) return <LoginPanel error={searchParams.error} />;

  const ordersResult = await listSupabaseOrders();

  return (
    <section className="section adminSection">
      <div className="container">
        <div className="sectionHeader">
          <span className="eyebrow">
            <PackageCheck size={14} /> Internal admin
          </span>
          <h1>Orders</h1>
          <p>Review PayFast payment status, customer details and fulfilment progress.</p>
          {searchParams.updated ? <p className="successText">Fulfilment status updated.</p> : null}
          {searchParams.error && searchParams.error !== '1' ? <p className="errorText">The admin action could not be completed.</p> : null}
        </div>

        {!ordersResult.configured ? (
          <div className="contentCard detailBlock">
            <h2>Supabase is not configured.</h2>
            <p>Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to view stored orders here.</p>
          </div>
        ) : ordersResult.error ? (
          <div className="contentCard detailBlock">
            <h2>Orders could not be loaded.</h2>
            <p>{ordersResult.error}</p>
          </div>
        ) : !ordersResult.data?.length ? (
          <div className="contentCard detailBlock">
            <h2>No orders yet.</h2>
            <p>Orders will appear here after checkout creates them in Supabase.</p>
          </div>
        ) : (
          <div className="adminOrdersGrid">
            {ordersResult.data.map((order) => (
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
                    <strong>{formatZar(order.total)}</strong>
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
                      {orderItems(order).map((item) => (
                        <li key={item}>{item}</li>
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

                <form className="adminFulfillmentForm" action="/admin/orders/update-fulfillment" method="post">
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
      </div>
    </section>
  );
}
