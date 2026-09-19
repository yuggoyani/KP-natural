"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Trash2,
  AlertCircle,
  ExternalLink,
  Laptop,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export interface LocalOrderItem {
  packId: string;
  name: string;
  weightKg: number;
  quantity: number;
  price: number;
  freeCocopeatKg: number;
}

export interface LocalOrderHistoryRecord {
  orderId: string;
  createdAt: string;
  customerName: string;
  mobileNumber: string;
  totalAmount: number;
  subtotal?: number;
  deliveryCharge?: number;
  orderStatus: string;
  paymentStatus: string;
  itemCount: number;
  summary: string;
  districtOrCity: string;
  villageOrArea: string;
  pinCode: string;
  addressLine1?: string;
  utrNumber?: string;
  items?: LocalOrderItem[];
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<LocalOrderHistoryRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Load locally stored order history on mount
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem("kp_natural_order_history");
      if (historyStr) {
        const parsed = JSON.parse(historyStr);
        if (Array.isArray(parsed)) {
          setOrders(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to read local order history:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Clear local order history handler
  const handleClearHistory = () => {
    try {
      localStorage.removeItem("kp_natural_order_history");
      setOrders([]);
      setShowClearConfirm(false);
    } catch (e) {
      console.error("Failed to clear local order history:", e);
    }
  };

  // Status badge styling helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return {
          label: "Delivered",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "DISPATCHED":
      case "IN_TRANSIT":
        return {
          label: "Dispatched",
          className: "bg-sky-50 text-sky-700 border-sky-200",
          icon: <Truck className="w-3.5 h-3.5" />,
        };
      case "PROCESSING":
      case "PAYMENT_VERIFIED":
        return {
          label: "Processing",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Package className="w-3.5 h-3.5" />,
        };
      case "PAYMENT_SUBMITTED":
      case "PAYMENT_VERIFICATION":
        return {
          label: "Payment Review",
          className: "bg-purple-50 text-purple-700 border-purple-200",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case "CANCELLED":
      case "PAYMENT_REJECTED":
        return {
          label: "Cancelled",
          className: "bg-rose-50 text-rose-700 border-rose-200",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "PENDING":
      case "AWAITING_PAYMENT":
      default:
        return {
          label: "Awaiting Payment",
          className: "bg-amber-50 text-amber-700 border-amber-200",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
      case "PAYMENT_VERIFIED":
        return {
          label: "Payment Verified",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "PAYMENT_SUBMITTED":
        return {
          label: "Payment Submitted",
          className: "bg-purple-50 text-purple-700 border-purple-200",
        };
      case "REJECTED":
      case "PAYMENT_REJECTED":
        return {
          label: "Payment Rejected",
          className: "bg-rose-50 text-rose-700 border-rose-200",
        };
      case "PENDING":
      default:
        return {
          label: "Payment Pending",
          className: "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  };

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return "Recent Order";
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recent Order";
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

  return (
    <div className="py-6 sm:py-10 lg:py-16 bg-brand-ivory min-h-[85vh]">
      <Container size="lg">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8 text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-green/10 text-brand-green text-xs font-semibold uppercase tracking-wider mb-2">
              <Laptop className="w-3.5 h-3.5" />
              <span>Device History</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-text-primary tracking-tight">
              Your Order History
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-secondary mt-1">
              Orders placed from this browser appear here automatically.
            </p>
          </div>

          {orders.length > 0 && (
            <div className="flex items-center gap-3 self-start sm:self-auto">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-farm border border-brand-border text-xs font-medium text-brand-text-secondary hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50/50 transition-colors"
                title="Clear local order history on this device"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear History</span>
              </button>
            </div>
          )}
        </div>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="flex flex-col items-center text-center p-8 sm:p-14 rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle max-w-xl mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text-primary mb-3">
              No orders on this device yet
            </h2>

            <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed mb-8 max-w-md">
              Orders placed from this browser will appear here automatically.
            </p>

            <Button
              variant="primary"
              size="lg"
              href="/#vermicompost-showcase"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              SHOP VERMICOMPOST
            </Button>
          </div>
        ) : (
          /* ORDERS LIST */
          <div className="flex flex-col gap-5 sm:gap-6">
            {orders.map((record) => {
              const statusBadge = getStatusBadge(record.orderStatus);
              const paymentBadge = getPaymentBadge(record.paymentStatus);
              const isExpanded = expandedOrderId === record.orderId;

              return (
                <div
                  key={record.orderId}
                  className="rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle overflow-hidden text-left transition-all"
                >
                  {/* ORDER CARD HEADER */}
                  <div className="p-4 sm:p-6 bg-white/60 border-b border-brand-border/60">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      {/* Left: ID & Date */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-farm bg-brand-green/10 text-brand-green flex items-center justify-center font-mono font-bold text-sm shrink-0 border border-brand-green/20">
                          #{record.orderId}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif text-base sm:text-lg font-bold text-brand-text-primary">
                              Order #{record.orderId}
                            </span>
                          </div>
                          <span className="text-xs text-brand-text-muted block">
                            Placed on {formatDate(record.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Right: Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge.className}`}
                        >
                          {statusBadge.icon}
                          <span>{statusBadge.label}</span>
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${paymentBadge.className}`}
                        >
                          {paymentBadge.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ORDER SUMMARY BODY */}
                  <div className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pb-4 sm:pb-5 border-b border-brand-border/50">
                      {/* Products Summary */}
                      <div className="md:col-span-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                          Items Summary
                        </span>
                        <p className="text-sm font-medium text-brand-text-primary mb-1">
                          {record.summary || `${record.itemCount || 1} item(s) ordered`}
                        </p>
                        {record.items && record.items.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {record.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-xs text-brand-text-secondary"
                              >
                                <span>
                                  {item.quantity} × {item.name} ({item.weightKg} KG)
                                </span>
                                <span className="font-medium text-brand-text-primary">
                                  ₹{item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Financials & Destination */}
                      <div className="bg-white/80 p-3.5 rounded-farm border border-brand-border/60 flex flex-col justify-between">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-brand-text-muted block mb-1">
                            Delivery Destination
                          </span>
                          <p className="text-xs font-medium text-brand-text-primary truncate">
                            {record.villageOrArea ? `${record.villageOrArea}, ` : ""}
                            {record.districtOrCity}, Gujarat
                          </p>
                          <p className="text-[11px] text-brand-text-muted">
                            PIN: {record.pinCode}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-brand-border/40 flex items-center justify-between">
                          <span className="text-xs font-medium text-brand-text-secondary">
                            Total Payable:
                          </span>
                          <span className="font-serif text-base font-bold text-brand-green">
                            ₹{record.totalAmount}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="pt-4 flex flex-wrap items-center justify-between gap-3">
                      {/* Left: Customer Info */}
                      <div className="flex items-center gap-3 text-xs text-brand-text-muted">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-brand-green" />
                          <span>{record.customerName || "Customer"}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-brand-green" />
                          <span>+91 {record.mobileNumber}</span>
                        </span>
                      </div>

                      {/* Right: CTA to Track Order */}
                      <div className="flex items-center gap-2.5">
                        {record.items && record.items.length > 0 && (
                          <button
                            onClick={() =>
                              setExpandedOrderId(isExpanded ? null : record.orderId)
                            }
                            className="text-xs font-medium text-brand-text-secondary hover:text-brand-green flex items-center gap-1 py-1.5 px-2.5 rounded hover:bg-brand-border/20 transition-colors"
                          >
                            <span>{isExpanded ? "Hide Details" : "View Breakdown"}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        <Link
                          href={`/track-order?orderId=${record.orderId}&phone=${record.mobileNumber}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-farm bg-brand-green text-white text-xs font-semibold hover:bg-brand-green-hover transition-colors shadow-subtle"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Track Order</span>
                        </Link>
                      </div>
                    </div>

                    {/* EXPANDED ITEM BREAKDOWN */}
                    {isExpanded && record.items && record.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-brand-border/60 bg-white/50 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 p-4 sm:p-6">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-brand-text-muted mb-3">
                          Itemized Order Breakdown
                        </h4>
                        <div className="space-y-2">
                          {record.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs py-1 border-b border-brand-border/30 last:border-0"
                            >
                              <div>
                                <span className="font-semibold text-brand-text-primary">
                                  {item.name}
                                </span>
                                <span className="text-brand-text-muted ml-2">
                                  ({item.weightKg} KG Pack) × {item.quantity}
                                </span>
                                {item.freeCocopeatKg > 0 && (
                                  <span className="ml-2 inline-flex items-center gap-0.5 text-[10px] text-brand-green font-medium">
                                    <Gift className="w-2.5 h-2.5" />
                                    +{item.freeCocopeatKg * item.quantity} KG Cocopeat FREE
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-bold text-brand-text-primary">
                                ₹{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {record.addressLine1 && (
                          <div className="mt-3 pt-3 border-t border-brand-border/40 text-xs text-brand-text-secondary flex items-start gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-brand-green shrink-0 mt-0.5" />
                            <span>
                              <strong>Full Address:</strong> {record.addressLine1},{" "}
                              {record.villageOrArea}, {record.districtOrCity}, Gujarat -{" "}
                              {record.pinCode}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CLEAR HISTORY CONFIRMATION MODAL */}
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FCF9F2] rounded-farm-xl border border-brand-border shadow-farm max-w-md w-full p-6 text-left">
              <div className="flex items-center gap-3 text-rose-600 mb-3">
                <AlertCircle className="w-6 h-6 shrink-0" />
                <h3 className="font-serif text-lg font-bold text-brand-text-primary">
                  Clear Order History?
                </h3>
              </div>
              <p className="text-sm text-brand-text-secondary leading-relaxed mb-6">
                This will remove the saved order references from this browser. Your actual
                orders in the KP Natural Dairy Farm system remain safe and can still be tracked
                anytime using the <strong>Track Order</strong> page.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 rounded-farm border border-brand-border text-xs font-medium text-brand-text-secondary hover:bg-brand-border/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearHistory}
                  className="px-4 py-2 rounded-farm bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors"
                >
                  Clear from this device
                </button>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
}
