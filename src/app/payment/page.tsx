"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
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
  ShoppingBag,
  ShieldCheck,
  Gift,
  Truck,
  Copy,
  Check,
  QrCode,
  Upload,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { DynamicUpiQr } from "@/components/payment/DynamicUpiQr";
import { OrderRecord, OrderItemRecord, SubmitPaymentResponse } from "@/types/database";
import { CheckoutData } from "@/types/checkout";
import { useCart } from "@/context/CartContext";

const UPI_ID = "shailesh03k@okaxis";
const PAYEE_NAME = "Shailesh Kankotia";

function PaymentContent() {
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const { clearCart } = useCart();

  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderRecord, setOrderRecord] = useState<OrderRecord | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItemRecord[]>([]);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedOrderId, setCopiedOrderId] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Form State
  const [utrNumber, setUtrNumber] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittedSuccess, setIsSubmittedSuccess] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SubmitPaymentResponse | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 1. Read Order ID from URL param or local storage
    const activeOrderId =
      orderIdParam ||
      (typeof window !== "undefined" ? localStorage.getItem("kp_current_order_id") : null);

    setOrderId(activeOrderId);

    // 2. Read local fallback checkout data
    try {
      const savedCheckout = localStorage.getItem("kp_checkout_data");
      if (savedCheckout) {
        setCheckoutData(JSON.parse(savedCheckout));
      }

      const savedOrder = localStorage.getItem("kp_current_order");
      if (savedOrder) {
        const parsedOrder: OrderRecord = JSON.parse(savedOrder);
        setOrderRecord(parsedOrder);
        if (parsedOrder.payment_status === "SUBMITTED" || parsedOrder.order_status === "PAYMENT_VERIFICATION") {
          setIsSubmittedSuccess(true);
          setSubmissionResult({
            success: true,
            orderId: parsedOrder.order_id,
            paymentStatus: parsedOrder.payment_status,
            orderStatus: parsedOrder.order_status,
            utrNumber: parsedOrder.utr_number || undefined,
            submittedAt: parsedOrder.payment_submitted_at || undefined,
          });
        }
      }
    } catch {
      // Ignore
    }

    // 3. If Order ID exists, fetch from server API
    if (activeOrderId) {
      fetch(`/api/orders/${activeOrderId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.order) {
            setOrderRecord(data.order);
            if (data.items) setOrderItems(data.items);
            if (data.order.payment_status === "SUBMITTED" || data.order.order_status === "PAYMENT_VERIFICATION") {
              setIsSubmittedSuccess(true);
              setSubmissionResult({
                success: true,
                orderId: data.order.order_id,
                paymentStatus: data.order.payment_status,
                orderStatus: data.order.order_status,
                utrNumber: data.order.utr_number || undefined,
                submittedAt: data.order.payment_submitted_at || undefined,
              });
            }
          }
        })
        .catch(() => {
          // Use localStorage fallback silently
        })
        .finally(() => {
          setIsLoaded(true);
        });
    } else {
      setIsLoaded(true);
    }
  }, [orderIdParam]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleCopyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopiedOrderId(true);
      setTimeout(() => setCopiedOrderId(false), 2500);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please select a valid image file (JPG, PNG, WEBP)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("Image file size should be less than 10 MB");
      return;
    }

    setFormError(null);
    setScreenshotFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();

    if (!cleanUtr) {
      setFormError("Please enter your UPI UTR / Transaction ID");
      return;
    }

    if (cleanUtr.length < 6) {
      setFormError("UTR / Transaction ID should be at least 6 characters");
      return;
    }

    const currentOrderId = orderId || orderRecord?.order_id;
    if (!currentOrderId) {
      setFormError("No order reference found. Please return to checkout.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      const response = await fetch("/api/orders/payment-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: currentOrderId,
          utrNumber: cleanUtr,
          paymentMethod: "UPI",
          screenshotFileName: screenshotFile?.name,
        }),
      });

      const result: SubmitPaymentResponse = await response.json();

      if (!result.success) {
        setFormError(result.error || "Failed to submit payment details. Please try again.");
        setIsSubmitting(false);
        return;
      }

      // Update local storage record
      if (orderRecord) {
        const updated = {
          ...orderRecord,
          payment_status: "PAYMENT_SUBMITTED" as const,
          order_status: "PAYMENT_VERIFICATION" as const,
          utr_number: cleanUtr,
          payment_submitted_at: result.submittedAt || new Date().toISOString(),
        };
        localStorage.setItem("kp_current_order", JSON.stringify(updated));
        setOrderRecord(updated);
      }

      // Automatically clear cart after successful payment review submission
      try {
        clearCart();
        localStorage.removeItem("kp_natural_cart");
      } catch {
        // Ignore
      }

      setSubmissionResult(result);
      setIsSubmittedSuccess(true);
      setIsSubmitting(false);
    } catch (err: any) {
      console.error("Payment Submission Error:", err);
      setFormError("Network error while submitting payment details. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="py-20 min-h-[60vh] flex items-center justify-center bg-brand-ivory">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-border/60" />
          <div className="h-4 w-32 bg-brand-border/60 rounded" />
        </div>
      </div>
    );
  }

  // If no order ID or checkout data found
  if (!orderId && !checkoutData && !orderRecord) {
    return (
      <div className="py-16 sm:py-24 min-h-[70vh] flex items-center bg-brand-ivory">
        <Container size="md">
          <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle max-w-xl mx-auto">
            <ShoppingBag className="w-12 h-12 text-brand-green mb-4" />
            <h1 className="font-serif text-2xl font-bold text-brand-text-primary mb-2">
              No Pending Order Found
            </h1>
            <p className="text-sm text-brand-text-secondary mb-6">
              Please enter your contact details and Gujarat delivery address in checkout.
            </p>
            <Button variant="primary" size="md" href="/checkout">
              Go to Checkout
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const customerName = orderRecord
    ? `${orderRecord.first_name} ${orderRecord.middle_name ? `${orderRecord.middle_name} ` : ""}${orderRecord.last_name}`
    : checkoutData?.customerDetails
    ? `${checkoutData.customerDetails.firstName} ${checkoutData.customerDetails.middleName ? `${checkoutData.customerDetails.middleName} ` : ""}${checkoutData.customerDetails.lastName}`
    : "Valued Customer";

  const totalAmount = orderRecord?.total_amount ?? checkoutData?.totalAmount ?? 0;
  const displayOrderId = orderId || orderRecord?.order_id || "KP-PENDING-ORDER";

  const itemsList =
    orderItems.length > 0
      ? orderItems
      : checkoutData?.cartItems.map((i) => ({
          product_name: i.packName,
          package_size: `${i.weightKg} KG`,
          quantity: i.quantity,
          unit_price: i.price,
          line_total: i.price * i.quantity,
          free_cocopeat_quantity: i.freeCocopeatKg * i.quantity,
        })) || [];

  const totalFreeCocopeat = itemsList.reduce(
    (acc, i) => acc + (i.free_cocopeat_quantity || 0),
    0
  );

  // =========================================================================
  // SUCCESS STATE (POST-SUBMISSION)
  // =========================================================================
  if (isSubmittedSuccess) {
    return (
      <div className="py-10 sm:py-16 lg:py-20 bg-brand-ivory min-h-[85vh]">
        <Container size="md">
          {/* CHECKOUT PROGRESS (Step 4: Review / Submitted) */}
          <div className="mb-8 sm:mb-10">
            <CheckoutProgress currentStep={4} />
          </div>

          <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-10 border-2 border-brand-green/40 shadow-elevated text-left">
            {/* Success Header */}
            <div className="flex flex-col items-center text-center pb-8 border-b border-brand-border/70">
              <div className="w-16 h-16 rounded-full bg-brand-green text-brand-ivory flex items-center justify-center mb-4 shadow-sm">
                <Check className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
                <span>PAYMENT DETAILS RECEIVED</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-text-primary mb-2">
                Payment Details Submitted
              </h1>

              <p className="text-sm sm:text-base text-brand-text-secondary max-w-lg leading-relaxed">
                Your payment details have been received successfully and are awaiting manual verification by the KP Natural Dairy Farm team.
              </p>
            </div>

            {/* Order Reference Details Grid */}
            <div className="py-6 border-b border-brand-border/70 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  Official Order Reference
                </span>
                <span className="font-serif font-bold text-lg text-brand-green">
                  {displayOrderId}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  Payment Status
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                  Submitted for Verification
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  UTR / Transaction ID
                </span>
                <span className="font-mono text-sm font-semibold text-brand-text-primary">
                  {submissionResult?.utrNumber || utrNumber || "Recorded in database"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted">
                  Amount Submitted
                </span>
                <span className="font-serif font-bold text-xl text-brand-text-primary">
                  ₹{Number(totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            {/* Verification Timeline */}
            <div className="py-6 border-b border-brand-border/70 space-y-3">
              <h3 className="font-serif font-bold text-base text-brand-text-primary">
                Order Lifecycle:
              </h3>
              <div className="flex items-center gap-3 text-xs text-brand-text-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                <span><strong>Order Registered</strong> — Customer and delivery address saved in database.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-text-primary">
                <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                <span><strong>Payment Submitted</strong> — UTR / Reference recorded for verification.</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-text-muted">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span><strong>Verification & Farm Dispatch</strong> — Farm team verifies UPI credit and initiates doorstep packaging.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  href={`/track-order?orderId=${encodeURIComponent(displayOrderId)}`}
                  className="w-full sm:w-auto shadow-subtle hover:shadow-premium"
                >
                  Track My Order
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  href="/#vermicompost-showcase"
                  className="w-full sm:w-auto"
                >
                  Back to Homepage
                </Button>
              </div>

              <span className="text-xs text-brand-text-muted text-center sm:text-right">
                Direct farm inquiries & customer support available.
              </span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // =========================================================================
  // ACTIVE DYNAMIC UPI PAYMENT & SUBMISSION VIEW
  // =========================================================================
  return (
    <div className="py-8 sm:py-14 lg:py-16 bg-brand-ivory min-h-[85vh]">
      <Container size="lg">
        {/* CHECKOUT PROGRESS (Step 3: Payment Active) */}
        <div className="mb-8 sm:mb-10">
          <CheckoutProgress currentStep={3} />
        </div>

        {/* HEADER */}
        <div className="flex flex-col items-start mb-8 text-left">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-xs font-semibold text-brand-text-secondary hover:text-brand-green transition-colors uppercase tracking-wider mb-3"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Edit Customer Details</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 animate-pulse" />
            <span>STEP 3 — DYNAMIC UPI PAYMENT</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight">
            Complete Your Payment
          </h1>

          <p className="text-sm sm:text-base text-brand-text-secondary mt-1">
            Scan the QR code using any UPI app. The exact order amount of <strong>₹{Number(totalAmount).toLocaleString("en-IN")}</strong> is pre-filled automatically.
          </p>
        </div>

        {/* MAIN 2-COLUMN PAYMENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: DYNAMIC UPI QR CODE & SUBMISSION FORM */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-8 text-left">
            
            {/* 1. DYNAMIC UPI QR PAYMENT CARD */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border border-brand-border shadow-elevated">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-brand-border/70">
                <div className="flex items-center gap-2.5 text-brand-text-primary">
                  <QrCode className="w-5 h-5 text-brand-green" />
                  <h2 className="font-serif text-xl font-bold">
                    Dynamic UPI QR Payment
                  </h2>
                </div>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-green uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-brand-green/10">
                  <Zap className="w-3 h-3 text-brand-green" />
                  <span>Amount Pre-filled</span>
                </span>
              </div>

              {/* Dynamic QR Code Presentation Box */}
              <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 bg-white p-5 sm:p-6 rounded-farm-lg border border-brand-border/80 shadow-xs mb-6">
                
                {/* Dynamic QR Code Component */}
                <DynamicUpiQr
                  amount={totalAmount}
                  orderId={displayOrderId}
                  payeeUpi={UPI_ID}
                  payeeName={PAYEE_NAME}
                />

                {/* UPI Details beside Dynamic QR */}
                <div className="flex flex-col items-start w-full">
                  <div className="mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-0.5 block">
                      Payable Amount (Auto Filled)
                    </span>
                    <span className="font-serif font-bold text-3xl sm:text-4xl text-brand-green">
                      ₹{Number(totalAmount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* Account Holder & Payee Info */}
                  <div className="mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-0.5 block">
                      Payee / Account Holder
                    </span>
                    <span className="text-sm font-semibold text-brand-text-primary">
                      {PAYEE_NAME}
                    </span>
                  </div>

                  {/* UPI ID Box with Copy Button */}
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-1">
                    Official UPI ID
                  </span>
                  <div className="flex items-center gap-2 w-full max-w-sm mb-4">
                    <div className="flex-1 h-10 px-3 rounded-farm bg-brand-ivory-300/80 border border-brand-border flex items-center font-mono font-semibold text-xs sm:text-sm text-brand-text-primary select-all">
                      {UPI_ID}
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="h-10 px-3 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                      aria-label="Copy UPI ID"
                    >
                      {copiedUpi ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Supported UPI Apps Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-brand-text-secondary font-medium">
                    <span className="px-2 py-0.5 rounded bg-brand-ivory-300 border border-brand-border">Google Pay</span>
                    <span className="px-2 py-0.5 rounded bg-brand-ivory-300 border border-brand-border">PhonePe</span>
                    <span className="px-2 py-0.5 rounded bg-brand-ivory-300 border border-brand-border">Paytm</span>
                    <span className="px-2 py-0.5 rounded bg-brand-ivory-300 border border-brand-border">BHIM</span>
                  </div>
                </div>
              </div>

              {/* 4. Payment Instructions (Numbered Flow) */}
              <div className="bg-[#FAF5EA] rounded-farm p-4 sm:p-5 border border-brand-border/70">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-green mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                  <span>Payment Instructions:</span>
                </h3>
                <ol className="space-y-2 text-xs sm:text-sm text-brand-text-secondary list-decimal list-inside leading-relaxed">
                  <li>Open any UPI payment app (Google Pay, PhonePe, Paytm, BHIM, etc.).</li>
                  <li>Scan the dynamic QR code above (the amount <strong>₹{Number(totalAmount).toLocaleString("en-IN")}</strong> is filled automatically).</li>
                  <li>Verify payee name: <strong>{PAYEE_NAME}</strong> ({UPI_ID}).</li>
                  <li>Complete payment and copy your <strong>UTR / 12-digit UPI Transaction ID</strong>.</li>
                  <li>Enter the UTR reference below and click <strong>Submit Payment Details</strong>.</li>
                </ol>
              </div>
            </div>

            {/* 5. PAYMENT SUBMISSION FORM */}
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-8 border border-brand-border shadow-subtle">
              <div className="pb-4 mb-6 border-b border-brand-border/70">
                <h2 className="font-serif text-xl font-bold text-brand-text-primary">
                  Submit Payment Verification Details
                </h2>
                <p className="text-xs text-brand-text-secondary mt-0.5">
                  Enter the transaction reference from your UPI app so our farm team can verify your payment.
                </p>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5" noValidate>
                {/* UTR / Transaction ID Input */}
                <div className="flex flex-col text-left">
                  <label htmlFor="utrNumber" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1">
                    <span>UTR / UPI Transaction ID</span>
                    <span className="text-rose-600 font-bold">*</span>
                  </label>
                  <input
                    id="utrNumber"
                    type="text"
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value);
                      if (formError) setFormError(null);
                    }}
                    placeholder="e.g. 423589123456 or Bank Ref ID"
                    className="h-12 px-4 rounded-farm bg-white border border-brand-border font-mono text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                    required
                  />
                  <span className="text-[11px] text-brand-text-muted mt-1">
                    Find this 12-digit number (or transaction ref) in your UPI payment receipt.
                  </span>
                </div>

                {/* Optional Screenshot Upload */}
                <div className="flex flex-col text-left">
                  <label className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5">
                    Payment Screenshot <span className="text-[10px] text-brand-text-muted font-normal">(Optional)</span>
                  </label>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshotInput"
                  />

                  {!screenshotPreview ? (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full border-2 border-dashed border-brand-border rounded-farm-lg p-5 flex flex-col items-center justify-center gap-2 hover:border-brand-green/50 hover:bg-brand-green-50/30 transition-colors cursor-pointer"
                    >
                      <Upload className="w-5 h-5 text-brand-green" />
                      <span className="text-xs font-semibold text-brand-text-primary">
                        Click to upload payment screenshot
                      </span>
                      <span className="text-[10px] text-brand-text-muted">
                        Supports JPG, PNG, WEBP (Max 10 MB)
                      </span>
                    </button>
                  ) : (
                    <div className="relative p-3 rounded-farm bg-white border border-brand-border flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-12 h-12 rounded overflow-hidden border border-brand-border shrink-0 bg-brand-ivory-300">
                          <Image
                            src={screenshotPreview}
                            alt="Screenshot Preview"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col text-xs truncate">
                          <span className="font-semibold text-brand-text-primary truncate">
                            {screenshotFile?.name}
                          </span>
                          <span className="text-brand-text-muted text-[10px]">
                            {screenshotFile ? (screenshotFile.size / 1024).toFixed(1) + " KB" : ""}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveScreenshot}
                        className="p-1.5 rounded-full hover:bg-rose-50 text-rose-600 transition-colors"
                        title="Remove screenshot"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Inline Form Error */}
                {formError && (
                  <div className="p-3.5 rounded-farm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Pre-submission Notice */}
                <div className="p-3.5 rounded-farm bg-brand-green-50/70 border border-brand-green/20 text-xs text-brand-text-secondary leading-snug">
                  🛡️ <strong>Notice:</strong> Your payment will be verified by our farm team before your order is dispatched.
                </div>

                {/* Submit Action */}
                <Button
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={isSubmitting}
                  icon={
                    isSubmitting ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ArrowRight className="w-5 h-5" />
                    )
                  }
                  className="w-full py-4 text-base shadow-subtle hover:shadow-premium"
                >
                  {isSubmitting ? "Submitting Payment Details..." : "Submit Payment Details"}
                </Button>
              </form>
            </div>

          </div>

          {/* RIGHT: ORDER SUMMARY CARD */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24 text-left">
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border/90 shadow-elevated">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-brand-border/70">
                <h2 className="font-serif font-bold text-xl text-brand-text-primary">
                  Order Summary
                </h2>
                <span className="text-xs text-brand-green font-semibold">
                  {itemsList.length} {itemsList.length === 1 ? "Product" : "Products"}
                </span>
              </div>

              {/* Order Reference Tag */}
              <div className="mb-4 p-2.5 rounded bg-[#FAF5EA] border border-brand-border/60 flex items-center justify-between text-xs">
                <span className="text-brand-text-muted font-medium">Order Ref:</span>
                <span className="font-serif font-bold text-brand-green">{displayOrderId}</span>
              </div>

              {/* Itemized Cart Items */}
              <div className="divide-y divide-brand-border/50 max-h-60 overflow-y-auto pr-1 mb-4">
                {itemsList.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="relative w-10 h-12 rounded overflow-hidden border border-brand-border bg-white shrink-0">
                        <Image
                          src="/images/vermicompost-label.png"
                          alt="Vermicompost"
                          fill
                          sizes="40px"
                          className="object-contain p-0.5"
                          unoptimized
                        />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-brand-text-primary block">
                          {item.product_name || "Vermicompost"} ({item.package_size})
                        </span>
                        <span className="text-brand-text-muted">
                          Qty: {item.quantity} × ₹{Number(item.unit_price).toLocaleString("en-IN")}
                        </span>
                        {item.free_cocopeat_quantity > 0 && (
                          <span className="text-[10px] font-semibold text-brand-green flex items-center gap-0.5 mt-0.5">
                            <Gift className="w-2.5 h-2.5" />
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

              {/* Financial Calculation */}
              <div className="space-y-2.5 pt-3 border-t border-brand-border text-xs text-brand-text-secondary mb-5">
                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-text-primary">
                    ₹{Number(totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>

                {totalFreeCocopeat > 0 && (
                  <div className="flex items-center justify-between text-brand-green font-medium">
                    <span className="flex items-center gap-1">
                      <Gift className="w-3 h-3" />
                      Free Cocopeat Bonus:
                    </span>
                    <span>+{totalFreeCocopeat} KG FREE</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Delivery:</span>
                  <span className="text-brand-green font-semibold">FREE DELIVERY</span>
                </div>

                <div className="pt-3 border-t border-brand-border flex items-center justify-between text-sm">
                  <span className="font-serif font-bold text-brand-text-primary">Total Payable:</span>
                  <span className="font-serif font-bold text-2xl text-brand-green">
                    ₹{Number(totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Trust Guarantees */}
              <div className="pt-4 border-t border-brand-border/60 flex flex-col gap-2 text-xs text-brand-text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Direct Farm Verification</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Doorstep delivery across Gujarat</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}

export default function PaymentPage() {
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
      <PaymentContent />
    </Suspense>
  );
}
