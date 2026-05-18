import type { Metadata } from 'next';
import { AdminShell } from '@/components/admin-shell';
import { requireAdminUser } from '@/lib/supabase/server';
import { getOptionalPayFastConfig } from '@/lib/payfast';
import { siteDescription, siteName, siteTagline } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Admin settings',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  await requireAdminUser();
  const payfast = getOptionalPayFastConfig();

  return (
    <AdminShell title="Settings" description="Store operating settings and environment health.">
      <div className="adminDetailGrid">
        <div className="contentCard detailBlock">
          <span className="eyebrow">Store</span>
          <h2>{siteName}</h2>
          <p>{siteTagline}</p>
          <p>{siteDescription}</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">Support</span>
          <h2>support@pawtripsa.co.za</h2>
          <p>Primary customer support email shown on the public site.</p>
          <p>WhatsApp number is not configured as a primary public support flow.</p>
        </div>
        <div className="contentCard detailBlock">
          <span className="eyebrow">PayFast</span>
          <h2>{payfast ? payfast.mode : 'Not configured'}</h2>
          <p>{payfast ? 'Merchant credentials are present server-side.' : 'Add PayFast environment variables before taking payments.'}</p>
        </div>
      </div>

      <div className="contentCard detailBlock">
        <h2>Editable settings status</h2>
        <p>
          Store support email, WhatsApp number, delivery message, returns message and homepage announcement are currently code/config driven. To edit them
          directly in admin, add a Supabase <code>site_settings</code> table and load those values in the public components.
        </p>
      </div>
    </AdminShell>
  );
}
