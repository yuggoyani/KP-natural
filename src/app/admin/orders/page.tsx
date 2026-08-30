"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Filter,
  RefreshCw,
  LogOut,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Package,
  XCircle,
  Eye,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { OrderRecord, AdminOrderStats, OrderStatus, PaymentStatus } from "@/types/database";

export default function AdminOrdersDashboardPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [adminEmail, setAdminEmail] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState<string>("");
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL");
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("NEWEST");

  const fetchOrders = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.set("search", search);
      if (paymentFilter !== "ALL") queryParams.set("paymentStatus", paymentFilter);
      if (orderFilter !== "ALL") queryParams.set("orderStatus", orderFilter);
      if (sortBy !== "NEWEST") queryParams.set("sortBy", sortBy);

      const res = await fetch(`/api/admin/orders?${queryParams.toString()}`);

      if (res.status === 401) {
        // Unauthorized -> redirect to login
        router.push("/admin/login");
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Failed to load orders");
        return;
      }

      setOrders(data.orders || []);
      setStats(data.stats || null);
      if (data.adminEmail) setAdminEmail(data.adminEmail);
    } catch (err: any) {
      console.error("Admin fetch orders error:", err);
      setError("Network error fetching orders.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search, paymentFilter, orderFilter, sortBy, router]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // Ignore
    }
    localStorage.removeItem("kp_admin_logged_in");
    localStorage.removeItem("kp_admin_token");
    localStorage.removeItem("kp_admin_email");
    router.push("/admin/login");
  };

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
          <Package className="w-3 h-3 text-blue-600" />
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
          <Zap className="w-3 h-3 text-amber-600" />
          <span>Needs Verification</span>
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
    <div className="py-8 sm:py-12 bg-brand-ivory min-h-screen text-left">
      <Container size="xl">
        {/* TOP ADMIN HEADER BAR */}
        <div className="rounded-farm-xl bg-[#FCF9F2] p-5 sm:p-6 border border-brand-border shadow-subtle mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 shrink-0">
              <Image
                src="/images/logo.png"
                alt="Logo"
                fill
                sizes="40px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-green block">
                KP Natural Dairy Farm
              </span>
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-brand-text-primary leading-none">
                Admin Order Management
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            {adminEmail && (
              <div className="text-xs text-brand-text-secondary flex items-center gap-1.5 px-3 py-1.5 rounded-farm bg-brand-ivory-300 border border-brand-border">
                <User className="w-3.5 h-3.5 text-brand-green" />
                <span>{adminEmail}</span>
              </div>
            )}

            <button
              onClick={() => fetchOrders(true)}
              className="p-2 rounded-farm bg-white border border-brand-border text-brand-text-secondary hover:text-brand-green transition-colors"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-brand-green" : ""}`} />
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-farm bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
            <div className="rounded-farm-lg bg-[#FCF9F2] p-4 border border-brand-border shadow-xs">
              <span className="text-[11px] font-semibold text-brand-text-muted uppercase tracking-wider block mb-1">
                Total Orders
              </span>
              <span className="font-serif font-bold text-2xl text-brand-text-primary">
                {stats.totalOrders}
              </span>
            </div>

            <div className="rounded-farm-lg bg-amber-50/70 p-4 border border-amber-200 shadow-xs">
              <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block mb-1">
                Needs Verification
              </span>
              <span className="font-serif font-bold text-2xl text-amber-900">
                {stats.paymentSubmitted}
              </span>
            </div>

            <div className="rounded-farm-lg bg-emerald-50/70 p-4 border border-emerald-200 shadow-xs">
              <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block mb-1">
                Verified / Processing
              </span>
              <span className="font-serif font-bold text-2xl text-emerald-900">
                {stats.paymentVerified}
              </span>
            </div>

            <div className="rounded-farm-lg bg-indigo-50/70 p-4 border border-indigo-200 shadow-xs">
              <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wider block mb-1">
                Dispatched
              </span>
              <span className="font-serif font-bold text-2xl text-indigo-900">
                {stats.dispatched}
              </span>
            </div>

            <div className="rounded-farm-lg bg-gray-50 p-4 border border-gray-200 shadow-xs">
              <span className="text-[11px] font-semibold text-gray-600 uppercase tracking-wider block mb-1">
                Pending Payment
              </span>
              <span className="font-serif font-bold text-2xl text-gray-800">
                {stats.pendingPayment}
              </span>
            </div>

            <div className="rounded-farm-lg bg-[#FAF4E6] p-4 border border-brand-green/30 shadow-xs">
              <span className="text-[11px] font-semibold text-brand-green uppercase tracking-wider block mb-1">
                Verified Revenue
              </span>
              <span className="font-serif font-bold text-xl text-brand-green">
                ₹{stats.totalRevenue.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        )}

        {/* SEARCH, FILTER & SORT TOOLBAR */}
        <div className="rounded-farm-xl bg-[#FCF9F2] p-4 sm:p-5 border border-brand-border shadow-subtle mb-6 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-brand-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Order ID, Customer Name, Mobile, or UTR..."
              className="w-full h-11 pl-10 pr-4 rounded-farm bg-white border border-brand-border text-xs sm:text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-brand-text-muted hover:text-brand-text-primary"
              >
                Clear
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="h-11 px-3 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="ALL">All Payment Statuses</option>
              <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
              <option value="PAYMENT_VERIFIED">Payment Verified</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="REJECTED">Payment Rejected</option>
            </select>

            <select
              value={orderFilter}
              onChange={(e) => setOrderFilter(e.target.value)}
              className="h-11 px-3 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="ALL">All Order Statuses</option>
              <option value="PAYMENT_VERIFICATION">Needs Verification</option>
              <option value="PAYMENT_VERIFIED">Payment Verified</option>
              <option value="PROCESSING">Processing & Packaging</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="DELIVERED">Delivered</option>
              <option value="AWAITING_PAYMENT">Awaiting Payment</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-3 rounded-farm bg-white border border-brand-border text-xs font-semibold text-brand-text-primary focus:outline-none focus:ring-2 focus:ring-brand-green"
            >
              <option value="NEWEST">Newest First</option>
              <option value="OLDEST">Oldest First</option>
              <option value="AMOUNT_HIGH">Highest Amount</option>
              <option value="AMOUNT_LOW">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* ORDERS LISTING TABLE & MOBILE CARDS */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold text-brand-text-secondary">Loading orders...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-farm-xl bg-[#FCF9F2] p-12 border border-brand-border text-center">
            <ShoppingBag className="w-12 h-12 text-brand-green mx-auto mb-3" />
            <h3 className="font-serif font-bold text-lg text-brand-text-primary mb-1">
              No Orders Found
            </h3>
            <p className="text-xs text-brand-text-secondary">
              No orders matched your search criteria or filter options.
            </p>
          </div>
        ) : (
          <>
            {/* DESKTOP TABLE VIEW */}
            <div className="hidden lg:block rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-elevated overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F5EEDF] border-b border-brand-border text-brand-text-muted font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Order ID & Date</th>
                    <th className="py-3.5 px-4">Customer & Contact</th>
                    <th className="py-3.5 px-4">Gujarat Location</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4">Order Status</th>
                    <th className="py-3.5 px-4">UTR Reference</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border/60">
                  {orders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-brand-ivory/50 transition-colors">
                      {/* Order ID */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/orders/${order.order_id}`}
                          className="font-serif font-bold text-sm text-brand-green hover:underline block"
                        >
                          {order.order_id}
                        </Link>
                        <span className="text-[11px] text-brand-text-muted block">
                          {order.created_at
                            ? new Date(order.created_at).toLocaleDateString("en-IN", {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "N/A"}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-brand-text-primary block">
                          {order.first_name} {order.last_name}
                        </span>
                        <span className="text-[11px] text-brand-text-muted block">
                          +91 {order.mobile_number}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <span className="text-brand-text-primary block truncate max-w-[140px]">
                          {order.district_or_city}
                        </span>
                        <span className="text-[11px] text-brand-text-muted block truncate max-w-[140px]">
                          {order.village_or_area} ({order.pin_code})
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-serif font-bold text-sm text-brand-text-primary">
                        ₹{Number(order.total_amount).toLocaleString("en-IN")}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        {getPaymentStatusBadge(order.payment_status)}
                      </td>

                      {/* Order Status */}
                      <td className="py-3.5 px-4">
                        {getOrderStatusBadge(order.order_status)}
                      </td>

                      {/* UTR */}
                      <td className="py-3.5 px-4">
                        {order.utr_number ? (
                          <span className="font-mono text-[11px] font-semibold text-brand-text-primary block bg-white px-2 py-0.5 rounded border border-brand-border w-fit">
                            {order.utr_number}
                          </span>
                        ) : (
                          <span className="text-[11px] text-brand-text-muted italic">None</span>
                        )}
                      </td>

                      {/* Action Button: Manage Order */}
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href={`/admin/orders/${order.order_id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-farm bg-brand-green hover:bg-[#0A472E] text-brand-ivory text-xs font-semibold shadow-xs transition-colors"
                        >
                          <span>Manage Order</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE CARD VIEW */}
            <div className="lg:hidden flex flex-col gap-4">
              {orders.map((order) => (
                <div
                  key={order.order_id}
                  className="rounded-farm-xl bg-[#FCF9F2] p-5 border border-brand-border shadow-subtle flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-brand-border/60">
                    <Link
                      href={`/admin/orders/${order.order_id}`}
                      className="font-serif font-bold text-base text-brand-green hover:underline"
                    >
                      {order.order_id}
                    </Link>
                    <span className="font-serif font-bold text-lg text-brand-text-primary">
                      ₹{Number(order.total_amount).toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Customer</span>
                      <span className="font-semibold text-brand-text-primary">{order.first_name} {order.last_name}</span>
                      <span className="text-brand-text-muted block">+91 {order.mobile_number}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-brand-text-muted block">Destination</span>
                      <span className="text-brand-text-primary">{order.district_or_city}</span>
                      <span className="text-brand-text-muted block">{order.pin_code}</span>
                    </div>
                  </div>

                  {order.utr_number && (
                    <div className="text-xs">
                      <span className="text-[10px] uppercase font-bold text-brand-text-muted block">UTR Number</span>
                      <span className="font-mono font-semibold text-brand-text-primary">{order.utr_number}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-brand-border/50 text-xs">
                    <div className="flex flex-col gap-1">
                      {getPaymentStatusBadge(order.payment_status)}
                      {getOrderStatusBadge(order.order_status)}
                    </div>

                    <Link
                      href={`/admin/orders/${order.order_id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-farm bg-brand-green text-brand-ivory text-xs font-semibold"
                    >
                      <span>Manage Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  );
}
