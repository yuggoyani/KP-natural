"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  Sprout,
  CakeSlice,
  Milk,
  Flame,
  Sparkles,
  Info,
  CheckCircle2,
  Droplets,
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface CategoryItem {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  status: "available" | "coming-soon";
  badgeText: string;
  icon: React.ElementType;
  featured?: boolean;
  ctaText?: string;
  targetId?: string;
  image?: string;
  priceNote?: string;
}

export const AVAILABLE_CATEGORIES: CategoryItem[] = [
  {
    id: "vermicompost",
    name: "Vermicompost Fertiliser",
    subtitle: "Organic Soil Nutrition",
    description:
      "Premium farm-crafted vermicompost loaded with active soil microbes. 100% natural, farm-fresh, and formulated for vigorous root and plant growth.",
    status: "available",
    badgeText: "AVAILABLE NOW",
    icon: Sprout,
    featured: true,
    ctaText: "SHOP VERMICOMPOST",
    targetId: "vermicompost-showcase",
    image: "/images/vermicompost-label.png",
    priceNote: "Starting from ₹105 (25% OFF on 1 KG)",
  },
  {
    id: "cocopeat",
    name: "Organic Cocopeat",
    subtitle: "Moisture & Root Medium",
    description:
      "Triple-washed, low-EC natural coco peat for exceptional moisture retention and soil aeration. Ideal for potting mix, indoor plants & nurseries.",
    status: "available",
    badgeText: "AVAILABLE NOW",
    icon: Droplets,
    featured: true,
    ctaText: "SHOP COCOPEAT",
    targetId: "cocopeat-showcase",
    image: "/images/cocopeat-packaging.jpg",
    priceNote: "Starting from ₹80 (1 KG to 25 KG)",
  },
];

export const COMING_SOON_CATEGORIES: CategoryItem[] = [
  {
    id: "milk-dairy",
    name: "Milk & Dairy",
    subtitle: "Farm-Fresh Essentials",
    description:
      "Nutrient-dense, wholesome milk and daily dairy staples straight from natural farm care.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Milk,
  },
  {
    id: "ghee",
    name: "Pure Desi Ghee",
    subtitle: "Traditional Bilona Ghee",
    description:
      "Traditional slow-churned aromatic ghee crafted for authentic taste, rich aroma, and pure nutrition.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Flame,
  },
  {
    id: "paneer",
    name: "Fresh Artisanal Paneer",
    subtitle: "Farm-Fresh Paneer",
    description:
      "Soft, wholesome, protein-rich farm paneer made fresh from natural milk without chemical thickeners.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Sparkles,
  },
  {
    id: "sweets",
    name: "Traditional Sweets",
    subtitle: "Pure Farm Confections",
    description:
      "Handcrafted Indian sweets prepared using pure farm dairy ingredients with zero preservatives.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: CakeSlice,
  },
];

export function ProductCategoriesSection() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleComingSoonClick = (categoryName: string) => {
    setToastMessage(`${categoryName}: Coming Soon — We’re preparing something special.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const scrollToTarget = (e: React.MouseEvent<HTMLElement>, targetId: string) => {
    e.preventDefault();
    const targetElem = document.getElementById(targetId);
    if (targetElem) {
      const navOffset = 80;
      const elementPosition = targetElem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.location.href = `/#${targetId}`;
    }
  };

  return (
    <section
      id="categories"
      className="py-12 sm:py-16 lg:py-20 bg-[#FAF6ED] border-t border-brand-border/60 relative"
      aria-label="Explore Our Products"
    >
      <Container size="lg">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-8 sm:mb-12 lg:mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-3 sm:mb-4 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
            <span>OUR PRODUCT CATEGORIES</span>
          </div>

          {/* Main Heading */}
          <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-3 sm:mb-4 text-balance">
            Explore What Nature Has To Offer.
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base md:text-lg text-brand-text-secondary leading-relaxed font-normal max-w-2xl text-balance">
            KP Natural Dairy Farm brings you direct-from-farm organic soil conditioning and plant care products with verified doorstep delivery.
          </p>
        </div>

        {/* Floating Notification Toast for Coming Soon items */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center justify-center sm:justify-start gap-2.5 px-4 py-3 rounded-farm bg-brand-forest text-brand-ivory shadow-elevated border border-brand-green/40 animate-fade-in text-xs sm:text-sm font-medium"
          >
            <Info className="w-4 h-4 text-brand-gold shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* AVAILABLE CATEGORIES GRID */}
        <div className="flex flex-col gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {AVAILABLE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="rounded-farm-xl bg-[#FAF4E6] border-2 border-brand-green/30 p-5 sm:p-7 lg:p-8 shadow-premium relative overflow-hidden transition-all duration-300 hover:border-brand-green flex flex-col justify-between"
              >
                {/* Background accent */}
                <div
                  className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-brand-green/10 via-transparent to-transparent rounded-bl-full pointer-events-none"
                  aria-hidden="true"
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <Badge variant="available" size="sm" dot>
                      {cat.badgeText}
                    </Badge>
                    <span className="text-[11px] font-bold text-brand-green bg-brand-green/10 px-2.5 py-0.5 rounded-full">
                      {cat.priceNote}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center my-3">
                    <div className="sm:col-span-8 flex flex-col text-left">
                      <h3 className="font-serif text-xl sm:text-2xl lg:text-3xl font-bold text-brand-text-primary mb-1">
                        {cat.name}
                      </h3>
                      <p className="text-xs font-semibold text-brand-green uppercase tracking-wider mb-2">
                        {cat.subtitle}
                      </p>
                      <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed mb-4">
                        {cat.description}
                      </p>

                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center gap-2 text-xs font-medium text-brand-text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                          <span>100% Organic Farm Direct</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-brand-text-primary">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />
                          <span>Surat: Free Delivery • Outside: ₹45/kg</span>
                        </div>
                      </div>
                    </div>

                    {/* Product visual artwork */}
                    <div className="sm:col-span-4 flex justify-center items-center">
                      <div className="relative w-28 sm:w-32 aspect-[3/4] rounded-farm overflow-hidden border border-brand-border bg-white shadow-subtle">
                        {cat.image && (
                          <Image
                            src={cat.image}
                            alt={cat.name}
                            fill
                            sizes="128px"
                            className="object-contain p-1"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-brand-border/60">
                  <Button
                    variant="primary"
                    size="md"
                    href={`#${cat.targetId}`}
                    onClick={(e) => scrollToTarget(e, cat.targetId || "vermicompost-showcase")}
                    icon={<ArrowRight className="w-4 h-4" />}
                    className="w-full text-center justify-center min-h-[44px]"
                  >
                    {cat.ctaText}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* COMING SOON SECTION TITLE */}
        <div className="text-left mb-4 sm:mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-text-secondary">
            Upcoming Dairy Offerings:
          </span>
        </div>

        {/* 4-COLUMN COMING SOON GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {COMING_SOON_CATEGORIES.map((category) => {
            const IconComponent = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => handleComingSoonClick(category.name)}
                className="cursor-pointer group flex flex-col justify-between h-full rounded-farm-lg bg-[#FCF9F2] p-4 sm:p-6 border border-brand-border/80 shadow-subtle transition-all duration-300 hover:border-brand-green/50 hover:shadow-premium hover:-translate-y-1 relative select-none"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleComingSoonClick(category.name);
                  }
                }}
                aria-label={`${category.name} - Coming Soon`}
              >
                <div>
                  {/* Top Row: Category Icon & COMING SOON Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 sm:mb-5">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-farm bg-brand-ivory-300/80 border border-brand-border/80 flex items-center justify-center text-brand-green transition-colors duration-200 group-hover:bg-brand-green-50 group-hover:border-brand-green/30">
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
                    </div>
                    <Badge variant="coming-soon" size="sm" dot>
                      {category.badgeText}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h4 className="font-serif text-lg sm:text-xl font-bold text-brand-text-primary mb-1 tracking-tight group-hover:text-brand-green transition-colors duration-200">
                    {category.name}
                  </h4>

                  {/* Subtitle */}
                  <p className="text-[11px] sm:text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-2 sm:mb-3">
                    {category.subtitle}
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Card Bottom Indicator */}
                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-muted">
                  <span className="font-medium text-brand-text-secondary text-[11px] sm:text-xs">In Development</span>
                  <span className="text-[11px] text-brand-green font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    Notify Me →
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </Container>
    </section>
  );
}
