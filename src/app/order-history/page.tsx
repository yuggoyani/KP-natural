"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Gift,
  ArrowRight,
  RefreshCw,
  LogOut,
  AlertCircle,
  ExternalLink,
  Hourglass,
  Boxes,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { PhoneOtpVerification } from "@/components/checkout/PhoneOtpVerification";
import { OrderRecord, OrderItemRecord, CustomerOrderHistoryItem, OrderStatus, PaymentStatus } from "@/types/database";
import { downloadInvoicePdf } from "@/lib/invoiceGenerator";

export default function OrderHistoryPage() {
  const [mobileNumber, setMobileNumber] = useState<string>("");
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [sessionToken, setSessionToken] = useState<string>("");
  const [verifiedMobile, setVerifiedMobile] = useState<string>("");

  const [orders, setOrders] = useState<CustomerOrderHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Expanded order detail state
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Restore existing session token or check authentication on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem("kp_customer_token");
      const savedMobile = localStorage.getItem("kp_customer_mobile");

      if (savedToken && savedMobile) {
        setSessionToken(savedToken);
        setVerifiedMobile(savedMobile);
        setMobileNumber(savedMobile);
        setIsVerified(true);
      }
    } catch {
      // Ignore read error
    }
  }, []);

  // Fetch customer orders once verified
  const fetchOrders = useCallback(async (token?: string) => {
    setIsLoading(true);
    setError(null);

    const activeToken = token || sessionToken;

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/customer/orders", {
        method: "GET",
        headers,
      });

      if (res.status === 401) {
        // Session expired or unauthenticated
        setIsVerified(false);
        setSessionToken("");
        setVerifiedMobile("");
        localStorage.removeItem("kp_customer_token");
        localStorage.removeItem("kp_customer_mobile");
        setIsLoading(false);
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load your orders. Please try again.");
        setIsLoading(false);
        return;
      }

      setOrders(data.orders || []);
      if (data.verifiedMobile) {
        setVerifiedMobile(data.verifiedMobile);
        setMobileNumber(data.verifiedMobile);
        setIsVerified(true);
      }
    } catch (err) {
      console.error("Fetch customer orders error:", err);
      setError("Network error retrieving your orders. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  }, [sessionToken]);

  // Trigger fetch whenever verified session is established
  useEffect(() => {
    if (isVerified && sessionToken) {
      fetchOrders(sessionToken);
    }
  }, [isVerified, sessionToken, fetchOrders]);

  // Phone Verification Success Handler
  const handlePhoneVerified = (token: string, verifiedPhone: string) => {
    setIsVerified(true);
    setSessionToken(token);
    setVerifiedMobile(verifiedPhone);
    setMobileNumber(verifiedPhone);

    try {
      localStorage.setItem("kp_customer_token", token);
      localStorage.setItem("kp_customer_mobile", verifiedPhone);
    } catch {
      // Ignore
    }

    fetchOrders(token);
  };

  // Reset / Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/customer/orders", { method: "POST" });
    } catch {
      // Ignore
    }

    setIsVerified(false);
    setSessionToken("");
    setVerifiedMobile("");
    setOrders([]);
    setError(null);

    try {
      localStorage.removeItem("kp_customer_token");
      localStorage.removeItem("kp_customer_mobile");
    } catch {
      // Ignore
    }
  };

  // Invoice Download Handler
  const handleDownloadInvoice = async (order: OrderRecord, items: OrderItemRecord[]) => {
    setIsDownloadingInvoice(order.order_id);
    try {
      await downloadInvoicePdf(order, items);
    } catch (err) {
      console.error("Invoice generation error:", err);
      window.open(`/invoice/${order.order_id}`, "_blank");
    } finally {
      setIsDownloadingInvoice(null);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  // Status Badge Helpers
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const s = String(status || "").toUpperCase();

    if (s === "PAYMENT_VERIFIED" || s === "VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold uppercase tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
          <span>Payment Verified</span>
        </span>
      );
    }

    if (s === "PAYMENT_SUBMITTED" || s === "SUBMITTED" || s === "PAYMENT_VERIFICATION") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
          <span>Payment Submitted</span>
        </span>
      );
    }

    if (s === "REJECTED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-bold uppercase tracking-wider">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Payment Rejected</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium uppercase tracking-wider">
        <Clock className="w-3 h-3 text-gray-500" />
        <span>Payment Pending</span>
      </span>
    );
  };

  const getOrderStatusBadge = (status: OrderStatus) => {
    const s = String(status || "").toUpperCase();

    if (s === "DELIVERED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Delivered</span>
        </span>
      );
    }

    if (s === "DISPATCHED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-bold">
          <Truck className="w-3 h-3 text-indigo-600" />
          <span>Dispatched</span>
        </span>
      );
    }

    if (s === "PROCESSING") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-[11px] font-bold">
          <Boxes className="w-3 h-3 text-blue-600" />
          <span>Processing & Packaging</span>
        </span>
      );
    }

    if (s === "PAYMENT_VERIFIED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>Payment Verified</span>
        </span>
      );
    }

    if (s === "PAYMENT_VERIFICATION") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-bold">
          <Hourglass className="w-3 h-3 text-amber-600" />
          <span>Awaiting Verification</span>
        </span>
      );
    }

    if (s === "CANCELLED") {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
          <XCircle className="w-3 h-3 text-rose-600" />
          <span>Cancelled</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
        <span>Awaiting Payment</span>
      </span>
    );
  };

  return (
    <div className="py-10 sm:py-16 lg:py-20 bg-brand-ivory min-h-[85vh] text-left">
      <Container size="lg">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-10 text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
              <span>CUSTOMER PORTAL</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight">
              Your Order History
            </h1>
            <p className="text-sm sm:text-base text-brand-text-secondary mt-1 max-w-xl">
              Securely view and track all your KP Natural Dairy Farm orders.
            </p>
          </div>

          {/* If Authenticated: Show Customer Account Pill with Logout */}
          {isVerified && verifiedMobile && (
            <div className="flex items-center gap-3 bg-[#FCF9F2] p-2.5 sm:p-3 rounded-farm-lg border border-brand-border shadow-xs">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-brand-text-muted">
                  Verified Mobile
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-brand-green">
                  +91 {verifiedMobile.slice(0, 5)} {verifiedMobile.slice(5)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-2 rounded-farm bg-white hover:bg-rose-50 border border-brand-border text-brand-text-secondary hover:text-rose-600 transition-colors text-xs font-semibold flex items-center gap-1"
                title="Log out from order history"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 1. UNAUTHENTICATED SCREEN: CLEAN MOBILE OTP LOGIN */}
        {/* ========================================================================= */}
        {!isVerified && (
          <div className="max-w-lg mx-auto rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-10 border border-brand-border shadow-elevated text-left">
            <div className="flex flex-col items-center text-center pb-6 mb-6 border-b border-brand-border/70">
              <div className="w-14 h-14 rounded-full bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-4 shadow-xs">
                <ShieldCheck className="w-7 h-7 stroke-[1.8]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green mb-1.5">
                SECURE ACCESS
              </span>

              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text-primary mb-2">
                View Your Orders
              </h2>

              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed max-w-sm">
                Enter your mobile number to securely access your complete order history.
              </p>
            </div>

            {/* Reusable Phone OTP Verification Box */}
            <PhoneOtpVerification
              mobileNumber={mobileNumber}
              onMobileChange={setMobileNumber}
              isVerified={isVerified}
              onVerified={handlePhoneVerified}
              onResetVerification={handleLogout}
              purpose="order_history"
            />

            <div className="mt-6 pt-5 border-t border-brand-border/60 flex items-center justify-center gap-2 text-[11px] text-brand-text-muted text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green shrink-0" />
              <span>Orders are secured with one-time password verification.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. AUTHENTICATED SCREEN: ORDERS LIST OR EMPTY STATE */}
        {/* ========================================================================= */}
        {isVerified && (
          <div>
            {isLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
                <span className="text-sm font-semibold text-brand-text-secondary">
                  Loading your orders...
                </span>
              </div>
            ) : error ? (
              <div className="p-6 rounded-farm-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs sm:text-sm flex items-start gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Unable to load orders:</strong>
                  <span>{error}</span>
                  <div className="mt-3">
                    <Button variant="secondary" size="sm" onClick={() => fetchOrders()}>
                      Try Again
                    </Button>
                  </div>
                </div>
              </div>
            ) : orders.length === 0 ? (
              /* EMPTY STATE */
              <div className="flex flex-col items-center text-center p-8 sm:p-14 rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-full bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-6 shadow-xs">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>

                <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green mb-2">
                  ORDER HISTORY
                </span>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text-primary mb-2">
                  No orders found
                </h2>

                <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-8 max-w-md">
                  You haven't placed any orders with KP Natural Dairy Farm yet under{" "}
                  <strong>+91 {verifiedMobile.slice(0, 5)} {verifiedMobile.slice(5)}</strong>.
                </p>

                <Button
                  variant="primary"
                  size="lg"
                  href="/#vermicompost-showcase"
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="shadow-subtle hover:shadow-premium"
                >
                  Shop Vermicompost
                </Button>
              </div>
            ) : (
              /* ORDERS CARDS LIST */
              <div className="space-y-6">
                <div className="flex items-center justify-between text-xs text-brand-text-secondary pb-2 border-b border-brand-border/60">
                  <span>
                    Showing <strong>{orders.length}</strong> {orders.length === 1 ? "order" : "orders"}
                  </span>
                  <button
                    onClick={() => fetchOrders()}
                    className="inline-flex items-center gap-1.5 text-brand-green hover:underline font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Refresh</span>
                  </button>
                </div>

                {orders.map(({ order, items }) => {
                  const isExpanded = expandedOrderId === order.order_id;
                  const isVerifiedPayment =
                    order.payment_status === "PAYMENT_VERIFIED" ||
                    order.payment_status === "VERIFIED" ||
                    order.order_status === "PAYMENT_VERIFIED" ||
                    order.order_status === "PROCESSING" ||
                    order.order_status === "DISPATCHED" ||
                    order.order_status === "DELIVERED";

                  return (
                    <div
                      key={order.order_id}
                      className="rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-elevated overflow-hidden transition-all duration-200"
                    >
                      {/* ORDER CARD SUMMARY HEADER */}
                      <div className="p-5 sm:p-7 bg-[#FAF5EA] border-b border-brand-border/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-text-muted block">
                              Order Reference
                            </span>
                            <span className="font-serif font-bold text-lg sm:text-xl text-brand-green">
                              {order.order_id}
                            </span>
                          </div>

                          <div className="hidden sm:block h-8 w-px bg-brand-border/80" />

                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-text-muted block">
                              Order Placed
                            </span>
                            <span className="text-xs font-semibold text-brand-text-primary">
                              {order.created_at
                                ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })
                                : "N/A"}
                            </span>
                          </div>

                          <div className="hidden sm:block h-8 w-px bg-brand-border/80" />

                          <div>
                            <span className="text-[10px] uppercase font-bold text-brand-text-muted block">
                              Total Amount
                            </span>
                            <span className="font-serif font-bold text-base sm:text-lg text-brand-text-primary">
                              ₹{Number(order.total_amount).toLocaleString("en-IN")}
                            </span>
                          </div>
                        </div>

                        {/* Status Badges & Action Toggle */}
                        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
                          <div className="flex flex-wrap items-center gap-2">
                            {getPaymentStatusBadge(order.payment_status)}
                            {getOrderStatusBadge(order.order_status)}
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleOrderExpand(order.order_id)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-farm bg-white hover:bg-brand-ivory-300 border border-brand-border text-xs font-bold text-brand-green transition-colors shadow-xs"
                          >
                            <span>{isExpanded ? "Hide Details" : "View Order Details"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* ITEM QUICK SUMMARY (ALWAYS VISIBLE) */}
                      <div className="p-5 sm:p-7">
                        <div className="divide-y divide-brand-border/50">
                          {items.map((item, idx) => (
                            <div
                              key={idx}
                              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-3">
                                <div className="relative w-11 h-13 rounded overflow-hidden border border-brand-border bg-white shrink-0">
                                  <Image
                                    src="/images/vermicompost-label.png"
                                    alt="Vermicompost"
                                    fill
                                    sizes="44px"
                                    className="object-contain p-0.5"
                                    unoptimized
                                  />
                                </div>
                                <div>
                                  <h3 className="font-serif font-bold text-sm text-brand-text-primary">
                                    {item.product_name} ({item.package_size})
                                  </h3>
                                  <span className="text-brand-text-muted">
                                    Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}
                                  </span>
                                  {item.free_cocopeat_quantity > 0 && (
                                    <span className="text-[10px] font-semibold text-brand-green flex items-center gap-1 mt-0.5">
                                      <Gift className="w-3 h-3" />
                                      +{item.free_cocopeat_quantity} KG Cocopeat FREE
                                    </span>
                                  )}
                                </div>
                              </div>

                              <span className="font-serif font-bold text-sm text-brand-text-primary shrink-0">
                                ₹{Number(item.line_total).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* EXPANDABLE FULL DETAILS DRAWER */}
                        {isExpanded && (
                          <div className="mt-6 pt-6 border-t border-brand-border/70 space-y-6 animate-scale-in">
                            {/* Grid 1: Delivery Address & Pricing Breakdown */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Destination Address */}
                              <div className="p-4 sm:p-5 rounded-farm bg-white border border-brand-border text-xs space-y-2">
                                <span className="font-serif font-bold text-sm text-brand-text-primary flex items-center gap-1.5 pb-2 border-b border-brand-border/60">
                                  <MapPin className="w-4 h-4 text-brand-green" />
                                  <span>Gujarat Delivery Destination</span>
                                </span>
                                <div className="space-y-1 text-brand-text-secondary pt-1">
                                  <strong className="text-brand-text-primary block font-semibold">
                                    {order.first_name} {order.middle_name ? `${order.middle_name} ` : ""}{order.last_name}
                                  </strong>
                                  <p className="leading-relaxed">
                                    {order.address_line_1}
                                    {order.address_line_2 ? `, ${order.address_line_2}` : ""}
                                  </p>
                                  <p className="font-medium text-brand-text-primary">
                                    {order.village_or_area}, {order.district_or_city}
                                  </p>
                                  <p>
                                    Gujarat — <strong>{order.pin_code}</strong>
                                  </p>
                                  <p className="text-brand-green font-semibold pt-1">
                                    📞 +91 {order.mobile_number}
                                  </p>
                                </div>
                              </div>

                              {/* Price Breakdown */}
                              <div className="p-4 sm:p-5 rounded-farm bg-white border border-brand-border text-xs space-y-2.5">
                                <span className="font-serif font-bold text-sm text-brand-text-primary flex items-center gap-1.5 pb-2 border-b border-brand-border/60">
                                  <Package className="w-4 h-4 text-brand-green" />
                                  <span>Financial Summary</span>
                                </span>

                                <div className="space-y-1.5 text-brand-text-secondary">
                                  <div className="flex items-center justify-between">
                                    <span>Subtotal:</span>
                                    <span className="font-semibold text-brand-text-primary">
                                      ₹{Number(order.subtotal).toLocaleString("en-IN")}
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between">
                                    <span>Doorstep Delivery:</span>
                                    <span className={Number(order.delivery_charge) > 0 ? "font-semibold text-brand-text-primary" : "font-semibold text-brand-green"}>
                                      {Number(order.delivery_charge) > 0 ? `₹${Number(order.delivery_charge).toLocaleString("en-IN")}` : "FREE DELIVERY"}
                                    </span>
                                  </div>

                                  {order.utr_number && (
                                    <div className="flex items-center justify-between pt-1 border-t border-brand-border/40">
                                      <span>UTR / Transaction ID:</span>
                                      <span className="font-mono font-semibold text-brand-text-primary">
                                        {order.utr_number}
                                      </span>
                                    </div>
                                  )}

                                  <div className="pt-2 border-t border-brand-border flex items-center justify-between text-sm">
                                    <span className="font-serif font-bold text-brand-text-primary">
                                      Total Payable:
                                    </span>
                                    <span className="font-serif font-bold text-xl text-brand-green">
                                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Actions Row */}
                            <div className="pt-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-3">
                                <Link
                                  href={`/track-order?orderId=${encodeURIComponent(order.order_id)}`}
                                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-bold shadow-xs transition-colors"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Track Live Order</span>
                                </Link>

                                {isVerifiedPayment && (
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadInvoice(order, items)}
                                    disabled={isDownloadingInvoice === order.order_id}
                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-farm bg-white hover:bg-brand-ivory-300 border border-brand-border text-brand-text-primary text-xs font-bold shadow-xs transition-colors"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-brand-green" />
                                    <span>
                                      {isDownloadingInvoice === order.order_id
                                        ? "Generating Invoice..."
                                        : "📄 Download Invoice"}
                                    </span>
                                  </button>
                                )}
                              </div>

                              <span className="text-[11px] text-brand-text-muted">
                                Single Source of Truth via Supabase Database.
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </Container>
    </div>
  );
}
