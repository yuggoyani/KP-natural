import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "available" | "coming-soon" | "outline" | "gold";
  size?: "sm" | "md";
  dot?: boolean;
}

export function Badge({
  variant = "available",
  size = "md",
  dot = false,
  className,
  children,
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center font-medium uppercase tracking-wider select-none transition-colors";

  const variants = {
    available:
      "bg-brand-green text-brand-ivory border border-brand-green-800 shadow-sm",
    "coming-soon":
      "bg-brand-ivory-300 text-brand-text-secondary border border-brand-border",
    outline:
      "bg-transparent text-brand-green border border-brand-green/40",
    gold:
      "bg-brand-gold/15 text-brand-gold-dark border border-brand-gold/40 font-semibold",
  };

  const sizes = {
    sm: "text-[10px] px-2 py-0.5 rounded-full gap-1",
    md: "text-xs px-3 py-1 rounded-full gap-1.5",
  };

  return (
    <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "available" && "bg-[#55E59C] animate-pulse",
            variant === "coming-soon" && "bg-brand-text-muted",
            variant === "gold" && "bg-brand-gold",
            variant === "outline" && "bg-brand-green"
          )}
        />
      )}
      {children}
    </span>
  );
}
