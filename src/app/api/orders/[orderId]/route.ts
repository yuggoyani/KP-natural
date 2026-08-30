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
      return NextResponse.json(
        { success: false, error: "Order not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      order,
      items: items || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
