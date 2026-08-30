import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";
import { orderStorage } from "@/lib/orderStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const body = await req.json().catch(() => ({}));
    const { reason, adminNotes } = body;

    const rejectionReason =
      reason?.trim() ||
      "Payment not received in UPI account. Please verify your transaction reference number.";

    const rejectedAt = new Date().toISOString();

    const updatedOrder = await orderStorage.updateOrder(orderId, {
      payment_status: "REJECTED",
      payment_rejection_reason: rejectionReason,
      payment_rejected_at: rejectedAt,
      payment_rejected_by: session.email,
      admin_notes: adminNotes || undefined,
    });

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment marked as rejected. Customer track order updated with care helpline.",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to reject payment" },
      { status: 500 }
    );
  }
}
