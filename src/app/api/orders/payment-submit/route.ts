import { NextRequest, NextResponse } from "next/server";
import { orderStorage } from "@/lib/orderStorage";
import { isSupabaseConfigured } from "@/lib/supabase";
import { SubmitPaymentRequest, SubmitPaymentResponse } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body: SubmitPaymentRequest = await req.json();
    const { orderId, utrNumber, paymentMethod = "UPI" } = body;

    // 1. Validation
    if (!orderId || !orderId.trim()) {
      return NextResponse.json<SubmitPaymentResponse>(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const cleanUtr = utrNumber?.trim() || "";
    if (!cleanUtr || cleanUtr.length < 6) {
      return NextResponse.json<SubmitPaymentResponse>(
        { success: false, error: "Please enter a valid UTR / Transaction reference ID (minimum 6 characters)" },
        { status: 400 }
      );
    }

    const submittedAt = new Date().toISOString();
    const cleanId = orderId.trim();

    // 2. Unified Update via Single Source of Truth
    const updated = await orderStorage.updateOrder(cleanId, {
      payment_status: "PAYMENT_SUBMITTED",
      order_status: "PAYMENT_VERIFICATION",
      payment_method: paymentMethod,
      utr_number: cleanUtr,
      payment_submitted_at: submittedAt,
      payment_review_requested_at: submittedAt,
    });

    if (!updated) {
      return NextResponse.json<SubmitPaymentResponse>(
        { success: false, error: "Order not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json<SubmitPaymentResponse>({
      success: true,
      orderId: cleanId,
      paymentStatus: "PAYMENT_SUBMITTED",
      orderStatus: "PAYMENT_VERIFICATION",
      utrNumber: cleanUtr,
      submittedAt,
      isDemoMode: !isSupabaseConfigured(),
    });
  } catch (error: any) {
    console.error("Payment Submission Exception:", error);
    return NextResponse.json<SubmitPaymentResponse>(
      { success: false, error: error.message || "Failed to process payment submission" },
      { status: 500 }
    );
  }
}
