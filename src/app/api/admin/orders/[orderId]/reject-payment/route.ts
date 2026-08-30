import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";
import { orderStorage } from "@/lib/orderStorage";

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
    const { rejectionReason, adminNotes } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { success: false, error: "Rejection reason is required" },
        { status: 400 }
      );
    }

    const rejectedAt = new Date().toISOString();

    const updatedOrder = await orderStorage.updateOrder(orderId, {
      payment_status: "REJECTED",
      order_status: "AWAITING_PAYMENT",
      payment_rejection_reason: rejectionReason.trim(),
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
      message: "Payment marked as rejected. Customer order preserved.",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process payment rejection" },
      { status: 500 }
    );
  }
}
