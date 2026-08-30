import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    ""
  ).trim();
}

export function getSupabaseAnonKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  ).trim();
}

export function getSupabaseServiceRoleKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    ""
  ).trim();
}

/**
 * Check whether Supabase environment variables are properly configured
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey();
  const key = serviceKey || anonKey;

  return (
    Boolean(url) &&
    Boolean(key) &&
    !url.includes("your-project") &&
    !key.includes("your-supabase-anon-key")
  );
}

/**
 * Browser-safe Supabase client (using anon key)
 */
export const supabase = isSupabaseConfigured()
  ? createClient(getSupabaseUrl(), getSupabaseAnonKey())
  : null;

/**
 * Privileged server-side Supabase client (uses Service Role Key when available, otherwise Anon Key)
 * Strictly executed in API routes / Server Components only.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const anonKey = getSupabaseAnonKey();
  const key = serviceRoleKey || anonKey;

  if (!url || !key || url.includes("your-project")) {
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
