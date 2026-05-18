import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { listOrdersAdmin } from '@/lib/supabase/admin';
import { formatZar } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Admin customers',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  await requireAdminUser();
  const ordersResult = await listOrdersAdmin(100);
  const customers = new Map<
    string,
    { name: string; email: string; phone: string; orderCount: number; totalSpend: number; lastOrderDate: string; notes: string }
  >();

  (ordersResult.data ?? []).forEach((order) => {
    const key = order.customer_email || order.customer_phone || order.customer_name;
    const current = customers.get(key) ?? {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      orderCount: 0,
      totalSpend: 0,
      lastOrderDate: order.created_at,
      notes: 'Customer notes require the optional customer_notes table.',
    };
    current.orderCount += 1;
    if (order.payment_status === 'paid') current.totalSpend += Number(order.total || 0);
    if (new Date(order.created_at) > new Date(current.lastOrderDate)) current.lastOrderDate = order.created_at;
    customers.set(key, current);
  });

  return (
    <AdminShell title="Customers" description="A simple customer view derived from orders.">
      {!ordersResult.configured ? (
        <div className="contentCard detailBlock">
          <h2>Supabase is not configured.</h2>
          <p>Add Supabase environment variables to view customers.</p>
        </div>
      ) : (
        <div className="contentCard detailBlock">
          <h2>Customers</h2>
          <div className="adminSimpleTable">
            {Array.from(customers.values()).map((customer) => (
              <div className="adminSimpleRow" key={customer.email || customer.phone}>
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.email} · {customer.phone}</p>
                </div>
                <div>
                  <strong>{customer.orderCount} orders</strong>
                  <p>{formatZar(customer.totalSpend)} paid spend</p>
                </div>
                <div>
                  <strong>Last order</strong>
                  <p>{new Date(customer.lastOrderDate).toLocaleDateString('en-ZA')}</p>
                </div>
              </div>
            ))}
            {!customers.size ? <p>No customers yet.</p> : null}
          </div>
        </div>
      )}

      <div className="contentCard detailBlock">
        <h2>Contact messages</h2>
        <p>
          The public contact form currently uses a mailto fallback and does not save messages. To manage unread, replied and archived contact messages here,
          add a lightweight contact_messages table or connect an email service such as Resend, Brevo or Formspree.
        </p>
      </div>
    </AdminShell>
  );
}
