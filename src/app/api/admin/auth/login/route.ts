import { NextRequest, NextResponse } from "next/server";
import { generateAdminToken, validateAdminCredentials } from "@/lib/adminAuth";
import { getServerSupabaseClient, isSupabaseConfigured } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check with Supabase Auth if configured
    const supabase = getServerSupabaseClient();
    let authenticated = false;

    if (supabase && isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data?.user) {
        authenticated = true;
      }
    }

    // 2. Check with secure environment/farm admin credentials fallback
    if (!authenticated) {
      authenticated = validateAdminCredentials(cleanEmail, password);
    }

    if (!authenticated) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // 3. Generate secure signed session token
    const token = generateAdminToken(cleanEmail);

    const response = NextResponse.json({
      success: true,
      token,
      email: cleanEmail,
      message: "Admin authentication successful",
    });

    // Set secure cookie
    response.cookies.set("kp_admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Authentication failed" },
      { status: 500 }
    );
  }
}
