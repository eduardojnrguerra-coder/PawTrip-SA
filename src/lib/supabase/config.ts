export function getSupabaseUrl() {
  return (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
}

export function getSupabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || '';
}

export function isSupabaseConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseServiceRoleKey());
}

export function isSupabaseBrowserConfigured() {
  return Boolean(getSupabaseUrl() && getSupabaseAnonKey());
}
