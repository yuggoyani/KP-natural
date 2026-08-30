"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Gift,
  Truck,
  ShieldCheck,
  ShoppingBag,
  Leaf,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const {
    items,
    totalItems,
    totalAmount,
    totalFreeCocopeat,
    totalWeightKg,
    updateQuantity,
    removeItem,
    isHydrated,
  } = useCart();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleRemove = (packId: string, packName: string) => {
    removeItem(packId);
    showToast(`Removed ${packName} from cart`);
  };

  // Safe SSR hydration placeholder
  if (!isHydrated) {
    return (
      <div className="py-20 min-h-[60vh] flex items-center justify-center bg-brand-ivory">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-border/60" />
          <div className="h-4 w-32 bg-brand-border/60 rounded" />
        </div>
      </div>
    );
  }

  // EMPTY CART STATE
  if (items.length === 0) {
    return (
      <div className="py-16 sm:py-24 min-h-[70vh] flex items-center bg-brand-ivory">
        <Container size="md">
          <div className="flex flex-col items-center text-center p-8 sm:p-12 rounded-farm-xl bg-[#FCF9F2] border border-brand-border shadow-subtle max-w-xl mx-auto">
            <div className="w-16 h-16 rounded-full bg-brand-green-50 text-brand-green border border-brand-green-100 flex items-center justify-center mb-6">
              <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
            </div>

            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-green mb-2">
              YOUR ORDER
            </span>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-text-primary mb-3">
              Your cart is currently empty.
            </h1>

            <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed mb-8 max-w-md">
              You haven't added any products to your cart yet. Explore our farm-fresh Vermicompost Fertilizer to give your plants and soil pure natural vitality.
            </p>

            <Button
              variant="primary"
              size="lg"
              href="/#vermicompost-showcase"
              icon={<ArrowRight className="w-5 h-5" />}
            >
              EXPLORE VERMICOMPOST
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // CART WITH ITEMS
  return (
    <div className="py-10 sm:py-16 lg:py-20 bg-brand-ivory min-h-[80vh]">
      <Container size="lg">
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-farm bg-brand-forest text-brand-ivory shadow-elevated border border-brand-green/50 text-sm font-medium animate-fade-in"
          >
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* PAGE HEADER */}
        <div className="flex flex-col items-start mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
            <span>YOUR ORDER</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight leading-none mb-3">
            Shopping Cart
          </h1>

          <p className="text-sm sm:text-base text-brand-text-secondary leading-relaxed">
            Review your selected Vermicompost products before continuing to checkout.
          </p>
        </div>

        {/* MAIN LAYOUT: Cart Items List (Left) + Sticky Order Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* LEFT: CART ITEMS LIST */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4">
            {items.map((item) => {
              const itemTotal = item.price * item.quantity;
              const itemFreeCocopeat = item.freeCocopeatKg * item.quantity;

              return (
                <div
                  key={item.packId}
                  className="rounded-farm-lg bg-[#FCF9F2] p-4 sm:p-6 border border-brand-border/80 shadow-subtle flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between transition-all duration-200 hover:border-brand-green/40"
                >
                  {/* Product Artwork & Info */}
                  <div className="flex items-center gap-4 sm:gap-5 w-full sm:w-auto">
                    {/* Thumbnail Artwork Reference */}
                    <div className="relative w-20 h-24 sm:w-24 sm:h-28 rounded-farm overflow-hidden border border-brand-border bg-white shrink-0 shadow-xs">
                      <Image
                        src="/images/vermicompost-label.png"
                        alt="KP Natural Vermicompost"
                        fill
                        sizes="96px"
                        className="object-contain p-1"
                        unoptimized
                      />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col items-start text-left">
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-green uppercase tracking-wider mb-1">
                        <Leaf className="w-3 h-3" />
                        <span>KP Natural Vermicompost</span>
                      </div>

                      <h3 className="font-serif text-lg sm:text-xl font-bold text-brand-text-primary leading-tight mb-1">
                        {item.packName}
                      </h3>

                      <span className="text-xs text-brand-text-muted mb-2">
                        Unit Price: ₹{item.price.toLocaleString("en-IN")}
                      </span>

                      {/* Free Cocopeat Tag */}
                      {itemFreeCocopeat > 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-green-50 border border-brand-green-200 text-brand-green text-[11px] font-semibold">
                          <Gift className="w-3 h-3 shrink-0" />
                          <span>+{itemFreeCocopeat} KG Cocopeat FREE</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-brand-text-muted">
                          Standard Farm Formulation
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls, Subtotal & Remove Action */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/60 gap-3">
                    {/* Interactive Quantity Stepper */}
                    <div className="inline-flex items-center rounded-lg border border-brand-border bg-white shadow-xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.packId, -1)}
                        className="w-8 h-8 flex items-center justify-center text-brand-text-primary hover:bg-brand-ivory-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green rounded-l-lg"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-9 text-center font-serif font-bold text-sm text-brand-text-primary select-none">
                        {item.quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => updateQuantity(item.packId, 1)}
                        className="w-8 h-8 flex items-center justify-center text-brand-text-primary hover:bg-brand-ivory-300 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-green rounded-r-lg"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right">
                      <span className="font-serif font-bold text-lg text-brand-green block">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-brand-text-muted">
                        ({item.weightKg * item.quantity} KG total)
                      </span>
                    </div>

                    {/* Remove Item Button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item.packId, item.packName)}
                      className="text-xs text-rose-700/80 hover:text-rose-800 flex items-center gap-1 transition-colors mt-1 focus-visible:outline-none"
                      aria-label={`Remove ${item.packName} from cart`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Back to Shopping Link */}
            <div className="pt-4 flex items-center justify-between">
              <Link
                href="/#vermicompost-showcase"
                className="inline-flex items-center gap-2 text-sm font-medium text-brand-text-secondary hover:text-brand-green transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Add more packs or products</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: STICKY ORDER SUMMARY */}
          <div className="lg:col-span-5 xl:col-span-4 sticky top-24">
            <div className="rounded-farm-xl bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border/90 shadow-elevated">
              <h2 className="font-serif font-bold text-xl text-brand-text-primary pb-3 mb-4 border-b border-brand-border/70">
                Order Summary
              </h2>

              <div className="space-y-3.5 text-sm text-brand-text-secondary mb-6">
                <div className="flex items-center justify-between">
                  <span>Total Items:</span>
                  <span className="font-semibold text-brand-text-primary">
                    {totalItems} {totalItems === 1 ? "unit" : "units"} ({totalWeightKg} KG)
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-brand-text-primary">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>

                {totalFreeCocopeat > 0 && (
                  <div className="flex items-center justify-between text-brand-green font-medium">
                    <span className="flex items-center gap-1.5">
                      <Gift className="w-4 h-4" />
                      Free Cocopeat Bonus:
                    </span>
                    <span>+{totalFreeCocopeat} KG FREE</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span>Delivery:</span>
                  <span className="text-brand-green font-semibold">
                    FREE DELIVERY
                  </span>
                </div>

                <div className="pt-4 border-t border-brand-border flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-brand-text-primary">
                    TOTAL:
                  </span>
                  <span className="font-serif font-bold text-2xl text-brand-green">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  href="/checkout"
                  icon={<ArrowRight className="w-5 h-5" />}
                  className="w-full text-center justify-center py-3.5"
                >
                  PROCEED TO CHECKOUT
                </Button>

                <Button
                  variant="secondary"
                  size="md"
                  href="/#vermicompost-showcase"
                  className="w-full text-center justify-center"
                >
                  Continue Shopping
                </Button>
              </div>

              {/* Guarantees */}
              <div className="mt-6 pt-5 border-t border-brand-border/60 flex flex-col gap-2 text-xs text-brand-text-muted">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Direct from KP Natural Dairy Farm</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brand-green shrink-0" />
                  <span>Carefully packed for doorstep dispatch</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </div>
  );
}
