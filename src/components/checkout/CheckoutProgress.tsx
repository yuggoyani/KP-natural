import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutProgressProps {
  currentStep?: number; // 1: Cart, 2: Details, 3: Payment, 4: Review, 5: Confirmed
}

const STEPS = [
  { step: 1, label: "Cart" },
  { step: 2, label: "Details" },
  { step: 3, label: "Payment" },
  { step: 4, label: "Review" },
  { step: 5, label: "Order Confirmed" },
];

export function CheckoutProgress({ currentStep = 2 }: CheckoutProgressProps) {
  return (
    <div className="w-full py-4 sm:py-6" aria-label="Checkout Progress">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-2 relative">
        
        {/* Background Connecting Line */}
        <div
          className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[2px] bg-brand-border/70 -z-0"
          aria-hidden="true"
        />

        {/* Dynamic Progress Fill Line */}
        <div
          className="absolute top-1/2 left-6 -translate-y-1/2 h-[2px] bg-brand-green transition-all duration-300 -z-0"
          style={{
            width: `${((Math.min(currentStep, STEPS.length) - 1) / (STEPS.length - 1)) * 100}%`,
          }}
          aria-hidden="true"
        />

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;

          return (
            <div key={s.step} className="flex flex-col items-center gap-1.5 relative z-10">
              {/* Step Circle */}
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 border-2",
                  isCompleted && "bg-brand-green border-brand-green text-brand-ivory",
                  isCurrent && "bg-brand-green text-brand-ivory border-brand-green ring-4 ring-brand-green/20 shadow-xs",
                  !isCompleted && !isCurrent && "bg-[#FCF9F2] border-brand-border text-brand-text-muted"
                )}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : s.step}
              </div>

              {/* Step Label */}
              <span
                className={cn(
                  "text-[10px] sm:text-xs tracking-wider uppercase font-semibold text-center select-none",
                  isCurrent && "text-brand-green font-bold",
                  isCompleted && "text-brand-text-primary",
                  !isCompleted && !isCurrent && "text-brand-text-muted hidden sm:inline-block"
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
