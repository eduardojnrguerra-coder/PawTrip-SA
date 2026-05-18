import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { AdminShell } from '@/components/admin-shell';
import { AdminCopyButton } from '@/components/admin-copy-button';
import { markOrderPaidManualAction, updateOrderFulfillmentAction } from '@/app/admin/actions';
import { requireAdminUser } from '@/lib/supabase/server';
import { getOrderByReferenceAdmin } from '@/lib/supabase/admin';
import { formatZar } from '@/lib/money';

export const metadata: Metadata = {
  title: 'Admin order detail',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function deliveryAddress(order: { delivery_address: Record<string, unknown> }) {
  const address = order.delivery_address;
  return [address.address, address.suburb, address.city, address.province, address.postalCode].filter(Boolean).join(', ');
}

function statusLabel(status: string) {
  return status.replace(/_/g, ' ');
}

function phoneForWhatsApp(phone: string) {
  return phone.replace(/\D/g, '').replace(/^0/, '27');
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ reference: string }>;
  searchParams: Promise<{ paid?: string; error?: string }>;
}) {
  await requireAdminUser();
  const { reference } = await params;
  const pageParams = await searchParams;
  const orderReference = decodeURIComponent(reference);
  const orderResult = await getOrderByReferenceAdmin(orderReference);
  const order = orderResult.data;

  if (!orderResult.configured || orderResult.error || !order) notFound();

  const address = deliveryAddress(order);
  const whatsappNumber = phoneForWhatsApp(order.customer_phone);
  const messageTemplates = [
    ['Payment received', `Hi ${order.customer_name}, payment for PawTrip SA order ${order.order_reference} has been received. We are processing your order now.`],
    ['Order processing', `Hi ${order.customer_name}, your PawTrip SA order ${order.order_reference} is being processed. We will update you when the next step is ready.`],
    ['Delivery update', `Hi ${order.customer_name}, quick update on PawTrip SA order ${order.order_reference}: delivery timing depends on product availability and your location.`],
    ['Tracking sent', `Hi ${order.customer_name}, tracking for PawTrip SA order ${order.order_reference} has been sent. Please keep your order reference handy.`],
    ['Out of stock apology', `Hi ${order.customer_name}, sorry, one item in PawTrip SA order ${order.order_reference} needs an availability update. We will confirm options before proceeding.`],
    ['Review request', `Hi ${order.customer_name}, thank you for ordering from PawTrip SA. When you have used your product, we would appreciate honest feedback about order ${order.order_reference}.`],
  ];

  return (
    <AdminShell
      title={`Order ${order.order_reference}`}
      description="Customer details, payment status, fulfilment controls and support templates."
      actions={<Link href="/admin/orders" className="button buttonSecondary">Back to orders</Link>}
    >
      {pageParams.paid ? <p className="successText">Order was manually marked as paid.</p> : null}
      {pageParams.error ? <p className="errorText">Order action could not be completed.</p> : null}

      <div className="adminDetailGrid">
        <div className="contentCard detailBlock">
          <span className="eyebrow">Customer</span>
          <h2>{order.customer_name}</h2>
          <p>{order.customer_email}</p>
          <p>{order.customer_phone}</p>
          <div className="cardActions">
            <a className="button buttonSecondary buttonSmall" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer">
              Open WhatsApp
            </a>
            <AdminCopyButton value={order.customer_phone} label="Copy phone" />
          </div>
        </div>

        <div className="contentCard detailBlock">
          <span className="eyebrow">Payment</span>
          <h2 className={`statusHeading statusText-${order.payment_status}`}>{statusLabel(order.payment_status)}</h2>
          <p>Total: {formatZar(Number(order.total))}</p>
          <p>PayFast reference: {order.payfast_payment_id || 'Not stored yet'}</p>
          <p>Created: {new Date(order.created_at).toLocaleString('en-ZA')}</p>
        </div>

        <div className="contentCard detailBlock">
          <span className="eyebrow">Fulfilment</span>
          <h2>{statusLabel(order.fulfillment_status)}</h2>
          <form className="adminFulfillmentForm" action={updateOrderFulfillmentAction}>
            <input type="hidden" name="orderReference" value={order.order_reference} />
            <label className="field">
              <span>Fulfilment status</span>
              <select className="input" name="fulfillmentStatus" defaultValue={order.fulfillment_status}>
                <option value="unfulfilled">Unfulfilled</option>
                <option value="packed">Packed</option>
                <option value="ordered_from_supplier">Ordered from supplier</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <button className="button buttonSecondary" type="submit">Update fulfilment</button>
          </form>
        </div>
      </div>

      <div className="contentCard detailBlock">
        <div className="sectionHeaderInline">
          <div>
            <span className="eyebrow">Delivery</span>
            <h2>Address</h2>
            <p>{address || 'No delivery address stored.'}</p>
          </div>
          <AdminCopyButton value={address} label="Copy address" />
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Items</h2>
        <div className="adminSimpleTable">
          {(order.order_items?.length ? order.order_items : []).map((item) => (
            <div className="adminSimpleRow" key={item.id}>
              <div>
                <strong>{item.product_title}</strong>
                <p>{item.product_slug || 'No product slug'} x {item.quantity}</p>
              </div>
              <div>
                <strong>{formatZar(Number(item.line_total))}</strong>
                <p>{formatZar(Number(item.unit_price))} each</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>WhatsApp message helpers</h2>
        <div className="adminTemplateGrid">
          {messageTemplates.map(([label, message]) => (
            <div className="adminTemplateCard" key={label}>
              <strong>{label}</strong>
              <p>{message}</p>
              <a className="button buttonSecondary buttonSmall" href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">
                Open message
              </a>
            </div>
          ))}
        </div>
      </div>

      {order.payment_status !== 'paid' ? (
        <div className="contentCard detailBlock dangerCard">
          <h2>Manual payment safety tool</h2>
          <p>Use only after checking PayFast or bank evidence. Automatic PayFast ITN remains the preferred path.</p>
          <form action={markOrderPaidManualAction} className="adminFulfillmentForm">
            <input type="hidden" name="orderReference" value={order.order_reference} />
            <label className="adminToggle">
              <input type="checkbox" name="confirmManualPaid" value="yes" required />
              <span>I confirm this order should be marked paid manually.</span>
            </label>
            <button className="button buttonPrimary" type="submit">Mark as paid manually</button>
          </form>
        </div>
      ) : null}
    </AdminShell>
  );
}
