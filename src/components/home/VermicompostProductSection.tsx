"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Truck,
  Gift,
  ShieldCheck,
  Leaf,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { VermicompostPack } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const PRODUCT_PACKS: VermicompostPack[] = [
  {
    id: "vermicompost-1kg",
    name: "1 KG Pack",
    weightKg: 1,
    price: 140,
    freeCocopeatKg: 0,
    freeDelivery: false,
    badge: "Standard Pack",
  },
  {
    id: "vermicompost-5kg",
    name: "5 KG Pack",
    weightKg: 5,
    price: 649,
    freeCocopeatKg: 1,
    freeDelivery: true,
    badge: "+ 1 KG Cocopeat FREE",
  },
  {
    id: "vermicompost-10kg",
    name: "10 KG Pack",
    weightKg: 10,
    price: 1199,
    freeCocopeatKg: 2,
    freeDelivery: true,
    badge: "+ 2 KG Cocopeat FREE",
    isPopular: true,
  },
  {
    id: "vermicompost-30kg",
    name: "30 KG Pack",
    weightKg: 30,
    price: 2199,
    freeCocopeatKg: 6,
    freeDelivery: true,
    badge: "+ 6 KG Cocopeat FREE",
  },
];

const BENEFIT_HIGHLIGHTS = [
  "Supports healthy soil biology and natural aeration",
  "Balanced plant nutrition with organic microbial activity",
  "Suitable for home gardens, potted plants, and agricultural care",
];

export function VermicompostProductSection() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<VermicompostPack>(PRODUCT_PACKS[2]); // Default to 10 KG
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart(selectedPack, quantity);
    const cocopeatText =
      selectedPack.freeCocopeatKg > 0
        ? ` with ${selectedPack.freeCocopeatKg * quantity} KG Free Cocopeat`
        : "";
    showToast(
      `Added to Cart: ${quantity} × ${selectedPack.name} (₹${(
        selectedPack.price * quantity
      ).toLocaleString("en-IN")})${cocopeatText}`
    );
  };

  const handleBuyNow = () => {
    addToCart(selectedPack, quantity);
    router.push("/cart");
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const subtotalPrice = selectedPack.price * quantity;
  const deliveryCharge = selectedPack.freeDelivery ? 0 : 60;
  const finalOrderTotal = subtotalPrice + deliveryCharge;
  const totalFreeCocopeat = selectedPack.freeCocopeatKg * quantity;

  return (
    <section
      id="vermicompost-showcase"
      className="py-12 sm:py-16 lg:py-20 bg-brand-ivory border-t border-brand-border/70 relative scroll-mt-14 sm:scroll-mt-20"
      aria-label="Vermicompost Product Showcase and Purchase Selection"
    >
      <Container size="lg">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 sm:mb-4 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
            <span>VERMICOMPOST FERTILISER</span>
          </div>

          {/* Main Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-3 sm:mb-4 text-balance">
            Give Your Soil The Care It Deserves.
          </h2>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base md:text-lg text-brand-text-secondary leading-relaxed font-normal max-w-2xl text-balance">
            KP Natural Vermicompost is a nutrient-dense organic fertilizer formulated to nourish soil biology, enhance microbial activity, and provide sustained nourishment for vigorous plant and crop development.
          </p>
        </div>

        {/* Floating Success / Action Toast */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center justify-center sm:justify-start gap-2.5 px-4 sm:px-5 py-3 sm:py-3.5 rounded-farm bg-brand-forest text-brand-ivory shadow-elevated border border-brand-green/50 text-xs sm:text-sm font-medium animate-fade-in"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* MAIN 2-COLUMN PRODUCT SHOWCASE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-14 items-start">
          
          {/* LEFT SIDE: Official Vermicompost Product Visual */}
          <div className="w-full lg:col-span-5 flex flex-col items-center relative lg:sticky lg:top-28 self-start mb-4 lg:mb-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[420px] rounded-farm-xl bg-[#FCF9F2] p-3.5 sm:p-5 border border-brand-border shadow-elevated transition-all duration-300 hover:shadow-2xl">
              
              {/* Product Badge Tag */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-brand-green text-xs font-semibold uppercase tracking-wider">
                  <Leaf className="w-3.5 h-3.5 shrink-0" />
                  <span>Official Artwork</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-green text-brand-ivory text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55E59C] animate-pulse" />
                  Available Now
                </span>
              </div>

              {/* Exact Artwork Presentation with 100% Fidelity */}
              <div className="relative w-full aspect-[1/1.414] rounded-farm overflow-hidden border border-brand-border/70 bg-white shadow-xs">
                <Image
                  src="/images/vermicompost-label.png"
                  alt="KP Natural Vermicompost Organic Fertilizer Official Packaging and Label Reference"
                  fill
                  priority
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 420px"
                  className="object-contain"
                  unoptimized
                />
              </div>

              {/* Caption Line */}
              <div className="mt-3.5 pt-2.5 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-secondary">
                <span className="font-semibold text-brand-text-primary text-[11px] sm:text-xs">
                  100% Farm-Crafted Formulation
                </span>
                <span className="text-brand-green font-medium text-[11px] sm:text-xs">
                  Direct From Farm
                </span>
              </div>
            </div>

            {/* Quick Assurance Pills */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-brand-text-secondary">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                <span>Clean Natural Sourcing</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-brand-green shrink-0" />
                <span>Carefully Packaged</span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Product Information & Purchase Selection */}
          <div className="lg:col-span-7 flex flex-col items-start text-left w-full">
            
            {/* Availability Badge & Category */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="available" size="sm" dot>
                AVAILABLE NOW
              </Badge>
              <Badge variant="gold" size="sm">
                Soil Nutrition Specialist
              </Badge>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-bold text-brand-text-primary tracking-tight leading-[1.15] mb-2.5 sm:mb-3">
              KP Natural Vermicompost Fertiliser
            </h1>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed mb-5 sm:mb-6 font-normal">
              A premium, high-vitality organic soil conditioner crafted naturally from rich farm organic matter. Designed to improve soil structure, stimulate root development, and provide balanced long-term plant nutrition.
            </p>

            {/* Benefit Highlights */}
            <div className="w-full bg-[#FCF9F2] rounded-farm p-3.5 sm:p-5 border border-brand-border/70 mb-6 sm:mb-8 space-y-2 sm:space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green mb-1.5 sm:mb-2">
                Key Soil Benefits:
              </h4>
              {BENEFIT_HIGHLIGHTS.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-brand-text-primary">
                  <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {/* 1. PACK SIZE SELECTION */}
            <div className="w-full mb-6 sm:mb-8">
              <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-text-primary">
                  Select Pack Size:
                </label>
                <span className="text-xs text-brand-text-muted">
                  Select one option
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {PRODUCT_PACKS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={cn(
                        "relative flex flex-col justify-between p-3.5 sm:p-4 rounded-farm cursor-pointer transition-all duration-200 border-2 select-none",
                        isSelected
                          ? "bg-brand-green-50/70 border-brand-green shadow-xs ring-1 ring-brand-green/30"
                          : "bg-[#FCF9F2] border-brand-border hover:border-brand-green/40 hover:bg-brand-ivory-300/40"
                      )}
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedPack(pack);
                        }
                      }}
                    >
                      {/* Popular / Best Offer Tag */}
                      {pack.isPopular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-brand-gold text-brand-forest text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Most Popular
                        </span>
                      )}

                      <div>
                        {/* Top: Pack weight & Price */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-serif font-bold text-base sm:text-lg text-brand-text-primary">
                            {pack.name}
                          </span>
                          <span className="font-serif font-bold text-base sm:text-lg text-brand-green">
                            ₹{pack.price.toLocaleString("en-IN")}
                          </span>
                        </div>

                        {/* Special Offer or Details */}
                        {pack.freeCocopeatKg > 0 ? (
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-green">
                            <Gift className="w-3.5 h-3.5 shrink-0" />
                            <span>+ {pack.freeCocopeatKg} KG Cocopeat FREE</span>
                          </div>
                        ) : (
                          <div className="text-xs text-brand-text-muted">
                            Standard Vermicompost Pack
                          </div>
                        )}
                      </div>

                      {/* Delivery note */}
                      <div className="mt-2.5 pt-2 border-t border-brand-border/50 flex items-center justify-between text-[11px]">
                        <span className={pack.freeDelivery ? "text-brand-green font-medium" : "text-brand-text-muted"}>
                          {pack.freeDelivery ? "✓ FREE DELIVERY" : "+ ₹60 Delivery Charge"}
                        </span>
                        <div
                          className={cn(
                            "w-4 h-4 rounded-full border flex items-center justify-center transition-colors",
                            isSelected
                              ? "border-brand-green bg-brand-green text-brand-ivory"
                              : "border-brand-border bg-white"
                          )}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. QUANTITY SELECTOR */}
            <div className="w-full mb-6 sm:mb-8">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-text-primary block mb-2 sm:mb-3">
                Order Quantity:
              </label>

              <div className="flex items-center gap-3 sm:gap-4">
                <div className="inline-flex items-center rounded-farm border border-brand-border bg-[#FCF9F2] p-1 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-brand-text-primary hover:bg-brand-ivory-300 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-12 text-center font-serif font-bold text-lg text-brand-text-primary select-none">
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQuantityChange(1)}
                    className="w-11 h-11 rounded-lg flex items-center justify-center text-brand-text-primary hover:bg-brand-ivory-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <span className="text-xs text-brand-text-muted">
                  Total Weight: <strong className="text-brand-text-primary">{selectedPack.weightKg * quantity} KG</strong>
                </span>
              </div>
            </div>

            {/* 3. DYNAMIC ORDER SUMMARY BOX */}
            <div className="w-full bg-[#FAF5E8] rounded-farm-lg p-4 sm:p-5 border border-brand-border/80 mb-6 sm:mb-8">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-text-primary mb-2.5 pb-2 border-b border-brand-border/60">
                ORDER SUMMARY
              </h4>

              <div className="space-y-2 text-xs sm:text-sm text-brand-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Selected Pack:</span>
                  <span className="font-semibold text-brand-text-primary text-right">
                    {quantity} × {selectedPack.name} ({selectedPack.weightKg * quantity} KG)
                  </span>
                </div>

                {totalFreeCocopeat > 0 ? (
                  <div className="flex items-center justify-between text-brand-green font-medium">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      Free Cocopeat Bonus:
                    </span>
                    <span className="font-semibold">+{totalFreeCocopeat} KG FREE</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-brand-text-muted text-xs">
                    <span>Free Cocopeat:</span>
                    <span>Available on 5 KG, 10 KG & 30 KG packs</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Delivery:</span>
                  <span className={selectedPack.freeDelivery ? "text-brand-green font-semibold" : "text-brand-text-primary font-semibold"}>
                    {selectedPack.freeDelivery ? "FREE DELIVERY" : "₹60 Delivery Charge"}
                  </span>
                </div>

                <div className="pt-2.5 mt-2 border-t border-brand-border/80 flex items-center justify-between">
                  <span className="font-serif font-bold text-base sm:text-lg text-brand-text-primary">
                    TOTAL:
                  </span>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-brand-green">
                    ₹{finalOrderTotal.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. PURCHASE ACTIONS: ADD TO CART & BUY NOW */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAddToCart}
                icon={<ShoppingBag className="w-5 h-5" />}
                className="flex-1 text-center justify-center py-3.5 min-h-[48px]"
              >
                ADD TO CART
              </Button>

              <Button
                variant="secondary"
                size="lg"
                onClick={handleBuyNow}
                className="flex-1 text-center justify-center py-3.5 min-h-[48px] font-semibold"
              >
                BUY NOW
              </Button>
            </div>

            {/* Note regarding future checkout */}
            <p className="mt-3 text-[11px] text-brand-text-muted text-center sm:text-left w-full">
              ✓ Fast doorstep farm dispatch • Transparent packaging • Customer support
            </p>

          </div>

        </div>
      </Container>
    </section>
  );
}
