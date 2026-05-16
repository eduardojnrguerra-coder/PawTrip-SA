import type { Metadata } from 'next';
import { LockKeyhole } from 'lucide-react';
import { loginAdminAction } from '@/app/admin/actions';
import { BrandLogo } from '@/components/BrandLogo';
import { isSupabaseBrowserConfigured } from '@/lib/supabase/config';

export const metadata: Metadata = {
  title: 'Admin login',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;
  const configured = isSupabaseBrowserConfigured();

  return (
    <section className="section">
      <div className="container narrowContainer">
        <div className="contentCard detailBlock">
          <BrandLogo variant="full" size="lg" showTagline />
          <span className="eyebrow">
            <LockKeyhole size={14} /> PawTrip SA admin
          </span>
          <h1>Admin login</h1>
          <p>Sign in with a Supabase Auth admin account to manage products, categories and orders.</p>
          {!configured ? <p className="errorText">Supabase auth is not configured yet. Add the required environment variables first.</p> : null}
          {params.error ? <p className="errorText">Login failed. Please check the email and password.</p> : null}
          <form action={loginAdminAction} className="adminLoginForm">
            <label className="field">
              <span>Email</span>
              <input className="input" type="email" name="email" autoComplete="email" required />
            </label>
            <label className="field">
              <span>Password</span>
              <input className="input" type="password" name="password" autoComplete="current-password" required />
            </label>
            <button className="button buttonPrimary buttonSheen" type="submit" disabled={!configured}>
              Sign in
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
