import { NextRequest, NextResponse } from "next/server";
import { orderStorage } from "@/lib/orderStorage";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, mobileNumber } = body;

    // 1. Validation
    if (!orderId || typeof orderId !== "string" || !orderId.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't find an order matching those details. Please check your Order ID and registered mobile number.",
        },
        { status: 400 }
      );
    }

    if (!mobileNumber || typeof mobileNumber !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't find an order matching those details. Please check your Order ID and registered mobile number.",
        },
        { status: 400 }
      );
    }

    const cleanOrderId = orderId.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, "");

    // 2. Query through unified Single Source of Truth
    const { order, items } = await orderStorage.trackOrder(cleanOrderId, cleanMobile);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "We couldn't find an order matching those details. Please check your Order ID and registered mobile number.",
        },
        { status: 404 }
      );
    }

    // Return sanitized customer order details (exclude internal admin notes)
    const sanitizedOrder = {
      order_id: order.order_id,
      first_name: order.first_name,
      last_name: order.last_name,
      mobile_number: order.mobile_number,
      district_or_city: order.district_or_city,
      village_or_area: order.village_or_area,
      state: order.state,
      pin_code: order.pin_code,
      subtotal: order.subtotal,
      delivery_charge: order.delivery_charge,
      total_amount: order.total_amount,
      payment_status: order.payment_status,
      order_status: order.order_status,
      utr_number: order.utr_number,
      payment_submitted_at: order.payment_submitted_at,
      payment_verified_at: order.payment_verified_at,
      payment_rejection_reason: order.payment_rejection_reason,
      cancellation_reason: order.cancellation_reason,
      dispatched_at: order.dispatched_at,
      delivered_at: order.delivered_at,
      cancelled_at: order.cancelled_at,
      created_at: order.created_at,
    };

    return NextResponse.json({
      success: true,
      order: sanitizedOrder,
      items: items.map((i) => ({
        order_id: i.order_id,
        product_name: i.product_name,
        product_type: i.product_type,
        package_size: i.package_size,
        quantity: i.quantity,
        unit_price: i.unit_price,
        line_total: i.line_total,
        free_cocopeat_quantity: i.free_cocopeat_quantity,
        created_at: i.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Order Tracking Exception:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred while retrieving order details. Please try again.",
      },
      { status: 500 }
    );
  }
}
