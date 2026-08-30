"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  User,
  Phone,
  Mail,
  Clock,
  ShieldCheck,
  Gift,
  Truck,
  Copy,
  Check,
  QrCode,
  AlertCircle,
  XCircle,
  Package,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  FileText,
  Boxes,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OrderRecord, OrderItemRecord, OrderStatus, PaymentStatus } from "@/types/database";

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Modal States
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [isDispatchedModalOpen, setIsDispatchedModalOpen] = useState(false);
  const [isDeliveredModalOpen, setIsDeliveredModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form States for Modals
  const [rejectionReason, setRejectionReason] = useState("Payment not received in UPI account");
  const [customRejectionReason, setCustomRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("Customer requested cancellation");
  const [adminNotes, setAdminNotes] = useState("");
  const [copiedUtr, setCopiedUtr] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`);

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load order details");
        return;
      }

      setOrder(data.order);
      setItems(data.items || []);
      if (data.adminEmail) setAdminEmail(data.adminEmail);
      if (data.order?.admin_notes) setAdminNotes(data.order.admin_notes);
    } catch (err: any) {
      console.error("Fetch order detail error:", err);
      setError("Network error fetching order details.");
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleCopyUtr = () => {
    if (order?.utr_number) {
      navigator.clipboard.writeText(order.utr_number);
      setCopiedUtr(true);
      setTimeout(() => setCopiedUtr(false), 2500);
    }
  };

  // 1. Confirm Payment Verification
  const handleConfirmVerify = async () => {
    setIsActionLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNotes }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to verify payment");
        setIsActionLoading(false);
        return;
      }

      setActionSuccess("Payment verified successfully. Ready to begin Processing & Packaging.");
      setIsVerifyModalOpen(false);
      await fetchOrderDetails();
    } catch (err: any) {
      setError("Network error during payment verification.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Confirm Status Progression (Processing / Dispatched / Delivered)
  const handleConfirmStatusUpdate = async (targetStatus: OrderStatus) => {
    setIsActionLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: targetStatus,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || `Failed to update status to ${targetStatus}`);
        setIsActionLoading(false);
        return;
      }

      setActionSuccess(`Order status successfully updated to ${targetStatus}.`);
      setIsProcessingModalOpen(false);
      setIsDispatchedModalOpen(false);
      setIsDeliveredModalOpen(false);
      await fetchOrderDetails();
    } catch (err: any) {
      setError("Network error during status update.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Confirm Payment Rejection
  const handleConfirmReject = async () => {
    const finalReason =
      rejectionReason === "Other" ? customRejectionReason.trim() : rejectionReason;

    if (!finalReason) {
      setError("Please specify a rejection reason.");
      return;
    }

    setIsActionLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rejectionReason: finalReason,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to reject payment");
        setIsActionLoading(false);
        return;
      }

      setActionSuccess("Payment marked as rejected. Customer order preserved.");
      setIsRejectModalOpen(false);
      await fetchOrderDetails();
    } catch (err: any) {
      setError("Network error during payment rejection.");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. Confirm Order Cancellation
  const handleConfirmCancel = async () => {
    setIsActionLoading(true);
    setError(null);
    setActionSuccess(null);

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/update-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "CANCELLED",
          cancellationReason,
          adminNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to cancel order");
        setIsActionLoading(false);
        return;
      }

      setActionSuccess("Order has been cancelled.");
      setIsCancelModalOpen(false);
      await fetchOrderDetails();
    } catch (err: any) {
      setError("Network error during order cancellation.");
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 bg-brand-ivory min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-brand-text-secondary">Loading order details...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="py-16 bg-brand-ivory min-h-[70vh] flex items-center">
        <Container size="md">
          <div className="p-8 rounded-farm-xl bg-[#FCF9F2] border border-brand-border text-center">
            <XCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
            <h2 className="font-serif font-bold text-xl text-brand-text-primary mb-2">
              Order Not Found
            </h2>
            <p className="text-xs text-brand-text-secondary mb-6">
              Could not find order with reference: {orderId}
            </p>
            <Button variant="primary" size="md" href="/admin/orders">
              Back to Orders Dashboard
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const pStatus = String(order.payment_status || "").toUpperCase();
  const oStatus = String(order.order_status || "").toUpperCase();

  const isPaymentSubmitted =
    pStatus === "PAYMENT_SUBMITTED" ||
    pStatus === "SUBMITTED" ||
    oStatus === "PAYMENT_VERIFICATION";

  const isPaymentVerified =
    pStatus === "PAYMENT_VERIFIED" ||
    pStatus === "VERIFIED" ||
    oStatus === "PAYMENT_VERIFIED" ||
    oStatus === "PROCESSING" ||
    oStatus === "DISPATCHED" ||
    oStatus === "DELIVERED";

  const isReadyForProcessing =
    isPaymentVerified && (oStatus === "PAYMENT_VERIFIED" || oStatus === "PAYMENT_VERIFICATION");

  const isProcessing = oStatus === "PROCESSING";
  const isDispatched = oStatus === "DISPATCHED";
  const isDelivered = oStatus === "DELIVERED";
  const isCancelled = oStatus === "CANCELLED";

  return (
    <div className="py-8 sm:py-12 bg-brand-ivory min-h-screen text-left">
      <Container size="lg">
        {/* BACK NAVIGATION & TITLE */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-green uppercase tracking-wider mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders List</span>
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text-primary">
                Manage Order: {order.order_id}
              </h1>

              {/* Payment Status Pill */}
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isPaymentVerified
                    ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                    : isPaymentSubmitted
                    ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                    : pStatus === "REJECTED"
                    ? "bg-rose-100 text-rose-900 border border-rose-300"
                    : "bg-gray-100 text-gray-800 border border-gray-300"
                }`}
              >
                Payment: {isPaymentVerified ? "VERIFIED" : isPaymentSubmitted ? "SUBMITTED (NEEDS REVIEW)" : pStatus}
              </span>

              {/* Order Status Pill */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-ivory-300 border border-brand-border text-brand-text-secondary">
                Status: {order.order_status}
              </span>
            </div>
          </div>

          <span className="text-xs text-brand-text-muted">
            Created: {new Date(order.created_at || "").toLocaleString("en-IN")}
          </span>
        </div>

        {/* FEEDBACK ALERTS */}
        {actionSuccess && (
          <div className="mb-6 p-4 rounded-farm bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-farm bg-rose-50 border border-rose-200 text-rose-900 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 5. PAYMENT VERIFICATION PANEL (TOP SECTION) */}
        <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border-2 border-brand-green/30 shadow-elevated mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 mb-6 border-b border-brand-border/70 gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-brand-green" />
              <div>
                <h2 className="font-serif text-xl font-bold text-brand-text-primary">
                  Payment Verification Panel
                </h2>
                <span className="text-xs text-brand-text-secondary">
                  Manual UPI settlement verification
                </span>
              </div>
            </div>

            {/* Action Buttons for Verification */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {!isPaymentVerified && (
                <>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsVerifyModalOpen(true)}
                    disabled={isActionLoading}
                    icon={<CheckCircle className="w-4 h-4" />}
                    className="bg-emerald-700 hover:bg-emerald-800"
                  >
                    ✓ Verify Payment
                  </Button>

                  <button
                    type="button"
                    onClick={() => setIsRejectModalOpen(true)}
                    disabled={isActionLoading}
                    className="h-10 px-4 rounded-farm bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-colors"
                  >
                    Reject Payment
                  </button>
                </>
              )}

              {isPaymentVerified && (
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-farm bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified by {order.payment_verified_by || "Admin"}</span>
                  </div>

                  <a
                    href={`/api/orders/${order.order_id}/invoice`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-bold shadow-xs transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>📄 Download Invoice</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Verification Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6 text-xs">
            <div className="p-4 rounded-farm bg-white border border-brand-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Payable Amount
              </span>
              <span className="font-serif font-bold text-2xl text-brand-green">
                ₹{Number(order.total_amount).toLocaleString("en-IN")}
              </span>
            </div>

            <div className="p-4 rounded-farm bg-white border border-brand-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Customer Submitted UTR
              </span>
              {order.utr_number ? (
                <div className="flex items-center justify-between gap-2 mt-1">
                  <span className="font-mono font-bold text-sm text-brand-text-primary">
                    {order.utr_number}
                  </span>
                  <button
                    onClick={handleCopyUtr}
                    className="p-1 rounded hover:bg-brand-ivory text-brand-text-muted hover:text-brand-green"
                    title="Copy UTR"
                  >
                    {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-brand-text-muted italic">Not submitted yet</span>
              )}
            </div>

            <div className="p-4 rounded-farm bg-white border border-brand-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Submission Timestamp
              </span>
              <span className="text-xs font-semibold text-brand-text-primary block mt-1">
                {order.payment_submitted_at
                  ? new Date(order.payment_submitted_at).toLocaleString("en-IN")
                  : "Pending submission"}
              </span>
            </div>

            <div className="p-4 rounded-farm bg-white border border-brand-border">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                Target Account
              </span>
              <span className="font-mono text-xs font-semibold text-brand-text-primary block mt-1">
                shailesh03k@okaxis
              </span>
              <span className="text-[10px] text-brand-text-muted">(Shailesh Kankotia)</span>
            </div>
          </div>

          {/* Rejection notice if applicable */}
          {pStatus === "REJECTED" && order.payment_rejection_reason && (
            <div className="mb-6 p-4 rounded-farm bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <strong className="block font-bold mb-0.5">Rejection Reason:</strong>
              <span>{order.payment_rejection_reason}</span>
            </div>
          )}

          {/* Policy Notice */}
          <div className="p-3.5 rounded-farm bg-amber-50/80 border border-amber-200 text-amber-900 text-[11px] leading-snug flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span>
              <strong>Manual Verification Required:</strong> Confirm credit of ₹{Number(order.total_amount).toLocaleString("en-IN")} with UTR {order.utr_number || "reference"} in your UPI bank app before verifying.
            </span>
          </div>
        </div>

        {/* 2-COLUMN MAIN ORDER DETAILS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* LEFT: CUSTOMER DETAILS & GUJARAT DELIVERY DESTINATION */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* SECTION 2 — CUSTOMER DETAILS */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 border border-brand-border shadow-subtle">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-brand-border/70">
                <User className="w-4 h-4 text-brand-green" />
                <h3 className="font-serif font-bold text-base text-brand-text-primary">
                  Customer Contact
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Full Name</span>
                  <span className="font-serif font-bold text-base text-brand-text-primary">
                    {order.first_name} {order.middle_name ? `${order.middle_name} ` : ""}{order.last_name}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Mobile Number</span>
                    <a
                      href={`tel:${order.mobile_number}`}
                      className="font-semibold text-brand-green hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>+91 {order.mobile_number}</span>
                    </a>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Email Address</span>
                    <a
                      href={`mailto:${order.email}`}
                      className="font-semibold text-brand-green hover:underline flex items-center gap-1 mt-0.5 truncate"
                    >
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{order.email}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3 — GUJARAT DELIVERY ADDRESS */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 border border-brand-border shadow-subtle">
              <div className="flex items-center gap-2 pb-3 mb-4 border-b border-brand-border/70">
                <MapPin className="w-4 h-4 text-brand-green" />
                <h3 className="font-serif font-bold text-base text-brand-text-primary">
                  Gujarat Delivery Destination
                </h3>
              </div>

              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Address</span>
                  <span className="font-medium text-brand-text-primary block mt-0.5">
                    {order.address_line_1}
                    {order.address_line_2 ? `, ${order.address_line_2}` : ""}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">District / City</span>
                    <span className="font-semibold text-brand-text-primary">{order.district_or_city}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Village / Area</span>
                    <span className="font-semibold text-brand-text-primary">{order.village_or_area}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">PIN Code</span>
                    <span className="font-mono font-bold text-brand-text-primary">{order.pin_code}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-brand-text-muted block">State</span>
                    <span className="font-semibold text-brand-green">Gujarat</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT: ORDERED PRODUCTS & SEQUENTIAL LIFECYCLE MANAGEMENT */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            
            {/* SECTION 4 — ORDERED PRODUCTS */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 border border-brand-border shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border/70">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-green" />
                  <h3 className="font-serif font-bold text-base text-brand-text-primary">
                    Ordered Products ({items.length})
                  </h3>
                </div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-brand-border/60 mb-4">
                {items.map((item, idx) => (
                  <div key={idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-13 rounded overflow-hidden border border-brand-border bg-white shrink-0">
                        <Image
                          src="/images/vermicompost-label.png"
                          alt="Product"
                          fill
                          sizes="44px"
                          className="object-contain p-0.5"
                          unoptimized
                        />
                      </div>
                      <div>
                        <h4 className="font-serif font-bold text-sm text-brand-text-primary">
                          {item.product_name} ({item.package_size})
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

              {/* Financial Calculation */}
              <div className="pt-3 border-t border-brand-border space-y-2 text-xs text-brand-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-text-primary">
                    ₹{Number(order.subtotal).toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Charge:</span>
                  <span className="text-brand-green font-semibold">FREE DELIVERY</span>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between text-base">
                  <span className="font-serif font-bold text-brand-text-primary">Final Payable Total:</span>
                  <span className="font-serif font-bold text-2xl text-brand-green">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* SEQUENTIAL ORDER LIFECYCLE MANAGEMENT (NO STAGE SKIPPING) */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 border border-brand-border shadow-subtle">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border/70">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-green" />
                  <h3 className="font-serif font-bold text-base text-brand-text-primary">
                    Sequential Lifecycle Management
                  </h3>
                </div>
                <span className="text-xs font-bold text-brand-green uppercase">
                  {order.order_status}
                </span>
              </div>

              {/* Strict Sequential Action Buttons */}
              <div className="space-y-3 mb-5">
                {/* STEP 1: Processing & Packaging */}
                {isReadyForProcessing && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsProcessingModalOpen(true)}
                    disabled={isActionLoading}
                    icon={<Boxes className="w-4 h-4" />}
                    className="w-full bg-blue-700 hover:bg-blue-800 py-3"
                  >
                    Start Processing & Packaging
                  </Button>
                )}

                {/* STEP 2: Mark as Dispatched */}
                {isProcessing && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsDispatchedModalOpen(true)}
                    disabled={isActionLoading}
                    icon={<Truck className="w-4 h-4" />}
                    className="w-full bg-indigo-700 hover:bg-indigo-800 py-3"
                  >
                    Mark as Dispatched
                  </Button>
                )}

                {/* STEP 3: Mark as Delivered */}
                {isDispatched && (
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => setIsDeliveredModalOpen(true)}
                    disabled={isActionLoading}
                    icon={<CheckCircle className="w-4 h-4" />}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 py-3"
                  >
                    Mark as Delivered
                  </Button>
                )}

                {isDelivered && (
                  <div className="p-3.5 rounded-farm bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Order Successfully Completed & Delivered</span>
                  </div>
                )}

                {!isPaymentVerified && (
                  <div className="p-3 rounded-farm bg-gray-100 text-gray-600 text-xs text-center">
                    🔒 Processing & Dispatch locked until payment is verified above.
                  </div>
                )}

                {!isDelivered && !isCancelled && (
                  <div className="pt-2 border-t border-brand-border/50 text-right">
                    <button
                      type="button"
                      onClick={() => setIsCancelModalOpen(true)}
                      disabled={isActionLoading}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:underline"
                    >
                      Cancel Order
                    </button>
                  </div>
                )}
              </div>

              {/* Fulfillment Timeline */}
              <div className="space-y-3 pt-2 border-t border-brand-border/60 text-xs">
                {/* 1. Created */}
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  <div>
                    <strong className="text-brand-text-primary">Order Created:</strong>{" "}
                    <span className="text-brand-text-secondary">{new Date(order.created_at || "").toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* 2. Payment Submitted */}
                <div className="flex items-center gap-2.5">
                  {order.payment_submitted_at ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                  )}
                  <div>
                    <strong className="text-brand-text-primary">Payment Submitted:</strong>{" "}
                    <span className="text-brand-text-secondary">
                      {order.payment_submitted_at ? new Date(order.payment_submitted_at).toLocaleString("en-IN") : "Awaiting Customer"}
                    </span>
                  </div>
                </div>

                {/* 3. Payment Verified */}
                <div className="flex items-center gap-2.5">
                  {isPaymentVerified ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                  )}
                  <div>
                    <strong className="text-brand-text-primary">Payment Verified:</strong>{" "}
                    <span className="text-brand-text-secondary">
                      {order.payment_verified_at ? new Date(order.payment_verified_at).toLocaleString("en-IN") : "Pending Admin Review"}
                    </span>
                  </div>
                </div>

                {/* 4. Processing */}
                <div className="flex items-center gap-2.5">
                  {isProcessing || isDispatched || isDelivered ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                  )}
                  <div>
                    <strong className="text-brand-text-primary">Processing & Packaging:</strong>{" "}
                    <span className="text-brand-text-secondary">
                      {isProcessing ? "In Progress" : isDispatched || isDelivered ? "Completed" : "Not yet started"}
                    </span>
                  </div>
                </div>

                {/* 5. Dispatched */}
                <div className="flex items-center gap-2.5">
                  {isDispatched || isDelivered ? (
                    <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                  )}
                  <div>
                    <strong className="text-brand-text-primary">Dispatched:</strong>{" "}
                    <span className="text-brand-text-secondary">
                      {order.dispatched_at ? new Date(order.dispatched_at).toLocaleString("en-IN") : "Pending dispatch"}
                    </span>
                  </div>
                </div>

                {/* 6. Delivered */}
                <div className="flex items-center gap-2.5">
                  {isDelivered ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-brand-text-muted shrink-0" />
                  )}
                  <div>
                    <strong className="text-brand-text-primary">Delivered:</strong>{" "}
                    <span className="text-brand-text-secondary">
                      {order.delivered_at ? new Date(order.delivered_at).toLocaleString("en-IN") : "Pending delivery"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ========================================================================= */}
        {/* CONFIRMATION MODALS */}
        {/* ========================================================================= */}

        {/* 1. VERIFY PAYMENT POPUP */}
        {isVerifyModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <div className="flex items-center gap-2.5 text-emerald-800 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-serif font-bold text-xl text-brand-text-primary">
                  Verify Payment?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-4">
                Are you sure you want to verify this payment?
              </p>

              {/* Order Reference, Amount, UTR Breakdown */}
              <div className="p-3.5 rounded-farm bg-white border border-brand-border space-y-2 text-xs mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-muted">Order ID:</span>
                  <span className="font-serif font-bold text-brand-text-primary">{order.order_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-muted">Amount:</span>
                  <span className="font-serif font-bold text-brand-green text-sm">
                    ₹{Number(order.total_amount).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-brand-text-muted">UTR Number:</span>
                  <span className="font-mono font-semibold text-brand-text-primary">
                    {order.utr_number || "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsVerifyModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleConfirmVerify}
                  disabled={isActionLoading}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  {isActionLoading ? "Verifying..." : "Yes, Verify Payment"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: PROCESSING POPUP */}
        {isProcessingModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <div className="flex items-center gap-2.5 text-blue-800 mb-3">
                <Boxes className="w-6 h-6 text-blue-600" />
                <h3 className="font-serif font-bold text-xl text-brand-text-primary">
                  Start Processing & Packaging?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-4">
                Are you sure you want to move order <strong>{order.order_id}</strong> to Processing & Packaging?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsProcessingModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleConfirmStatusUpdate("PROCESSING")}
                  disabled={isActionLoading}
                  className="bg-blue-700 hover:bg-blue-800"
                >
                  {isActionLoading ? "Updating..." : "Confirm"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: DISPATCH POPUP */}
        {isDispatchedModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <div className="flex items-center gap-2.5 text-indigo-800 mb-3">
                <Truck className="w-6 h-6 text-indigo-600" />
                <h3 className="font-serif font-bold text-xl text-brand-text-primary">
                  Mark Order Dispatched?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-4">
                Are you sure order <strong>{order.order_id}</strong> has been dispatched for Gujarat doorstep delivery?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsDispatchedModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleConfirmStatusUpdate("DISPATCHED")}
                  disabled={isActionLoading}
                  className="bg-indigo-700 hover:bg-indigo-800"
                >
                  {isActionLoading ? "Updating..." : "Yes, Mark Dispatched"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DELIVERED POPUP */}
        {isDeliveredModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <div className="flex items-center gap-2.5 text-emerald-800 mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
                <h3 className="font-serif font-bold text-xl text-brand-text-primary">
                  Mark Order Delivered?
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-4">
                Are you sure order <strong>{order.order_id}</strong> has been successfully delivered?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsDeliveredModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary"
                >
                  Cancel
                </button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleConfirmStatusUpdate("DELIVERED")}
                  disabled={isActionLoading}
                  className="bg-emerald-700 hover:bg-emerald-800"
                >
                  {isActionLoading ? "Updating..." : "Yes, Mark Delivered"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* REJECT PAYMENT MODAL */}
        {isRejectModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <div className="flex items-center gap-2.5 text-rose-800 mb-3">
                <AlertTriangle className="w-6 h-6 text-rose-600" />
                <h3 className="font-serif font-bold text-xl text-brand-text-primary">
                  Reject Payment
                </h3>
              </div>

              <p className="text-xs text-brand-text-secondary mb-4">
                Specify why this payment is being rejected. The customer order will be preserved in awaiting payment status.
              </p>

              <div className="space-y-3 mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted block">
                  Rejection Reason
                </label>
                <select
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full h-11 px-3 rounded-farm bg-white border border-brand-border text-xs text-brand-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="Payment not received in UPI account">Payment not received in UPI account</option>
                  <option value="Invalid UTR / Transaction ID">Invalid UTR / Transaction ID</option>
                  <option value="Incorrect payment amount received">Incorrect payment amount received</option>
                  <option value="Duplicate transaction reference">Duplicate transaction reference</option>
                  <option value="Other">Other (custom explanation)</option>
                </select>

                {rejectionReason === "Other" && (
                  <input
                    type="text"
                    value={customRejectionReason}
                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                    placeholder="Enter custom rejection reason..."
                    className="w-full h-11 px-3 rounded-farm bg-white border border-brand-border text-xs text-brand-text-primary"
                    required
                  />
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary hover:text-brand-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors"
                >
                  {isActionLoading ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CANCEL ORDER MODAL */}
        {isCancelModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border max-w-md w-full p-6 sm:p-7 shadow-elevated text-left">
              <h3 className="font-serif font-bold text-xl text-brand-text-primary mb-2">
                Cancel Order {order.order_id}
              </h3>
              <p className="text-xs text-brand-text-secondary mb-4">
                Are you sure you want to cancel this order?
              </p>

              <div className="space-y-3 mb-5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-muted block">
                  Cancellation Reason
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full h-11 px-3 rounded-farm bg-white border border-brand-border text-xs text-brand-text-primary font-medium focus:outline-none focus:ring-2 focus:ring-brand-green"
                >
                  <option value="Customer requested cancellation">Customer requested cancellation</option>
                  <option value="Out of delivery coverage area">Out of delivery coverage area</option>
                  <option value="Payment verification expired / unpaid">Payment verification expired / unpaid</option>
                  <option value="Duplicate order placed">Duplicate order placed</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-brand-border/60">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-secondary"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isActionLoading}
                  className="px-4 py-2 rounded-farm bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
                >
                  {isActionLoading ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}

      </Container>
    </div>
  );
}
