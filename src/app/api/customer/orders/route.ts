import { NextRequest, NextResponse } from "next/server";
import { verifyPhoneVerificationToken } from "@/lib/otpService";
import { orderStorage } from "@/lib/orderStorage";
import { CustomerOrdersResponse } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

/**
 * GET: Retrieve all orders belonging to the securely authenticated customer
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Read token from Authorization header or cookie
    let token: string | undefined;

    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7).trim();
    }

    if (!token) {
      token = req.cookies.get("kp_customer_session")?.value;
    }

    if (!token) {
      return NextResponse.json<CustomerOrdersResponse>(
        { success: false, error: "Please verify your mobile number to securely access your order history." },
        { status: 401 }
      );
    }

    // 2. Validate token signature and expiration
    const session = verifyPhoneVerificationToken(token);

    if (!session || !session.phone) {
      return NextResponse.json<CustomerOrdersResponse>(
        { success: false, error: "Your session has expired. Please verify your mobile number again." },
        { status: 401 }
      );
    }

    // 3. Fetch orders strictly matching verified customer phone number from Supabase
    const customerOrders = await orderStorage.getCustomerOrders(session.phone);

    return NextResponse.json<CustomerOrdersResponse>({
      success: true,
      orders: customerOrders,
      verifiedMobile: session.phone,
      totalOrders: customerOrders.length,
    });
  } catch (error: any) {
    console.error("Customer orders API exception:", error);
    return NextResponse.json<CustomerOrdersResponse>(
      { success: false, error: "Failed to retrieve order history. Please try again." },
      { status: 500 }
    );
  }
}

/**
 * POST: Customer Session Logout (Clears session cookie)
 */
export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: "Logged out successfully" });
  response.cookies.set("kp_customer_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
