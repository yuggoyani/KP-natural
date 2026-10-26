"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  Sprout,
  Check,
  Droplets,
  Wind,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ProductPack } from "@/types/product";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

import { COCOPEAT_PACKS } from "@/lib/serverPricing";

const COCOPEAT_BENEFITS = [
  "High moisture retention — holds up to 8-10x its dry weight in water",
  "Exceptional aeration prevents root suffocation and promotes vigorous root growth",
  "100% organic, triple-washed, low EC, and chemical-free coconut coir medium",
  "Perfect for seedling trays, indoor potted plants, balcony pots & terrace gardening",
];

export function CocopeatProductSection() {
  const router = useRouter();
  const [selectedPack, setSelectedPack] = useState<ProductPack>(COCOPEAT_PACKS[0]); // Default to 1 KG
  const [quantity, setQuantity] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { addToCart } = useCart();

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    addToCart(selectedPack, quantity);
    showToast(
      `Added to Cart: ${quantity} × ${selectedPack.name} (₹${(
        selectedPack.price * quantity
      ).toLocaleString("en-IN")})`
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
  const totalWeight = selectedPack.weightKg * quantity;

  return (
    <section
      id="cocopeat-showcase"
      className="py-12 sm:py-16 lg:py-20 bg-[#FAF5E8] border-t border-brand-border/70 relative scroll-mt-14 sm:scroll-mt-20"
      aria-label="KP Natural Cocopeat Product Showcase and Purchase Selection"
    >
      <Container size="lg">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 sm:mb-4 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <Sprout className="w-3.5 h-3.5 text-brand-green" />
            <span>ORGANIC COCOPEAT MEDIUM</span>
          </div>

          {/* Main Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-3 sm:mb-4 text-balance">
            Optimal Moisture. Thriving Roots.
          </h2>

          {/* Supporting Description */}
          <p className="text-sm sm:text-base md:text-lg text-brand-text-secondary leading-relaxed font-normal max-w-2xl text-balance">
            KP Natural Cocopeat is an eco-friendly organic growing medium processed from premium coconut husk fibres. Designed to enhance soil porosity, regulate moisture, and support delicate roots.
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
          
          {/* LEFT SIDE: Official Cocopeat Product Packaging Visual */}
          <div className="w-full lg:col-span-5 flex flex-col items-center relative lg:sticky lg:top-28 self-start mb-4 lg:mb-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[420px] rounded-farm-xl bg-[#FCF9F2] p-3.5 sm:p-5 border border-brand-border shadow-elevated transition-all duration-300 hover:shadow-2xl">
              
              {/* Product Badge Tag */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-1.5 text-brand-green text-xs font-semibold uppercase tracking-wider">
                  <Sprout className="w-3.5 h-3.5 shrink-0" />
                  <span>100% Organic Medium</span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-green text-brand-ivory text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#55E59C] animate-pulse" />
                  Available Now
                </span>
              </div>

              {/* Exact Artwork Presentation with High Resolution Photo */}
              <div className="relative w-full aspect-[3/4] rounded-farm overflow-hidden border border-brand-border/70 bg-[#F4EFE6] shadow-xs">
                <Image
                  src="/images/cocopeat-packaging.jpg"
                  alt="KP Natural Cocopeat Organic Growing Medium Packaging"
                  fill
                  priority
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 420px"
                  className="object-cover"
                />
              </div>

              {/* Caption Line */}
              <div className="mt-3.5 pt-2.5 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-secondary">
                <span className="font-semibold text-brand-text-primary text-[11px] sm:text-xs">
                  Washed & Naturally Dried
                </span>
                <span className="text-brand-green font-medium text-[11px] sm:text-xs">
                  ₹80 / 1 KG Pack
                </span>
              </div>
            </div>

            {/* Quick Assurance Pills */}
            <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs text-brand-text-secondary">
              <span className="flex items-center gap-1">
                <Droplets className="w-4 h-4 text-brand-green shrink-0" />
                <span>Moisture Retaining</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Wind className="w-4 h-4 text-brand-green shrink-0" />
                <span>Maximum Aeration</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4 text-brand-green shrink-0" />
                <span>Surat: Free Delivery</span>
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Product Information & Purchase Selection */}
          <div className="lg:col-span-7 flex flex-col items-start text-left w-full">
            
            {/* Availability Badge & Category */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="available" size="sm" dot>
                NEW CATEGORY
              </Badge>
              <Badge variant="gold" size="sm">
                Growing Medium Specialist
              </Badge>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-[40px] font-bold text-brand-text-primary tracking-tight leading-[1.15] mb-2.5 sm:mb-3">
              KP Natural Organic Cocopeat
            </h1>

            {/* Short Description */}
            <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed mb-5 sm:mb-6 font-normal">
              Pure, washed coco peat designed to retain optimum water, lighten heavy soils, and prevent root compaction. Essential for seed starting, indoor greenery, raised garden beds, and vermicompost mixing.
            </p>

            {/* Benefit Highlights */}
            <div className="w-full bg-[#FCF9F2] rounded-farm p-3.5 sm:p-5 border border-brand-border/70 mb-6 sm:mb-8 space-y-2 sm:space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-green mb-1.5 sm:mb-2">
                Key Benefits & Uses:
              </h4>
              {COCOPEAT_BENEFITS.map((benefit, idx) => (
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
                  Select Cocopeat Pack:
                </label>
                <span className="text-xs text-brand-text-muted">
                  Choose package size
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {COCOPEAT_PACKS.map((pack) => {
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
                      {/* Popular / Best Value Tag */}
                      {pack.isPopular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-brand-gold text-brand-forest text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Best Value
                        </span>
                      )}

                      {pack.badge && !pack.isPopular && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-brand-green text-brand-ivory text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          {pack.badge}
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

                        <div className="text-xs text-brand-text-muted">
                          {pack.description || "100% Organic Coconut Coir"}
                        </div>
                      </div>

                      {/* Delivery note */}
                      <div className="mt-2.5 pt-2 border-t border-brand-border/50 flex items-center justify-between text-[11px]">
                        <span className="text-brand-green font-medium">
                          ✓ Surat Free Delivery
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
                  Total Weight: <strong className="text-brand-text-primary">{totalWeight} KG</strong>
                </span>
              </div>
            </div>

            {/* 3. DYNAMIC ORDER SUMMARY BOX */}
            <div className="w-full bg-[#FAF5E8] rounded-farm-lg p-4 sm:p-5 border border-brand-border/80 mb-6 sm:mb-8">
              <h4 className="font-serif font-bold text-xs uppercase tracking-wider text-brand-text-primary mb-2.5 pb-2 border-b border-brand-border/60">
                COCOPEAT ORDER SUMMARY
              </h4>

              <div className="space-y-2 text-xs sm:text-sm text-brand-text-secondary">
                <div className="flex items-center justify-between">
                  <span>Selected Option:</span>
                  <span className="font-semibold text-brand-text-primary text-right">
                    {quantity} × {selectedPack.name} ({totalWeight} KG)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-text-primary">
                    ₹{subtotalPrice.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Delivery Charges:</span>
                  <span className="text-brand-green font-semibold">
                    FREE in Surat • ₹45/KG Outside
                  </span>
                </div>

                <div className="pt-2.5 mt-2 border-t border-brand-border/80 flex items-center justify-between">
                  <span className="font-serif font-bold text-base sm:text-lg text-brand-text-primary">
                    Item Total:
                  </span>
                  <span className="font-serif font-bold text-xl sm:text-2xl text-brand-green">
                    ₹{subtotalPrice.toLocaleString("en-IN")}
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

            {/* Note regarding delivery & dispatch */}
            <p className="mt-3 text-[11px] text-brand-text-muted text-center sm:text-left w-full">
              ✓ Fast doorstep farm dispatch • Direct from KP Natural Dairy Farm
            </p>

          </div>

        </div>
      </Container>
    </section>
  );
}
