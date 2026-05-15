import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseBrowserConfigured } from '@/lib/supabase/config';

export const ADMIN_ACCESS_COOKIE = 'pawtrip-admin-access-token';
export const ADMIN_REFRESH_COOKIE = 'pawtrip-admin-refresh-token';

export type SupabaseAuthUser = {
  id: string;
  email?: string;
  role?: string;
};

function buildAuthHeaders(token?: string) {
  const anonKey = getSupabaseAnonKey();
  return {
    apikey: anonKey,
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
  };
}

export async function signInAdminWithPassword(email: string, password: string) {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return { data: null, error: 'Supabase auth is not configured.' };
  }

  const response = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  });

  if (!response.ok) {
    return {
      data: null,
      error: 'The email or password was not accepted.',
    };
  }

  return {
    data: (await response.json()) as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
      user: SupabaseAuthUser;
    },
    error: null,
  };
}

export async function getAdminUserFromAccessToken(token?: string | null) {
  const url = getSupabaseUrl();
  if (!url || !token || !isSupabaseBrowserConfigured()) return null;

  const response = await fetch(`${url}/auth/v1/user`, {
    method: 'GET',
    headers: buildAuthHeaders(token),
    cache: 'no-store',
  });

  if (!response.ok) return null;
  return (await response.json()) as SupabaseAuthUser;
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? null;
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value ?? null;
  const user = await getAdminUserFromAccessToken(accessToken);

  return {
    configured: isSupabaseBrowserConfigured(),
    accessToken,
    refreshToken,
    user,
  };
}

export async function requireAdminUser() {
  const session = await getAdminSession();
  if (!session.configured || !session.user) {
    redirect('/admin/login');
  }
  return session.user;
}
