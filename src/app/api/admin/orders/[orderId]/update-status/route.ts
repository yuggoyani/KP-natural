import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";
import { orderStorage } from "@/lib/orderStorage";
import { OrderStatus } from "@/types/database";

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
    const { orderStatus, cancellationReason, adminNotes } = body as {
      orderStatus: OrderStatus;
      cancellationReason?: string;
      adminNotes?: string;
    };

    const validStatuses: OrderStatus[] = [
      "AWAITING_PAYMENT",
      "PAYMENT_VERIFICATION",
      "PROCESSING",
      "DISPATCHED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!validStatuses.includes(orderStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid order status: ${orderStatus}` },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {
      order_status: orderStatus,
      updated_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updatePayload.admin_notes = adminNotes;
    }

    if (orderStatus === "DISPATCHED") {
      updatePayload.dispatched_at = new Date().toISOString();
    } else if (orderStatus === "DELIVERED") {
      updatePayload.delivered_at = new Date().toISOString();
    } else if (orderStatus === "CANCELLED") {
      updatePayload.cancelled_at = new Date().toISOString();
      updatePayload.cancellation_reason =
        cancellationReason?.trim() || "Order cancelled by administrator.";
    }

    const updatedOrder = await orderStorage.updateOrder(orderId, updatePayload);

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status successfully updated to ${orderStatus}.`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: 500 }
    );
  }
}
