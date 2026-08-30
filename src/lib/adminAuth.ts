import { NextRequest } from "next/server";
import crypto from "crypto";

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || "kp-natural-dairy-farm-admin-secret-key-2026";
const ADMIN_DEFAULT_EMAIL = process.env.ADMIN_EMAIL || "admin@kpnaturals.com";
const ADMIN_DEFAULT_PASSWORD = process.env.ADMIN_PASSWORD || "KPadmin@2026";

export interface AdminSession {
  email: string;
  role: "ADMIN" | "SUPER_ADMIN";
  iat: number;
  exp: number;
}

/**
 * Generate a signed session token for the admin
 */
export function generateAdminToken(email: string): string {
  const payload: AdminSession = {
    email,
    role: "ADMIN",
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode the admin session token
 */
export function verifyAdminToken(token: string): AdminSession | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", ADMIN_SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload: AdminSession = JSON.parse(
      Buffer.from(payloadStr, "base64url").toString("utf8")
    );

    if (Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Validate admin session from NextRequest headers / cookies
 */
export function getAdminSessionFromRequest(req: NextRequest): AdminSession | null {
  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const session = verifyAdminToken(token);
    if (session) return session;
  }

  // 2. Check kp_admin_token cookie
  const cookieToken = req.cookies.get("kp_admin_token")?.value;
  if (cookieToken) {
    const session = verifyAdminToken(cookieToken);
    if (session) return session;
  }

  return null;
}

/**
 * Validate admin credentials (supports env credentials or Supabase Auth)
 */
export function validateAdminCredentials(email: string, pass: string): boolean {
  const cleanEmail = email.trim().toLowerCase();
  const validEmail = ADMIN_DEFAULT_EMAIL.toLowerCase();

  return cleanEmail === validEmail && pass === ADMIN_DEFAULT_PASSWORD;
}
