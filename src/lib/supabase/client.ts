import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseBrowserConfigured } from '@/lib/supabase/config';

export function createSupabaseBrowserClient() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${url}${path}`, {
      ...init,
      headers: {
        apikey: anonKey,
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    return (await response.json()) as T;
  }

  return {
    configured: isSupabaseBrowserConfigured(),
    url,
    anonKey,
    authRequest,
  };
}
