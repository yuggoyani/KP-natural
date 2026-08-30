"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { OrderRecord, OrderItemRecord } from "@/types/database";
import { InvoiceTemplate } from "@/components/invoice/InvoiceTemplate";
import { downloadInvoicePdf } from "@/lib/invoiceGenerator";
import { Download, ArrowLeft, Printer, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function InvoicePage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [items, setItems] = useState<OrderItemRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        const data = await res.json();

        if (!res.ok || !data.success || !data.order) {
          setError(data.error || "Order not found");
          return;
        }

        const o = data.order;
        const pStatus = String(o.payment_status || "").toUpperCase();
        const oStatus = String(o.order_status || "").toUpperCase();

        const isVerified =
          pStatus === "PAYMENT_VERIFIED" ||
          pStatus === "VERIFIED" ||
          oStatus === "PAYMENT_VERIFIED" ||
          oStatus === "PROCESSING" ||
          oStatus === "DISPATCHED" ||
          oStatus === "DELIVERED";

        if (!isVerified || oStatus === "CANCELLED") {
          setError(
            "Invoice is available only after payment verification by KP Natural Dairy Farm."
          );
          return;
        }

        setOrder(o);
        setItems(data.items || []);
      } catch (err: any) {
        setError("Failed to load invoice details.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrder();
  }, [orderId]);

  const handleDownload = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      await downloadInvoicePdf(order, items);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="py-24 min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-[#0F5E3D] border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold text-[#11251B]">Loading Invoice...</span>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-20 min-h-screen bg-[#FAF7F0] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-rose-200 text-center shadow-lg space-y-4">
          <ShieldAlert className="w-12 h-12 text-rose-600 mx-auto" />
          <h2 className="font-serif font-bold text-xl text-rose-950">
            Invoice Unavailable
          </h2>
          <p className="text-xs text-rose-800 leading-relaxed">
            {error || "Could not retrieve invoice for this order."}
          </p>
          <div className="pt-3 flex justify-center gap-3">
            <Button variant="primary" size="md" href="/track-order">
              Back to Order Tracking
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-[#EFECE6] min-h-screen flex flex-col items-center print:bg-white print:p-0">
      {/* Top Toolbar (Hidden during print) */}
      <div className="w-[800px] mb-4 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#0F5E3D] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-[#0F5E3D]/30 text-[#0F5E3D] text-xs font-bold shadow-xs hover:bg-[#FAF7F0] transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Invoice</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0F5E3D] hover:bg-[#0A472E] text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02]"
          >
            {isDownloading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Invoice PDF</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RENDERED INVOICE TEMPLATE */}
      <div className="shadow-2xl rounded-[24px] overflow-hidden print:shadow-none print:rounded-none">
        <InvoiceTemplate order={order} items={items} />
      </div>
    </div>
  );
}
