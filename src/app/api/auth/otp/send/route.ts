import { NextRequest, NextResponse } from "next/server";
import { requestPhoneOtp } from "@/lib/otpService";
import { SendOtpRequest, SendOtpResponse } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body: SendOtpRequest = await req.json();
    const { mobileNumber, purpose = "checkout" } = body;

    if (!mobileNumber || typeof mobileNumber !== "string") {
      return NextResponse.json<SendOtpResponse>(
        { success: false, error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const result = await requestPhoneOtp(mobileNumber, purpose);

    if (!result.success) {
      return NextResponse.json<SendOtpResponse>(
        { success: false, error: result.error || "Unable to send OTP right now. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json<SendOtpResponse>({
      success: true,
      message: result.message,
      expiresInSeconds: result.expiresInSeconds,
      resendCooldownSeconds: result.resendCooldownSeconds,
      isDemoMode: result.isDemoMode,
    });
  } catch (error: any) {
    console.error("Send OTP API exception:", error);
    return NextResponse.json<SendOtpResponse>(
      { success: false, error: "Unable to send OTP right now. Please try again." },
      { status: 500 }
    );
  }
}
