import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

/**
 * Check whether Supabase environment variables are properly configured
 */
export function isSupabaseConfigured(): boolean {
  return (
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl.includes("your-project") &&
    !supabaseAnonKey.includes("your-supabase-anon-key")
  );
}

/**
 * Browser-safe Supabase client (using anon key)
 */
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Privileged server-side Supabase client (uses Service Role Key when available, otherwise Anon Key)
 * Strictly executed in API routes / Server Components only.
 */
export function getServerSupabaseClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }
  const key = supabaseServiceRoleKey || supabaseAnonKey;
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
    },
  });
}
