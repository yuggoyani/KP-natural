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
    const { adminNotes } = body;

    const verifiedAt = new Date().toISOString();

    const updatedOrder = await orderStorage.updateOrder(orderId, {
      payment_status: "PAYMENT_VERIFIED",
      order_status: "PAYMENT_VERIFIED",
      payment_verified_at: verifiedAt,
      payment_verified_by: session.email,
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
      message: "Payment verified successfully. Ready for Processing & Packaging.",
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
