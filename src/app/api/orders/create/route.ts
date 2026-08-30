import { NextRequest, NextResponse } from "next/server";
import { calculateServerOrderPricing } from "@/lib/serverPricing";
import { generateOrderId } from "@/lib/orderUtils";
import { orderStorage } from "@/lib/orderStorage";
import { isSupabaseConfigured, getSupabaseDiagnostics } from "@/lib/supabase";
import { CreateOrderRequest, CreateOrderResponse, OrderRecord, OrderItemRecord } from "@/types/database";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body: CreateOrderRequest = await req.json();
    const { customerDetails, deliveryAddress, cartItems } = body;

    // 1. Server-side Validation of Customer Details
    if (!customerDetails?.firstName?.trim() || !customerDetails?.lastName?.trim()) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "First name and last name are required" },
        { status: 400 }
      );
    }

    const cleanMobile = customerDetails?.mobileNumber?.replace(/\D/g, "") || "";
    if (cleanMobile.length !== 10 || !/^[6-9]\d{9}$/.test(cleanMobile)) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Valid 10-digit Indian mobile number is required" },
        { status: 400 }
      );
    }

    if (!customerDetails?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    // 2. Server-side Validation of Gujarat Delivery Address
    if (!deliveryAddress?.addressLine1?.trim()) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Address line 1 is required" },
        { status: 400 }
      );
    }

    if (!deliveryAddress?.districtOrCity || !deliveryAddress?.villageOrArea) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Gujarat district and village/area must be selected" },
        { status: 400 }
      );
    }

    const cleanPin = deliveryAddress?.pinCode?.replace(/\D/g, "") || "";
    if (cleanPin.length !== 6) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Valid 6-digit PIN code is required" },
        { status: 400 }
      );
    }

    // 3. Server-side Price Calculation from Trusted Catalog
    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json<CreateOrderResponse>(
        { success: false, error: "Cart contains no products" },
        { status: 400 }
      );
    }

    const calculatedPricing = calculateServerOrderPricing(cartItems);

    // 4. Generate Unique 5-digit Order ID (e.g. 48291)
    const orderId = generateOrderId();

    // Prepare Database Records
    const orderRecord: OrderRecord = {
      order_id: orderId,
      first_name: customerDetails.firstName.trim(),
      middle_name: customerDetails.middleName?.trim() || null,
      last_name: customerDetails.lastName.trim(),
      mobile_number: cleanMobile,
      email: customerDetails.email.trim(),
      address_line_1: deliveryAddress.addressLine1.trim(),
      address_line_2: deliveryAddress.addressLine2?.trim() || null,
      state: "Gujarat",
      district_or_city: deliveryAddress.districtOrCity,
      village_or_area: deliveryAddress.villageOrArea,
      pin_code: cleanPin,
      subtotal: calculatedPricing.subtotal,
      delivery_charge: calculatedPricing.deliveryCharge,
      total_amount: calculatedPricing.totalAmount,
      payment_status: "PENDING",
      order_status: "AWAITING_PAYMENT",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const orderItemRecords: OrderItemRecord[] = calculatedPricing.items.map((item) => ({
      order_id: orderId,
      product_name: item.productName,
      product_type: item.productType,
      package_size: item.packageSize,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
      free_cocopeat_quantity: item.freeCocopeatQuantity,
      created_at: new Date().toISOString(),
    }));

    // 5. Unified Database / Server Persistence
    await orderStorage.createOrder(orderRecord, orderItemRecords);

    return NextResponse.json<CreateOrderResponse>({
      success: true,
      orderId,
      order: orderRecord,
      items: orderItemRecords,
      isDemoMode: !isSupabaseConfigured(),
    });
  } catch (error: any) {
    console.error("Order Creation Exception:", error, getSupabaseDiagnostics());
    return NextResponse.json<CreateOrderResponse>(
      { success: false, error: error.message || "Failed to create order in database" },
      { status: 500 }
    );
  }
}
