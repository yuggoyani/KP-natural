"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Package,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  XCircle,
  MapPin,
  Gift,
  ArrowRight,
  RefreshCw,
  Phone,
  HelpCircle,
  Calendar,
  Hourglass,
  Boxes,
  FileText,
  Download,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OrderRecord, OrderItemRecord, OrderStatus, PaymentStatus } from "@/types/database";
import { downloadInvoicePdf } from "@/lib/invoiceGenerator";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderId") || "";

  const [orderId, setOrderId] = useState(initialOrderId);
  const [mobileNumber, setMobileNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Result state
  const [trackedOrder, setTrackedOrder] = useState<Partial<OrderRecord> | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRecord[]>([]);

  // Auto-fill from localStorage if available
  useEffect(() => {
    try {
      const savedCheckout = localStorage.getItem("kp_checkout_data");
      if (savedCheckout) {
        const parsed = JSON.parse(savedCheckout);
        if (parsed.customerDetails?.mobileNumber && !mobileNumber) {
          setMobileNumber(parsed.customerDetails.mobileNumber);
        }
      }

      const savedOrderId = localStorage.getItem("kp_current_order_id");
      if (savedOrderId && !orderId) {
        setOrderId(savedOrderId);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanOrderId = orderId.trim();
    const cleanMobile = mobileNumber.replace(/\D/g, "");

    if (!cleanOrderId) {
      setError("Please enter your Order ID.");
      return;
    }

    if (!cleanMobile || cleanMobile.length < 10) {
      setError("Please enter your 10-digit registered mobile number.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: cleanOrderId,
          mobileNumber: cleanMobile,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error ||
            "We couldn't find an order matching those details. Please check your Order ID and registered mobile number."
        );
        setTrackedOrder(null);
        setIsLoading(false);
        return;
      }

      setTrackedOrder(data.order);
      setOrderItems(data.items || []);
    } catch (err: any) {
      console.error("Track order error:", err);
      setError(
        "Network error contacting tracking server. Please check your internet connection and try again."
      );
      setTrackedOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSearch = () => {
    setTrackedOrder(null);
    setError(null);
  };

  const handleDownloadInvoice = async () => {
    if (!trackedOrder) return;
    setIsDownloadingInvoice(true);
    try {
      await downloadInvoicePdf(trackedOrder as OrderRecord, orderItems);
    } catch (err) {
      console.error("Invoice download error:", err);
      window.open(`/api/orders/${trackedOrder.order_id}/invoice`, "_blank");
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  return (
    <div className="py-10 sm:py-16 lg:py-20 bg-brand-ivory min-h-[85vh] text-left">
      <Container size="md">
        {/* HEADER */}
        <div className="flex flex-col items-start mb-8 sm:mb-10 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            <span>LIVE ORDER STATUS</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-brand-text-secondary mt-1.5 max-w-xl">
            Enter your unique Order Reference ID and registered mobile number to check the real-time status of your KP Natural Dairy Farm order.
          </p>
        </div>

        {/* LOOKUP SEARCH FORM (WHEN NO ORDER TRACKED) */}
        {!trackedOrder && (
          <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-9 border border-brand-border shadow-elevated mb-10">
            <form onSubmit={handleTrackSubmit} className="space-y-5" noValidate>
              {/* Order ID Input */}
              <div className="flex flex-col text-left">
                <label
                  htmlFor="orderId"
                  className="text-xs font-bold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center justify-between"
                >
                  <span>Order Reference ID</span>
                  <span className="text-[11px] text-brand-text-muted font-normal">
                    5-digit numeric ID (e.g. 48291)
                  </span>
                </label>
                <input
                  id="orderId"
                  type="text"
                  value={orderId}
                  onChange={(e) => {
                    setOrderId(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="e.g. 48291"
                  className="h-12 px-4 rounded-farm bg-white border border-brand-border font-mono text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
              </div>

              {/* Mobile Number Input */}
              <div className="flex flex-col text-left">
                <label
                  htmlFor="mobileNumber"
                  className="text-xs font-bold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center justify-between"
                >
                  <span>Registered Mobile Number</span>
                  <span className="text-[11px] text-brand-text-muted font-normal">
                    10-digit Indian Mobile
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-text-muted">
                    +91
                  </span>
                  <input
                    id="mobileNumber"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="98765 43210"
                    maxLength={10}
                    className="w-full h-12 pl-12 pr-4 rounded-farm bg-white border border-brand-border font-mono text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-farm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={isLoading}
                icon={
                  isLoading ? (
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )
                }
                className="w-full py-4 text-base shadow-subtle hover:shadow-premium"
              >
                {isLoading ? "Looking up Order..." : "Track My Order"}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-brand-border/60 flex items-center justify-center gap-2 text-[11px] text-brand-text-muted">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              <span>Secure encrypted customer verification. Your privacy is strictly protected.</span>
            </div>
          </div>
        )}

        {/* TRACKED ORDER RESULT VIEW */}
        {trackedOrder && (
          <div className="space-y-8">
            {/* TOP RECAP BANNER */}
            <div className="rounded-farm-xl bg-[#FAF4E6] border-2 border-brand-green/30 p-5 sm:p-7 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-green block">
                  Official Order Reference
                </span>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-brand-text-primary block mt-0.5">
                  {trackedOrder.order_id}
                </span>
                <span className="text-xs text-brand-text-secondary mt-1 block">
                  Ordered on{" "}
                  {trackedOrder.created_at
                    ? new Date(trackedOrder.created_at).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "Recently"}
                </span>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted">
                  Total Order Amount
                </span>
                <span className="font-serif font-bold text-2xl sm:text-3xl text-brand-green">
                  ₹{Number(trackedOrder.total_amount || 0).toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  onClick={handleResetSearch}
                  className="text-xs text-brand-text-secondary hover:text-brand-green underline mt-1"
                >
                  Track a different order
                </button>
              </div>
            </div>

            {/* CANCELLED ORDER STATE OR NORMAL TIMELINE */}
            {trackedOrder.order_status === "CANCELLED" ? (
              <div className="rounded-farm-xl bg-rose-50/95 border-2 border-rose-300 p-6 sm:p-9 shadow-elevated text-left space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center shrink-0 text-rose-600">
                    <XCircle className="w-7 h-7 stroke-[2]" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-700 block">
                      Order Status
                    </span>
                    <h2 className="font-serif text-2xl sm:text-3xl font-bold text-rose-950">
                      Your Order Has Been Cancelled
                    </h2>
                    <p className="text-sm text-rose-900 leading-relaxed pt-1">
                      We’re sorry, but this order has been cancelled by KP Natural Dairy Farm.
                    </p>
                  </div>
                </div>

                {/* Cancelled Details Box */}
                <div className="p-4 sm:p-5 rounded-farm bg-white/90 border border-rose-200 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-brand-text-muted uppercase font-bold text-[10px] tracking-wider">
                      Order Reference:
                    </span>
                    <span className="font-serif font-bold text-sm text-brand-text-primary">
                      {trackedOrder.order_id}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-text-muted uppercase font-bold text-[10px] tracking-wider">
                      Order Status:
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold uppercase text-[10px]">
                      <XCircle className="w-3 h-3 text-rose-600" />
                      <span>CANCELLED</span>
                    </span>
                  </div>
                  {trackedOrder.cancelled_at && (
                    <div className="flex items-center justify-between">
                      <span className="text-brand-text-muted uppercase font-bold text-[10px] tracking-wider">
                        Cancellation Date:
                      </span>
                      <span className="font-medium text-brand-text-primary">
                        {new Date(trackedOrder.cancelled_at).toLocaleString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {trackedOrder.cancellation_reason && (
                    <div className="pt-2 border-t border-rose-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="text-brand-text-muted uppercase font-bold text-[10px] tracking-wider">
                        Reason:
                      </span>
                      <span className="text-rose-900 font-semibold">{trackedOrder.cancellation_reason}</span>
                    </div>
                  )}
                </div>

                {/* Customer Care Call to Action */}
                <div className="p-4 sm:p-5 rounded-farm bg-[#FCF9F2] border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs sm:text-sm font-bold text-brand-text-primary block">
                      Need assistance or refund support?
                    </span>
                    <p className="text-xs text-brand-text-secondary leading-relaxed">
                      If the payment has already been made or if you need any assistance regarding this order, please contact our Customer Care team.
                    </p>
                  </div>

                  <a
                    href="tel:9904010544"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs sm:text-sm font-bold shadow-subtle transition-all duration-200 hover:scale-[1.02] shrink-0"
                    title="Call Customer Care directly"
                  >
                    <Phone className="w-4 h-4 text-brand-ivory" />
                    <span>📞 Contact Customer Care: 99040 10544</span>
                  </a>
                </div>

                <div className="text-[11px] text-rose-700 italic text-center">
                  ⚠️ Live order progression tracking is stopped because this order has been cancelled.
                </div>
              </div>
            ) : (
              <>
                {/* 4. VISUAL ORDER LIFECYCLE TIMELINE */}
                <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border border-brand-border shadow-elevated">
                  <div className="pb-4 mb-6 border-b border-brand-border/70 flex items-center justify-between">
                    <h2 className="font-serif text-xl font-bold text-brand-text-primary">
                      Order Lifecycle Timeline
                    </h2>
                    <span className="text-xs font-bold text-brand-green uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-green/10">
                      Live Status
                    </span>
                  </div>

                  <OrderTimeline order={trackedOrder} />
                </div>

                {/* 5. PAYMENT STATUS CARD */}
                <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border shadow-subtle">
                  <div className="pb-3 mb-4 border-b border-brand-border/70 flex items-center justify-between">
                    <h3 className="font-serif font-bold text-lg text-brand-text-primary">
                      Payment Verification Status
                    </h3>
                  </div>

                  <PaymentStatusInfo
                    order={trackedOrder}
                    onDownloadInvoice={handleDownloadInvoice}
                    isDownloadingInvoice={isDownloadingInvoice}
                  />
                </div>
              </>
            )}

            {/* 7 & 8. GUJARAT DELIVERY DESTINATION & DISPATCH STATUS */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border shadow-subtle">
              <div className="pb-3 mb-4 border-b border-brand-border/70 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-green" />
                  <h3 className="font-serif font-bold text-lg text-brand-text-primary">
                    Delivery Destination
                  </h3>
                </div>
                <span className="text-xs font-semibold text-brand-green">Gujarat Doorstep Delivery</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                    Recipient Location
                  </span>
                  <span className="font-semibold text-brand-text-primary block mt-0.5">
                    {trackedOrder.village_or_area}, {trackedOrder.district_or_city}
                  </span>
                  <span className="text-brand-text-secondary block">
                    Gujarat — <strong>{trackedOrder.pin_code}</strong>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block">
                    Dispatch Status
                  </span>
                  {trackedOrder.order_status === "DISPATCHED" ? (
                    <div className="mt-0.5 text-xs text-brand-green font-semibold flex items-center gap-1.5">
                      <Truck className="w-4 h-4" />
                      <span>Your order has been dispatched and is on its way.</span>
                    </div>
                  ) : trackedOrder.order_status === "DELIVERED" ? (
                    <div className="mt-0.5 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Order delivered successfully.</span>
                    </div>
                  ) : (
                    <span className="text-xs text-brand-text-secondary block mt-0.5">
                      Order is being processed and prepared for farm dispatch.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 6. ORDERED PRODUCTS ITEMIZATION */}
            {orderItems.length > 0 && (
              <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border shadow-subtle">
                <div className="pb-3 mb-4 border-b border-brand-border/70 flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-brand-text-primary">
                    Ordered Products ({orderItems.length})
                  </h3>
                </div>

                <div className="divide-y divide-brand-border/50 mb-4">
                  {orderItems.map((item, idx) => (
                    <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-14 rounded overflow-hidden border border-brand-border bg-white shrink-0">
                          <Image
                            src="/images/vermicompost-label.png"
                            alt="Vermicompost"
                            fill
                            sizes="48px"
                            className="object-contain p-0.5"
                            unoptimized
                          />
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-sm text-brand-text-primary">
                            {item.product_name || "KP Natural Vermicompost"} ({item.package_size})
                          </h4>
                          <span className="text-brand-text-muted">
                            Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}
                          </span>
                          {item.free_cocopeat_quantity > 0 && (
                            <div className="text-[10px] font-semibold text-brand-green flex items-center gap-1 mt-0.5">
                              <Gift className="w-3 h-3" />
                              <span>+{item.free_cocopeat_quantity} KG Cocopeat FREE</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <span className="font-serif font-bold text-sm text-brand-text-primary">
                        ₹{Number(item.line_total).toLocaleString("en-IN")}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotal & Free Delivery */}
                <div className="pt-3 border-t border-brand-border space-y-1.5 text-xs text-brand-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-brand-text-primary">
                      ₹{Number(trackedOrder.subtotal || trackedOrder.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Doorstep Delivery:</span>
                    <span className="text-brand-green font-semibold">FREE DELIVERY</span>
                  </div>
                  <div className="pt-2 border-t border-brand-border flex items-center justify-between text-sm">
                    <span className="font-serif font-bold text-brand-text-primary">Total Amount:</span>
                    <span className="font-serif font-bold text-xl text-brand-green">
                      ₹{Number(trackedOrder.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ACTIONS */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Button variant="primary" size="lg" href="/" className="w-full sm:w-auto">
                Back to Homepage
              </Button>
              <span className="text-xs text-brand-text-muted">
                Need help with your order? Contact farm inquiries directly.
              </span>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}

/**
 * Visual Order Timeline Component (Strict 6-steps based on real database state)
 */
function OrderTimeline({ order }: { order: Partial<OrderRecord> }) {
  const pStatus = String(order.payment_status || "").toUpperCase();
  const oStatus = String(order.order_status || "").toUpperCase();

  const isPaymentSubmitted =
    pStatus === "PAYMENT_SUBMITTED" ||
    pStatus === "SUBMITTED" ||
    oStatus === "PAYMENT_VERIFICATION" ||
    Boolean(order.utr_number);

  const isPaymentVerified =
    pStatus === "PAYMENT_VERIFIED" ||
    pStatus === "VERIFIED" ||
    oStatus === "PAYMENT_VERIFIED" ||
    oStatus === "PROCESSING" ||
    oStatus === "DISPATCHED" ||
    oStatus === "DELIVERED";

  const isProcessing =
    oStatus === "PROCESSING" || oStatus === "DISPATCHED" || oStatus === "DELIVERED";

  const isDispatched = oStatus === "DISPATCHED" || oStatus === "DELIVERED";
  const isDelivered = oStatus === "DELIVERED";

  const steps = [
    {
      label: "Order Created",
      description: "Order registered in farm database.",
      completed: true,
      active: false,
      timestamp: order.created_at,
    },
    {
      label: "Payment Submitted",
      description: order.utr_number
        ? `UTR: ${order.utr_number}`
        : "Awaiting UPI payment details.",
      completed: isPaymentSubmitted,
      active: !isPaymentSubmitted && oStatus === "AWAITING_PAYMENT",
      timestamp: order.payment_submitted_at,
    },
    {
      label: isPaymentVerified ? "Payment Verified" : "Payment Verification",
      description: isPaymentVerified
        ? "Payment verified by KP Natural Dairy Farm."
        : isPaymentSubmitted
        ? "⏳ Awaiting manual verification by farm team."
        : "Pending payment submission.",
      completed: isPaymentVerified,
      active: isPaymentSubmitted && !isPaymentVerified,
      timestamp: order.payment_verified_at,
    },
    {
      label: "Processing & Packaging",
      description: isProcessing
        ? "Vermicompost pack being prepared."
        : isPaymentVerified
        ? "Ready for packaging."
        : "Will begin upon payment verification.",
      completed: isProcessing,
      active: oStatus === "PROCESSING",
    },
    {
      label: "Dispatched",
      description: isDispatched
        ? "Handed over for Gujarat doorstep dispatch."
        : "Pending packaging completion.",
      completed: isDispatched,
      active: oStatus === "DISPATCHED",
      timestamp: order.dispatched_at,
    },
    {
      label: "Delivered",
      description: isDelivered
        ? "Successfully delivered to your address."
        : "Delivery to Gujarat destination.",
      completed: isDelivered,
      active: false,
      timestamp: order.delivered_at,
    },
  ];

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border">
      {steps.map((step, idx) => (
        <div key={idx} className="relative flex flex-col text-left">
          {/* Status Dot / Check Icon */}
          <div
            className={`absolute -left-6 sm:-left-8 top-0.5 w-5 sm:w-7 h-5 sm:h-7 rounded-full flex items-center justify-center ${
              step.completed
                ? "bg-brand-green text-brand-ivory"
                : step.active
                ? "bg-amber-100 border-2 border-amber-600 text-amber-900"
                : "bg-white border-2 border-brand-border text-brand-text-muted"
            }`}
          >
            {step.completed ? (
              <CheckCircle2 className="w-3.5 sm:w-4 h-3.5 sm:h-4 stroke-[2.5]" />
            ) : step.active ? (
              <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-brand-border" />
            )}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`font-serif font-bold text-sm sm:text-base ${
                  step.completed
                    ? "text-brand-text-primary"
                    : step.active
                    ? "text-amber-900"
                    : "text-brand-text-muted"
                }`}
              >
                {step.label}
              </span>
              {step.timestamp && (
                <span className="text-[10px] text-brand-text-muted bg-white px-2 py-0.5 rounded border border-brand-border">
                  {new Date(step.timestamp).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
            <p className="text-xs text-brand-text-secondary mt-0.5">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Payment Status Info Banner
 */
function PaymentStatusInfo({
  order,
  onDownloadInvoice,
  isDownloadingInvoice,
}: {
  order: Partial<OrderRecord>;
  onDownloadInvoice?: () => void;
  isDownloadingInvoice?: boolean;
}) {
  const pStatus = String(order.payment_status || "").toUpperCase();
  const oStatus = String(order.order_status || "").toUpperCase();

  if (
    pStatus === "PAYMENT_VERIFIED" ||
    pStatus === "VERIFIED" ||
    oStatus === "PAYMENT_VERIFIED" ||
    oStatus === "PROCESSING" ||
    oStatus === "DISPATCHED" ||
    oStatus === "DELIVERED"
  ) {
    return (
      <div className="p-5 rounded-farm-xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-serif font-bold text-sm text-emerald-900">
              Payment Verified ✓
            </strong>
            <span className="text-emerald-800 text-xs block mt-0.5">
              Your payment of ₹{Number(order.total_amount).toLocaleString("en-IN")} has been verified by KP Natural Dairy Farm.
            </span>
          </div>
        </div>

        {/* PROMINENT DOWNLOAD INVOICE BUTTON */}
        {onDownloadInvoice && (
          <button
            type="button"
            onClick={onDownloadInvoice}
            disabled={isDownloadingInvoice}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-bold shadow-subtle hover:shadow-premium transition-all duration-200 hover:scale-[1.02] shrink-0 w-full sm:w-auto justify-center"
          >
            {isDownloadingInvoice ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Invoice PDF...</span>
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 text-brand-ivory" />
                <span>📄 Download Invoice</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  }

  if (pStatus === "PAYMENT_SUBMITTED" || pStatus === "SUBMITTED" || oStatus === "PAYMENT_VERIFICATION") {
    return (
      <div className="p-4 rounded-farm bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <Hourglass className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
        <div>
          <strong className="block font-bold">Payment Submitted — Awaiting Verification</strong>
          <span>
            Your UTR reference (<strong>{order.utr_number || "Recorded"}</strong>) has been received and is currently awaiting manual verification against our UPI account by the farm team.
          </span>
        </div>
      </div>
    );
  }

  if (pStatus === "REJECTED") {
    return (
      <div className="p-5 sm:p-6 rounded-farm-xl bg-rose-50/95 border-2 border-rose-300 text-rose-950 text-xs shadow-xs space-y-4">
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <strong className="block font-serif font-bold text-sm sm:text-base text-rose-900">
              Payment Verification Issue
            </strong>
            <p className="text-xs text-rose-800 leading-relaxed">
              Your submitted payment reference could not be verified.
            </p>
            {order.payment_rejection_reason && (
              <p className="text-xs font-semibold text-rose-900 mt-1">
                Reason: {order.payment_rejection_reason}
              </p>
            )}
          </div>
        </div>

        {/* CUSTOMER CARE CONTACT DETAILS (PROMINENT & CLICKABLE) */}
        <div className="pt-3.5 border-t border-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/80 p-4 rounded-farm border border-rose-200">
          <div>
            <span className="text-xs font-bold text-rose-900 block">
              Need help regarding your payment?
            </span>
            <span className="text-[11px] text-rose-700 block mt-0.5">
              Please contact KP Natural Dairy Farm Customer Care for payment-related assistance.
            </span>
          </div>

          <a
            href="tel:9904010544"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-bold shadow-subtle transition-all duration-200 hover:scale-[1.02] shrink-0"
            title="Call Customer Care directly"
          >
            <Phone className="w-3.5 h-3.5 text-brand-ivory" />
            <span>📞 Customer Care: 99040 10544</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-farm bg-gray-50 border border-gray-200 text-gray-800 text-xs flex items-start gap-3">
      <Clock className="w-5 h-5 text-gray-500 shrink-0 mt-0.5" />
      <div>
        <strong className="block font-bold">Payment Pending</strong>
        <span>
          Please scan the dynamic UPI QR code with your order amount to complete payment.
        </span>
      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 min-h-[60vh] flex items-center justify-center bg-brand-ivory">
          <div className="animate-pulse flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-brand-border/60" />
            <div className="h-4 w-32 bg-brand-border/60 rounded" />
          </div>
        </div>
      }
    >
      <TrackOrderContent />
    </Suspense>
  );
}
