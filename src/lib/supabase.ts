import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Clean and sanitize environment variable values
 * Handles quotes, trailing slashes, whitespace, and undefined values.
 */
function cleanEnvValue(val: string | undefined): string {
  if (!val) return "";
  let clean = val.trim();
  // Remove wrapping single or double quotes if present
  if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) {
    clean = clean.slice(1, -1).trim();
  }
  return clean;
}

/**
 * Retrieve Supabase URL with extensive fallback resolution
 */
export function getSupabaseUrl(): string {
  const url =
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL) ||
    cleanEnvValue(process.env.SUPABASE_URL) ||
    cleanEnvValue(process.env["NEXT_PUBLIC_SUPABASE_URL"]) ||
    cleanEnvValue(process.env["SUPABASE_URL"]);

  // Remove trailing slash for consistency
  return url.replace(/\/+$/, "");
}

/**
 * Retrieve Supabase Anon / Publishable Key with fallback resolution
 */
export function getSupabaseAnonKey(): string {
  return (
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
    cleanEnvValue(process.env.SUPABASE_ANON_KEY) ||
    cleanEnvValue(process.env.NEXT_PUBLIC_SUPABASE_KEY) ||
    cleanEnvValue(process.env.SUPABASE_KEY) ||
    cleanEnvValue(process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"]) ||
    cleanEnvValue(process.env["SUPABASE_ANON_KEY"]) ||
    cleanEnvValue(process.env["NEXT_PUBLIC_SUPABASE_KEY"]) ||
    cleanEnvValue(process.env["SUPABASE_KEY"])
  );
}

/**
 * Retrieve Supabase Service Role / Secret Key with fallback resolution
 */
export function getSupabaseServiceRoleKey(): string {
  return (
    cleanEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY) ||
    cleanEnvValue(process.env.SUPABASE_SERVICE_KEY) ||
    cleanEnvValue(process.env.SUPABASE_SECRET_KEY) ||
    cleanEnvValue(process.env["SUPABASE_SERVICE_ROLE_KEY"]) ||
    cleanEnvValue(process.env["SUPABASE_SERVICE_KEY"]) ||
    cleanEnvValue(process.env["SUPABASE_SECRET_KEY"])
  );
}

/**
 * Check whether Supabase environment variables are configured and non-empty
 */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabaseServiceRoleKey() || getSupabaseAnonKey();

  if (!url || !key) {
    return false;
  }

  // Filter out unreplaced template placeholder strings
  if (
    url.includes("your-project-ref") ||
    url.includes("your-project.supabase.co") ||
    key.includes("your-supabase-anon-key") ||
    key.includes("your-supabase-service-role-key")
  ) {
    return false;
  }

  return true;
}

/**
 * Get diagnostic status of Supabase environment configuration
 * (Safe for logging — does NOT reveal secret keys)
 */
export function getSupabaseDiagnostics() {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();
  const serviceKey = getSupabaseServiceRoleKey();

  return {
    isConfigured: isSupabaseConfigured(),
    hasUrl: Boolean(url),
    urlHost: url ? new URL(url).host : null,
    hasAnonKey: Boolean(anonKey),
    anonKeyPrefix: anonKey ? anonKey.slice(0, 12) + "..." : null,
    hasServiceRoleKey: Boolean(serviceKey),
    serviceRoleKeyPrefix: serviceKey ? serviceKey.slice(0, 12) + "..." : null,
  };
}

/**
 * Privileged server-side Supabase client
 * Strictly executed in API Route Handlers / Server Actions / Server Components.
 * Always resolves credentials dynamically at call-time.
 */
export function getServerSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  const anonKey = getSupabaseAnonKey();
  const key = serviceRoleKey || anonKey;

  if (!url || !key) {
    console.warn("getServerSupabaseClient: Missing Supabase credentials at runtime.", getSupabaseDiagnostics());
    return null;
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Browser-safe Supabase client accessor (dynamically created)
 */
export function getBrowserSupabaseClient(): SupabaseClient | null {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}
