import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center" | "right";
  className?: string;
  titleAs?: "h1" | "h2" | "h3";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  titleAs = "h2",
}: SectionHeadingProps) {
  const alignmentClasses = {
    left: "text-left items-start",
    center: "text-center items-center mx-auto",
    right: "text-right items-end ml-auto",
  };

  const HeadingTag = titleAs;

  return (
    <div
      className={cn(
        "flex flex-col max-w-3xl mb-10 sm:mb-14",
        alignmentClasses[align],
        className
      )}
    >
      {eyebrow && (
        <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 rounded-full bg-brand-green-50 border border-brand-green-100 text-brand-green text-xs font-semibold uppercase tracking-widest">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
          {eyebrow}
        </div>
      )}
      <HeadingTag className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-brand-text-primary tracking-tight leading-[1.15] text-balance">
        {title}
      </HeadingTag>
      {description && (
        <p className="mt-4 text-base sm:text-lg text-brand-text-secondary leading-relaxed font-normal text-balance">
          {description}
        </p>
      )}
    </div>
  );
}
