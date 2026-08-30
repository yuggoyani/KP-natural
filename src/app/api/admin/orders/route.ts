import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/adminAuth";
import { orderStorage } from "@/lib/orderStorage";
import { OrderRecord, AdminOrderStats } from "@/types/database";

export async function GET(req: NextRequest) {
  try {
    // 1. Validate Admin Authorization
    const session = getAdminSessionFromRequest(req);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized admin access" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase().trim() || "";
    const paymentFilter = searchParams.get("paymentStatus") || "ALL";
    const orderFilter = searchParams.get("orderStatus") || "ALL";
    const sortBy = searchParams.get("sortBy") || "NEWEST";

    // 2. Fetch all real orders from Single Source of Truth
    const orders = await orderStorage.getAllOrders({
      search,
      paymentStatus: paymentFilter,
      orderStatus: orderFilter,
      sortBy,
    });

    // 3. Fetch unfiltered orders to compute accurate global dashboard metrics
    const allOrders = await orderStorage.getAllOrders();

    const isVerifiedPayment = (o: OrderRecord) =>
      o.payment_status === "PAYMENT_VERIFIED" ||
      o.payment_status === "VERIFIED" ||
      o.order_status === "PAYMENT_VERIFIED" ||
      o.order_status === "PROCESSING" ||
      o.order_status === "DISPATCHED" ||
      o.order_status === "DELIVERED";

    const isNeedsVerification = (o: OrderRecord) =>
      (o.payment_status === "PAYMENT_SUBMITTED" ||
        o.payment_status === "SUBMITTED" ||
        o.order_status === "PAYMENT_VERIFICATION") &&
      !isVerifiedPayment(o);

    const isPendingPayment = (o: OrderRecord) =>
      (o.payment_status === "PENDING" || o.payment_status === "PAYMENT_PENDING") &&
      !isNeedsVerification(o) &&
      !isVerifiedPayment(o);

    const isVerifiedOrProcessing = (o: OrderRecord) =>
      o.order_status === "PAYMENT_VERIFIED" || o.order_status === "PROCESSING";

    const stats: AdminOrderStats = {
      totalOrders: allOrders.length,
      pendingPayment: allOrders.filter(isPendingPayment).length,
      paymentSubmitted: allOrders.filter(isNeedsVerification).length,
      paymentVerified: allOrders.filter(isVerifiedOrProcessing).length,
      processing: allOrders.filter((o) => o.order_status === "PROCESSING").length,
      dispatched: allOrders.filter((o) => o.order_status === "DISPATCHED").length,
      delivered: allOrders.filter((o) => o.order_status === "DELIVERED").length,
      cancelled: allOrders.filter((o) => o.order_status === "CANCELLED").length,
      totalRevenue: allOrders
        .filter(isVerifiedPayment)
        .reduce((sum, o) => sum + Number(o.total_amount || 0), 0),
    };

    return NextResponse.json({
      success: true,
      orders,
      stats,
      adminEmail: session.email,
    });
  } catch (error: any) {
    console.error("Admin orders API error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load admin orders" },
      { status: 500 }
    );
  }
}
