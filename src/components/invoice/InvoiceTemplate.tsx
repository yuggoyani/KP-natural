"use client";

import React from "react";
import Image from "next/image";
import { OrderRecord, OrderItemRecord } from "@/types/database";
import {
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  Leaf,
  Sparkles,
  ShieldCheck,
  Heart,
  Droplets,
  Sprout,
  CheckCircle2,
} from "lucide-react";

interface InvoiceTemplateProps {
  order: OrderRecord;
  items: OrderItemRecord[];
}

export function InvoiceTemplate({ order, items }: InvoiceTemplateProps) {
  // Format Date (e.g. October 26, 2023 or 30-08-2026)
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "August 30, 2026";

  const customerName = `${order.first_name || ""} ${order.middle_name ? `${order.middle_name} ` : ""}${order.last_name || ""}`.trim() || "Valued Customer";

  // Calculate free cocopeat
  const totalFreeCocopeatKg = items.reduce(
    (acc, item) => acc + (Number(item.free_cocopeat_quantity) || 0),
    0
  );

  const cocopeatValue = totalFreeCocopeatKg * 100; // Rs 100/kg standard price
  const rawSubtotal = items.reduce((sum, item) => sum + Number(item.line_total), 0) + (totalFreeCocopeatKg > 0 ? cocopeatValue : 0);
  const promotionalDiscount = cocopeatValue;
  const grandTotal = Number(order.total_amount);

  return (
    <div
      id="kp-invoice-printable"
      className="w-[800px] min-h-[1130px] bg-[#FAF7F0] text-[#11251B] p-8 box-border relative flex flex-col justify-between font-sans leading-tight select-none"
      style={{
        width: "800px",
        minHeight: "1130px",
        backgroundColor: "#FAF7F0",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* OUTER ELEGANT BORDER */}
      <div className="absolute inset-4 border-2 border-[#0F5E3D] rounded-[24px] pointer-events-none z-0" />

      <div className="relative z-10 flex flex-col justify-between h-full space-y-4">
        {/* ========================================================================= */}
        {/* 1. TOP HEADER SECTION */}
        {/* ========================================================================= */}
        <div>
          <div className="flex items-start justify-between px-4 pt-3">
            {/* Left Spacer for symmetry */}
            <div className="w-[180px]" />

            {/* CENTER: OFFICIAL LOGO */}
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-[#0F5E3D]/30 bg-white shadow-xs">
                <Image
                  src="/images/logo.png"
                  alt="KP Natural Dairy Farm Logo"
                  fill
                  sizes="96px"
                  className="object-contain p-0.5"
                  priority
                />
              </div>
            </div>

            {/* RIGHT: SELLER DETAILS */}
            <div className="w-[240px] text-[10px] text-[#2C3E35] space-y-1 text-left pl-2">
              <div className="flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C99738] shrink-0 mt-0.5" />
                <span>
                  <strong>KP Natural Dairy Farm,</strong>
                  <br />
                  19 Swaminarayan Nagar, Dabholi Circle, Katargam, Surat, Gujarat - 395004
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#C99738] shrink-0" />
                <span>99040 10544</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C99738] shrink-0" />
                <span className="truncate">kpnaturaldairyfarm@gmail.com</span>
              </div>
            </div>
          </div>

          {/* CENTER TITLE & TAGLINE */}
          <div className="text-center mt-2.5 mb-3">
            <h1 className="text-2xl font-serif font-black tracking-tight text-[#0F5E3D]">
              KP NATURAL DAIRY FARM
            </h1>
            <p className="text-[9px] font-bold tracking-[0.25em] text-[#1E3A2B] uppercase mt-0.5">
              PURE FARM PRODUCTS | ORGANIC • NATURAL • SUSTAINABLE
            </p>
          </div>

          {/* INVOICE BANNER WITH LEAFY ACCENTS */}
          <div className="relative mx-4 bg-[#0F5E3D] text-[#FAF7F0] py-2 px-6 rounded-lg text-center shadow-xs overflow-hidden flex items-center justify-between">
            <div className="flex items-center gap-1 opacity-70">
              <Leaf className="w-4 h-4 text-[#C99738]" />
              <Leaf className="w-3 h-3 text-[#FAF7F0] transform rotate-45" />
            </div>

            <span className="font-serif font-black text-xl tracking-[0.2em] uppercase text-white">
              INVOICE
            </span>

            <div className="flex items-center gap-1 opacity-70">
              <Leaf className="w-3 h-3 text-[#FAF7F0] transform -rotate-45" />
              <Leaf className="w-4 h-4 text-[#C99738]" />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. TWO-COLUMN MAIN INVOICE BODY */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-12 gap-4 px-4 items-start">
          {/* ────────────────────────────────────────────────────────── */}
          {/* LEFT COLUMN: BILLED TO & ORDER INFO */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="col-span-6 space-y-3.5">
            {/* CARD 1: BILLED TO */}
            <div className="bg-white/85 rounded-xl p-4 border border-[#0F5E3D]/25 shadow-2xs text-left">
              <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#C99738]/60">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#0F5E3D]">
                  BILLED TO
                </span>
              </div>
              <div className="space-y-1 text-xs text-[#2C3E35]">
                <strong className="block font-bold text-sm text-[#11251B]">
                  {customerName}
                </strong>
                <div className="text-[11px] font-medium text-[#4A5D53]">
                  {order.mobile_number ? `+91 ${order.mobile_number}` : "N/A"}
                </div>
                <div className="text-[11px] leading-relaxed text-[#33463C] pt-0.5">
                  {order.address_line_1}
                  {order.address_line_2 ? `, ${order.address_line_2}` : ""}
                  <br />
                  {order.village_or_area ? `${order.village_or_area}, ` : ""}
                  {order.district_or_city || "Surat"}
                  <br />
                  Gujarat – <strong>{order.pin_code}</strong>
                </div>
              </div>
            </div>

            {/* CARD 2: ORDER INFORMATION */}
            <div className="bg-white/85 rounded-xl p-4 border border-[#0F5E3D]/25 shadow-2xs text-left relative overflow-hidden">
              <div className="flex items-center justify-between pb-1.5 mb-2.5 border-b border-[#C99738]/60">
                <span className="font-serif font-bold text-xs uppercase tracking-wider text-[#0F5E3D]">
                  ORDER INFORMATION
                </span>
                <Leaf className="w-3.5 h-3.5 text-[#C99738]" />
              </div>

              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5A6D63] block">
                    ORDER REFERENCE ID
                  </span>
                  <span className="font-serif font-black text-lg text-[#0F5E3D] tracking-tight block">
                    {order.order_id}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5A6D63] block">
                      INVOICE DATE
                    </span>
                    <span className="font-semibold text-xs text-[#11251B]">
                      {orderDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5A6D63] block">
                      PAYMENT STATUS
                    </span>
                    <span className="font-bold text-xs text-[#0F5E3D] uppercase">
                      PAYMENT VERIFIED
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: PAYMENT VERIFIED BADGE BOX */}
            <div className="bg-[#0F5E3D] text-white rounded-xl p-3.5 shadow-xs flex items-center gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#FAF7F0]" />
              </div>
              <div className="space-y-0.5">
                <span className="font-serif font-bold text-xs tracking-wider uppercase block text-white">
                  ✓ PAYMENT VERIFIED
                </span>
                <p className="text-[10px] text-white/90 leading-snug">
                  Your payment has been successfully verified by KP Natural Dairy Farm.
                </p>
              </div>
            </div>

            {/* THANK YOU APPRECIATION MESSAGE */}
            <div className="px-1 text-left">
              <h4 className="font-serif font-bold text-[11px] uppercase tracking-wider text-[#0F5E3D]">
                THANK YOU FOR CHOOSING KP NATURAL DAIRY FARM.
              </h4>
              <p className="text-[9.5px] text-[#4A5D53] leading-relaxed mt-0.5">
                We sincerely appreciate your trust and support. Together, let's grow naturally and sustainably.
              </p>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────── */}
          {/* RIGHT COLUMN: ORDER DETAILS & PRODUCT TABLE */}
          {/* ────────────────────────────────────────────────────────── */}
          <div className="col-span-6 space-y-3.5">
            {/* TOP META CARD */}
            <div className="bg-white/85 rounded-xl p-3.5 border border-[#0F5E3D]/25 shadow-2xs flex items-center justify-between text-left">
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5A6D63] block">
                  ORDER ID
                </span>
                <span className="font-bold text-xs text-[#11251B]">{order.order_id}</span>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#0F5E3D] block mt-1">
                  INVOICE
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-[#5A6D63] block">
                  DATE
                </span>
                <span className="font-semibold text-xs text-[#11251B]">{orderDate}</span>
              </div>
            </div>

            {/* PRODUCT ITEMS TABLE */}
            <div className="bg-white/90 rounded-xl border border-[#0F5E3D]/25 shadow-2xs overflow-hidden text-left">
              {/* TABLE HEADER WITH GOLD BACKGROUND */}
              <div className="bg-[#E6D7B8] px-3 py-2 grid grid-cols-12 text-[9.5px] font-bold text-[#11251B] uppercase tracking-wider">
                <div className="col-span-6">ITEM</div>
                <div className="col-span-2 text-center">QUANTITY</div>
                <div className="col-span-2 text-right">UNIT PRICE</div>
                <div className="col-span-2 text-right">TOTAL</div>
              </div>

              {/* PRODUCT ROWS */}
              <div className="divide-y divide-[#0F5E3D]/10 text-xs">
                {items.map((item, idx) => (
                  <div key={idx} className="px-3 py-2 grid grid-cols-12 items-center text-[10.5px]">
                    <div className="col-span-6 font-semibold text-[#11251B] uppercase">
                      {item.product_name || "KP Natural Vermicompost"}
                      {item.package_size ? ` | ${item.package_size}` : ""}
                    </div>
                    <div className="col-span-2 text-center font-medium text-[#4A5D53]">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 text-right font-medium text-[#11251B]">
                      ₹{Number(item.unit_price).toLocaleString("en-IN")}
                    </div>
                    <div className="col-span-2 text-right font-bold text-[#11251B]">
                      ₹{Number(item.line_total).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}

                {/* FREE COCOPEAT BONUS ROW (IF PRESENT) */}
                {totalFreeCocopeatKg > 0 && (
                  <>
                    <div className="px-3 py-2 grid grid-cols-12 items-center text-[10.5px] bg-[#FAF7F0]/60">
                      <div className="col-span-6 font-semibold text-[#11251B] uppercase">
                        COCOPEAT | {totalFreeCocopeatKg} KG
                      </div>
                      <div className="col-span-2 text-center font-medium text-[#4A5D53]">
                        1
                      </div>
                      <div className="col-span-2 text-right font-medium text-[#11251B]">
                        ₹{cocopeatValue}
                      </div>
                      <div className="col-span-2 text-right font-bold text-[#11251B]">
                        ₹{cocopeatValue}
                      </div>
                    </div>

                    {/* PROMOTIONAL DISCOUNT DEDUCTION ROW */}
                    <div className="px-3 py-2 grid grid-cols-12 items-center text-[10px] bg-emerald-50/50">
                      <div className="col-span-7 font-bold text-[#0F5E3D] italic">
                        COCOPEAT PROMOTIONAL DISCOUNT
                        <span className="block font-normal text-[9px] text-[#4A5D53]">
                          (Free Cocopeat Offer)
                        </span>
                      </div>
                      <div className="col-span-5 text-right font-bold text-[#0F5E3D]">
                        Discount: - ₹{promotionalDiscount}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* PRICING BREAKDOWN */}
              <div className="p-3 bg-[#FAF7F0]/40 border-t border-[#0F5E3D]/15 space-y-1 text-xs">
                <div className="flex justify-between text-[#33463C]">
                  <span>Subtotal:</span>
                  <span className="font-semibold">₹{rawSubtotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[#5A6D63]">
                  <span>Product Discounts:</span>
                  <span>₹0</span>
                </div>
                {promotionalDiscount > 0 && (
                  <>
                    <div className="flex justify-between text-[#0F5E3D]">
                      <span>Promotional Discounts:</span>
                      <span className="font-semibold">₹{promotionalDiscount.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-[#0F5E3D] font-bold">
                      <span>Final Discount:</span>
                      <span>₹{promotionalDiscount.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* GRAND TOTAL PILL BAR */}
            <div className="bg-[#0F5E3D] text-white rounded-xl p-3.5 shadow-sm flex items-center justify-between">
              <span className="font-serif font-bold text-base tracking-wide text-white">
                Grand Total:
              </span>
              <span className="font-serif font-black text-xl text-white">
                ₹{grandTotal.toLocaleString("en-IN")} INR
              </span>
            </div>

            {/* SAVINGS CALLOUT */}
            {promotionalDiscount > 0 && (
              <div className="text-center font-serif font-bold text-xs tracking-wider text-[#0F5E3D] uppercase">
                YOU SAVED ₹{promotionalDiscount.toLocaleString("en-IN")} ON THIS ORDER!
              </div>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. BOTTOM TRUST BADGES */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-4 gap-2 px-6 pt-1 text-center">
          {/* Badge 1 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-[#0F5E3D]/30 flex items-center justify-center bg-white shadow-2xs mb-1">
              <Sprout className="w-5 h-5 text-[#0F5E3D]" />
            </div>
            <span className="font-bold text-[9.5px] text-[#11251B] uppercase">100% ORGANIC</span>
            <span className="text-[8px] text-[#5A6D63]">Natural Farm Products</span>
          </div>

          {/* Badge 2 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-[#0F5E3D]/30 flex items-center justify-center bg-white shadow-2xs mb-1">
              <Sparkles className="w-5 h-5 text-[#0F5E3D]" />
            </div>
            <span className="font-bold text-[9.5px] text-[#11251B] uppercase">SUSTAINABLE</span>
            <span className="text-[8px] text-[#5A6D63]">Eco-Friendly Practices</span>
          </div>

          {/* Badge 3 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-[#0F5E3D]/30 flex items-center justify-center bg-white shadow-2xs mb-1">
              <ShieldCheck className="w-5 h-5 text-[#0F5E3D]" />
            </div>
            <span className="font-bold text-[9.5px] text-[#11251B] uppercase">CHEMICAL CONSCIOUS</span>
            <span className="text-[8px] text-[#5A6D63]">Better for Soil & Nature</span>
          </div>

          {/* Badge 4 */}
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full border border-[#0F5E3D]/30 flex items-center justify-center bg-white shadow-2xs mb-1">
              <Heart className="w-5 h-5 text-[#0F5E3D]" />
            </div>
            <span className="font-bold text-[9.5px] text-[#11251B] uppercase">QUALITY FOCUSED</span>
            <span className="text-[8px] text-[#5A6D63]">Carefully Packed with Love</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. FOOTER DARK BAR */}
        {/* ========================================================================= */}
        <div className="bg-[#0F5E3D] text-[#FAF7F0] rounded-b-[20px] px-6 py-3 flex items-center justify-between text-left">
          {/* Left: Help Info */}
          <div className="text-[9px] space-y-0.5">
            <strong className="block text-[10.5px] font-serif text-[#C99738]">Need Help?</strong>
            <div className="flex items-center gap-1 text-[#FAF7F0]">
              <span>Customer Care: 📞 99040 10544</span>
            </div>
            <div className="text-[#FAF7F0]/90">
              <span>Email: kpnaturaldairyfarm@gmail.com</span>
            </div>
          </div>

          {/* Center: Gold Cursive "Thank You" */}
          <div
            className="text-xl text-[#C99738] font-serif italic text-center px-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Thank You
          </div>

          {/* Right: Farm Signature */}
          <div className="text-right text-[9px] space-y-0.5">
            <strong className="block text-[10.5px] font-serif tracking-wider text-white">
              KP NATURAL DAIRY FARM
            </strong>
            <span className="text-[8px] text-[#C99738] uppercase tracking-[0.2em] block">
              FROM OUR FARM TO YOUR HOME
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
