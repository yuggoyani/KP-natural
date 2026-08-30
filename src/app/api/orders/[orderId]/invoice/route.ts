import { NextRequest, NextResponse } from "next/server";
import { orderStorage } from "@/lib/orderStorage";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ success: false, error: "Order ID is required" }, { status: 400 });
    }

    const { order, items } = await orderStorage.getOrder(orderId);

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    // Availability Rule: Only when payment is verified
    const isVerified =
      order.payment_status === "PAYMENT_VERIFIED" ||
      order.payment_status === "VERIFIED" ||
      order.order_status === "PAYMENT_VERIFIED" ||
      order.order_status === "PROCESSING" ||
      order.order_status === "DISPATCHED" ||
      order.order_status === "DELIVERED";

    if (!isVerified || order.order_status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Invoice is available only after payment verification by KP Natural Dairy Farm.",
        },
        { status: 403 }
      );
    }

    // Redirect to the dedicated high-fidelity invoice page
    return NextResponse.redirect(new URL(`/invoice/${order.order_id}`, req.url));
  } catch (error: any) {
    console.error("Invoice API route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process invoice request" },
      { status: 500 }
    );
  }
}
