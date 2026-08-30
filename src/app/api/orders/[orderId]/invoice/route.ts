import { NextRequest, NextResponse } from "next/server";
import { orderStorage } from "@/lib/orderStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const { order } = await orderStorage.getOrder(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Invoice rule: only verified payments or post-verification states can download invoice
    const isVerified =
      order.payment_status === "PAYMENT_VERIFIED" ||
      order.payment_status === "VERIFIED" ||
      order.order_status === "PAYMENT_VERIFIED" ||
      order.order_status === "PROCESSING" ||
      order.order_status === "DISPATCHED" ||
      order.order_status === "DELIVERED";

    if (!isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice is available only after payment verification by KP Natural Dairy Farm.",
        },
        { status: 403 }
      );
    }

    // Redirect to the dedicated printable invoice page
    return NextResponse.redirect(new URL(`/invoice/${order.order_id}`, req.url));
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate invoice" },
      { status: 500 }
    );
  }
}
