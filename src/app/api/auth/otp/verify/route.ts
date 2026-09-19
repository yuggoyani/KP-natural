import { NextRequest, NextResponse } from "next/server";
import { verifyPhoneOtp } from "@/lib/otpService";
import { VerifyOtpRequest, VerifyOtpResponse } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body: VerifyOtpRequest = await req.json();
    const { mobileNumber, otp, purpose = "checkout" } = body;

    if (!mobileNumber || typeof mobileNumber !== "string") {
      return NextResponse.json<VerifyOtpResponse>(
        { success: false, error: "Please enter a valid mobile number." },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
      return NextResponse.json<VerifyOtpResponse>(
        { success: false, error: "Please enter the 6-digit OTP sent to your mobile number." },
        { status: 400 }
      );
    }

    const result = await verifyPhoneOtp(mobileNumber, otp, purpose);

    if (!result.success) {
      return NextResponse.json<VerifyOtpResponse>(
        { success: false, error: result.error || "Incorrect OTP. Please check and try again." },
        { status: 400 }
      );
    }

    const response = NextResponse.json<VerifyOtpResponse>({
      success: true,
      message: result.message || "Mobile number verified successfully.",
      verifiedMobile: result.verifiedMobile,
      phoneVerificationToken: result.phoneVerificationToken,
      customerSessionToken: result.customerSessionToken,
    });

    // Set HTTP-only customer session cookie for Order History
    if (result.customerSessionToken) {
      response.cookies.set("kp_customer_session", result.customerSessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });
    }

    return response;
  } catch (error: any) {
    console.error("Verify OTP API exception:", error);
    return NextResponse.json<VerifyOtpResponse>(
      { success: false, error: "Unable to verify OTP right now. Please try again." },
      { status: 500 }
    );
  }
}
