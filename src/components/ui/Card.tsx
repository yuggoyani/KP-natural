import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padded?: boolean;
  highlighted?: boolean;
}

export function Card({
  hover = true,
  padded = true,
  highlighted = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-farm-lg transition-all duration-300 relative overflow-hidden",
        "bg-[#FCF9F2] border",
        highlighted
          ? "border-brand-green/40 shadow-premium ring-1 ring-brand-green/20"
          : "border-brand-border/80 shadow-subtle",
        hover && "hover:border-brand-green/60 hover:shadow-premium hover:-translate-y-0.5",
        padded && "p-6 sm:p-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
