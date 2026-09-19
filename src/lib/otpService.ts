import crypto from "crypto";
import { getServerSupabaseClient } from "@/lib/supabase";
import { sendOtpSms } from "@/lib/smsService";

const OTP_SECRET = process.env.OTP_SECRET || process.env.ADMIN_JWT_SECRET || "kp-natural-dairy-farm-otp-secret-key-2026";
const OTP_EXPIRY_MINUTES = 5;
const MAX_VERIFICATION_ATTEMPTS = 5;
const RATE_LIMIT_MAX_SENDS_PER_10_MIN = 3;

// In-memory fallback cache for rate-limiting and demo/local operation
interface MemoryVerificationEntry {
  phoneNumber: string;
  otpHash: string;
  attempts: number;
  expiresAt: number;
  verifiedAt: number | null;
  createdAt: number;
}

const memoryStore = new Map<string, MemoryVerificationEntry[]>();

/**
 * Clean phone number to 10 digits
 */
export function sanitizeIndianMobile(phone: string): string {
  const clean = (phone || "").replace(/\D/g, "");
  return clean.length >= 10 ? clean.slice(-10) : clean;
}

/**
 * Validate Indian 10-digit mobile format
 */
export function isValidIndianMobile(phone: string): boolean {
  const clean = sanitizeIndianMobile(phone);
  return clean.length === 10 && /^[6-9]\d{9}$/.test(clean);
}

/**
 * Hash an OTP with server secret (HMAC-SHA256)
 */
export function hashOtp(phone: string, otp: string): string {
  return crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${phone}:${otp}`)
    .digest("hex");
}

/**
 * Generate a 6-digit numeric OTP code
 */
export function generateNumericOtp(): string {
  // Generates integer between 100000 and 999999
  return crypto.randomInt(100000, 1000000).toString();
}

/**
 * Check rate limits for sending OTP (max 3 sends per 10 minutes)
 */
async function checkSendRateLimit(cleanPhone: string): Promise<boolean> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const supabase = getServerSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("phone_verifications")
        .select("id, created_at")
        .eq("phone_number", cleanPhone)
        .gte("created_at", tenMinutesAgo);

      if (!error && data) {
        if (data.length >= RATE_LIMIT_MAX_SENDS_PER_10_MIN) {
          return false; // Rate limit exceeded
        }
      }
    } catch {
      // Fallback to memory check
    }
  }

  // Memory fallback
  const entries = memoryStore.get(cleanPhone) || [];
  const cutoff = Date.now() - 10 * 60 * 1000;
  const recent = entries.filter((e) => e.createdAt >= cutoff);
  return recent.length < RATE_LIMIT_MAX_SENDS_PER_10_MIN;
}

/**
 * Send OTP to Indian mobile number with rate limiting and Supabase persistence
 */
export async function requestPhoneOtp(mobileNumber: string, purpose: "checkout" | "order_history" = "checkout") {
  const cleanPhone = sanitizeIndianMobile(mobileNumber);

  if (!isValidIndianMobile(cleanPhone)) {
    return {
      success: false,
      error: "Please enter a valid 10-digit Indian mobile number.",
    };
  }

  // Check rate limit
  const isAllowed = await checkSendRateLimit(cleanPhone);
  if (!isAllowed) {
    return {
      success: false,
      error: "Too many OTP requests. Please wait a few minutes before trying again.",
    };
  }

  // Generate 6-digit OTP
  const otp = generateNumericOtp();
  const otpHash = hashOtp(cleanPhone, otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString();

  // Save hashed OTP in database
  const supabase = getServerSupabaseClient();
  let dbSaved = false;

  if (supabase) {
    try {
      const { error: insertError } = await supabase.from("phone_verifications").insert([
        {
          phone_number: cleanPhone,
          otp_hash: otpHash,
          attempts: 0,
          expires_at: expiresAt,
          created_at: new Date().toISOString(),
        },
      ]);

      if (!insertError) {
        dbSaved = true;
      } else {
        console.warn("Could not insert OTP into phone_verifications table:", insertError.message);
      }
    } catch (err) {
      console.warn("Supabase phone_verifications exception:", err);
    }
  }

  // Always keep in memory store as fallback
  const list = memoryStore.get(cleanPhone) || [];
  list.push({
    phoneNumber: cleanPhone,
    otpHash,
    attempts: 0,
    expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
    verifiedAt: null,
    createdAt: Date.now(),
  });
  memoryStore.set(cleanPhone, list);

  // Dispatch SMS
  const smsResult = await sendOtpSms({
    mobileNumber: cleanPhone,
    otp,
  });

  if (!smsResult.success) {
    // Invalidate the attempt since SMS could not be dispatched
    const remaining = (memoryStore.get(cleanPhone) || []).filter((r) => r.otpHash !== otpHash);
    memoryStore.set(cleanPhone, remaining);

    return {
      success: false,
      error: smsResult.error || "Unable to send OTP right now. Please try again.",
    };
  }

  return {
    success: true,
    message: `6-digit OTP sent to +91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`,
    expiresInSeconds: OTP_EXPIRY_MINUTES * 60,
    resendCooldownSeconds: 45,
    isDemoMode: smsResult.isDemoMode,
  };
}

/**
 * Verify submitted OTP against hashed record
 */
export async function verifyPhoneOtp(
  mobileNumber: string,
  submittedOtp: string,
  purpose: "checkout" | "order_history" = "checkout"
) {
  const cleanPhone = sanitizeIndianMobile(mobileNumber);
  const cleanOtp = (submittedOtp || "").trim().replace(/\D/g, "");

  if (!isValidIndianMobile(cleanPhone)) {
    return { success: false, error: "Please enter a valid mobile number." };
  }

  if (cleanOtp.length !== 6) {
    return { success: false, error: "Please enter a valid 6-digit OTP code." };
  }

  const expectedHash = hashOtp(cleanPhone, cleanOtp);
  const now = new Date();
  const supabase = getServerSupabaseClient();

  // 1. Try Supabase verification
  if (supabase) {
    try {
      const { data: records, error } = await supabase
        .from("phone_verifications")
        .select("*")
        .eq("phone_number", cleanPhone)
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && records && records.length > 0) {
        const record = records[0];

        // Check if expired
        if (new Date(record.expires_at) < now) {
          return { success: false, error: "This OTP has expired. Please request a new OTP." };
        }

        // Check max attempts
        if (record.attempts >= MAX_VERIFICATION_ATTEMPTS) {
          return {
            success: false,
            error: "Too many verification attempts. Please request a new OTP.",
          };
        }

        // Check hash match
        if (record.otp_hash !== expectedHash) {
          // Increment attempts
          await supabase
            .from("phone_verifications")
            .update({ attempts: record.attempts + 1 })
            .eq("id", record.id);

          return { success: false, error: "Incorrect OTP. Please check and try again." };
        }

        // Mark verified
        await supabase
          .from("phone_verifications")
          .update({
            verified_at: now.toISOString(),
            attempts: record.attempts + 1,
          })
          .eq("id", record.id);

        const token = generatePhoneVerificationToken(cleanPhone, purpose);
        return {
          success: true,
          message: "Mobile number verified successfully.",
          verifiedMobile: cleanPhone,
          phoneVerificationToken: token,
          customerSessionToken: token,
        };
      }
    } catch (err) {
      console.warn("Supabase OTP verify fallback to memory:", err);
    }
  }

  // 2. Memory Fallback verification
  const list = memoryStore.get(cleanPhone) || [];
  const latest = list[list.length - 1];

  if (!latest) {
    return { success: false, error: "No OTP request found for this number. Please request an OTP." };
  }

  if (Date.now() > latest.expiresAt) {
    return { success: false, error: "This OTP has expired. Please request a new OTP." };
  }

  if (latest.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    return { success: false, error: "Too many verification attempts. Please request a new OTP." };
  }

  if (latest.otpHash !== expectedHash) {
    latest.attempts += 1;
    return { success: false, error: "Incorrect OTP. Please check and try again." };
  }

  latest.verifiedAt = Date.now();
  latest.attempts += 1;

  const token = generatePhoneVerificationToken(cleanPhone, purpose);
  return {
    success: true,
    message: "Mobile number verified successfully.",
    verifiedMobile: cleanPhone,
    phoneVerificationToken: token,
    customerSessionToken: token,
  };
}

/**
 * Generate a cryptographically signed verification token
 * Proves that the mobile number was verified on the server within the last 15 minutes.
 */
export function generatePhoneVerificationToken(
  mobileNumber: string,
  purpose: "checkout" | "order_history" = "checkout"
): string {
  const cleanPhone = sanitizeIndianMobile(mobileNumber);
  const payload = {
    phone: cleanPhone,
    purpose,
    iat: Date.now(),
    exp: Date.now() + 15 * 60 * 1000, // 15 mins for checkout / 24 hrs for session
  };

  // For order history sessions, extend to 7 days
  if (purpose === "order_history") {
    payload.exp = Date.now() + 7 * 24 * 60 * 60 * 1000;
  }

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(payloadStr)
    .digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Validate and decode a phone verification token
 */
export function verifyPhoneVerificationToken(
  token: string | undefined | null,
  expectedPurpose?: "checkout" | "order_history"
): { phone: string; purpose: string } | null {
  try {
    if (!token || !token.includes(".")) return null;
    const [payloadStr, signature] = token.split(".");
    if (!payloadStr || !signature) return null;

    const expectedSignature = crypto
      .createHmac("sha256", OTP_SECRET)
      .update(payloadStr)
      .digest("base64url");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString("utf8"));

    if (!payload.phone || Date.now() > payload.exp) {
      return null; // Expired or malformed
    }

    if (expectedPurpose && payload.purpose && payload.purpose !== expectedPurpose && payload.purpose !== "order_history") {
      // Allow order_history tokens for checkout as well
      return null;
    }

    return {
      phone: payload.phone,
      purpose: payload.purpose || "checkout",
    };
  } catch {
    return null;
  }
}
