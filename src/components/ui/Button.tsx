import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      href,
      className,
      children,
      icon,
      iconPosition = "right",
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none tracking-wide";

    const variants = {
      primary:
        "bg-brand-green text-brand-ivory hover:bg-[#0A472E] active:scale-[0.99] shadow-subtle hover:shadow-premium",
      secondary:
        "bg-brand-ivory text-brand-green border-2 border-brand-green hover:bg-brand-green-50 active:scale-[0.99]",
      outline:
        "bg-transparent text-brand-text-primary border border-brand-border hover:border-brand-green hover:bg-brand-green-50/60",
      ghost:
        "bg-transparent text-brand-text-secondary hover:text-brand-green hover:bg-brand-ivory-300",
    };

    const sizes = {
      sm: "text-xs px-3.5 py-1.5 rounded-lg gap-1.5",
      md: "text-sm sm:text-base px-5 py-2.5 rounded-farm gap-2",
      lg: "text-base sm:text-lg px-7 py-3.5 rounded-farm gap-2.5 font-semibold",
    };

    const classes = cn(baseStyles, variants[variant], sizes[size], className);

    const content = (
      <>
        {icon && iconPosition === "left" && <span className="inline-flex shrink-0">{icon}</span>}
        <span>{children}</span>
        {icon && iconPosition === "right" && <span className="inline-flex shrink-0">{icon}</span>}
      </>
    );

    if (href) {
      return (
        <Link href={href} className={classes}>
          {content}
        </Link>
      );
    }

    return (
      <button ref={ref} className={classes} disabled={disabled} {...props}>
        {content}
      </button>
    );
  }
);

Button.displayName = "Button";
