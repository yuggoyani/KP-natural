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
} from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

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
}

export const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "vermicompost",
    name: "Vermicompost Fertiliser",
    subtitle: "Organic Soil Fertilizer",
    description:
      "Premium natural soil nutrition designed to support healthy soil and plant growth.",
    status: "available",
    badgeText: "AVAILABLE NOW",
    icon: Sprout,
    featured: true,
    ctaText: "SHOP NOW",
  },
  {
    id: "sweets",
    name: "Sweets",
    subtitle: "Traditional Farm Confections",
    description:
      "Handcrafted Indian sweets prepared using pure farm dairy ingredients with zero artificial preservatives.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: CakeSlice,
  },
  {
    id: "milk-dairy",
    name: "Milk & Dairy Products",
    subtitle: "Farm-Fresh Essentials",
    description:
      "Nutrient-dense, wholesome milk and daily dairy staples straight from natural farm care.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Milk,
  },
  {
    id: "ghee",
    name: "Ghee",
    subtitle: "Pure Desi Cow Ghee",
    description:
      "Traditional slow-churned aromatic ghee crafted for authentic taste, rich aroma, and pure nutrition.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Flame,
  },
  {
    id: "paneer",
    name: "Paneer",
    subtitle: "Fresh Artisanal Paneer",
    description:
      "Soft, wholesome, protein-rich farm paneer made fresh from natural milk without chemical thickeners.",
    status: "coming-soon",
    badgeText: "COMING SOON",
    icon: Sparkles,
  },
];

export function ProductCategoriesSection() {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const heroCategory = CATEGORIES_DATA.find((c) => c.featured);
  const comingSoonCategories = CATEGORIES_DATA.filter((c) => !c.featured);

  const handleComingSoonClick = (categoryName: string) => {
    setToastMessage(`${categoryName}: Coming Soon — We’re preparing something special.`);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const scrollToVermicompost = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    const showcaseElem = document.getElementById("vermicompost-showcase");
    if (showcaseElem) {
      const navOffset = 80;
      const elementPosition = showcaseElem.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.location.href = "/#vermicompost-showcase";
    }
  };

  return (
    <section
      id="categories"
      className="py-16 sm:py-20 lg:py-24 bg-[#FAF6ED] border-t border-brand-border/60 relative"
      aria-label="Explore Our Products"
    >
      <Container size="lg">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-xs font-semibold uppercase tracking-[0.2em]">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
            <span>OUR PRODUCTS</span>
          </div>

          {/* Main Heading */}
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text-primary tracking-tight leading-[1.12] mb-4 text-balance">
            Explore What Nature Has To Offer.
          </h2>

          {/* Supporting Text */}
          <p className="text-base sm:text-lg text-brand-text-secondary leading-relaxed font-normal max-w-2xl text-balance">
            Discover products from KP Natural Dairy Farm. Our Vermicompost Fertiliser is available now, with more natural and dairy products coming soon.
          </p>
        </div>

        {/* Floating Notification Toast for Coming Soon items */}
        {toastMessage && (
          <div
            role="status"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-farm bg-brand-forest text-brand-ivory shadow-elevated border border-brand-green/40 animate-fade-in text-sm font-medium"
          >
            <Info className="w-4 h-4 text-brand-gold shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* CATEGORY GRID */}
        <div className="flex flex-col gap-6 lg:gap-8">
          
          {/* 1. VERMICOMPOST FERTILISER — FEATURED PRIORITY CARD */}
          {heroCategory && (
            <div className="w-full">
              <div className="rounded-farm-xl bg-[#FAF4E6] border-2 border-brand-green/40 p-6 sm:p-8 lg:p-10 shadow-premium relative overflow-hidden transition-all duration-300 hover:border-brand-green/70">
                {/* Background Accent Gradient */}
                <div
                  className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-brand-green/10 via-transparent to-transparent rounded-bl-full pointer-events-none -z-0"
                  aria-hidden="true"
                />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
                  
                  {/* Vermicompost Copy & CTA */}
                  <div className="lg:col-span-7 flex flex-col items-start text-left">
                    
                    {/* Small Badge: AVAILABLE NOW */}
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="available" size="md" dot>
                        {heroCategory.badgeText}
                      </Badge>
                      <span className="text-xs font-semibold text-brand-green tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-brand-green/10">
                        Primary Product
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-text-primary mb-2">
                      {heroCategory.name}
                    </h3>
                    
                    <p className="text-xs sm:text-sm font-semibold text-brand-green uppercase tracking-wider mb-4">
                      {heroCategory.subtitle}
                    </p>

                    {/* Short Description */}
                    <p className="text-base sm:text-lg text-brand-text-secondary leading-relaxed mb-6 max-w-xl">
                      {heroCategory.description}
                    </p>

                    {/* Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 w-full max-w-md">
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                        <span>Enriches Soil Biology</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-brand-text-primary">
                        <CheckCircle2 className="w-4 h-4 text-brand-green shrink-0" />
                        <span>Strengthens Root Structure</span>
                      </div>
                    </div>

                    {/* CTA: SHOP NOW → */}
                    <Button
                      variant="primary"
                      size="lg"
                      href="#vermicompost-showcase"
                      onClick={scrollToVermicompost}
                      icon={<ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />}
                      className="group"
                    >
                      {heroCategory.ctaText} →
                    </Button>
                  </div>

                  {/* Vermicompost Packaging Artwork Showcase */}
                  <div className="lg:col-span-5 flex justify-center items-center">
                    <div className="relative w-48 sm:w-56 lg:w-64 aspect-[1/1.414] rounded-farm overflow-hidden border border-brand-border bg-white shadow-subtle transition-transform duration-300 hover:scale-[1.02]">
                      <Image
                        src="/images/vermicompost-label.png"
                        alt="KP Natural Vermicompost Fertiliser Official Artwork"
                        fill
                        sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 2-5. COMING SOON CATEGORY CARDS (4-Column / Responsive 2x2 Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {comingSoonCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  onClick={() => handleComingSoonClick(category.name)}
                  className="cursor-pointer group flex flex-col justify-between h-full rounded-farm-lg bg-[#FCF9F2] p-6 sm:p-7 border border-brand-border/80 shadow-subtle transition-all duration-300 hover:border-brand-green/50 hover:shadow-premium hover:-translate-y-1 relative select-none"
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
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <div className="w-11 h-11 rounded-farm bg-brand-ivory-300/80 border border-brand-border/80 flex items-center justify-center text-brand-green transition-colors duration-200 group-hover:bg-brand-green-50 group-hover:border-brand-green/30">
                        <IconComponent className="w-5 h-5 stroke-[1.8]" />
                      </div>
                      <Badge variant="coming-soon" size="sm" dot>
                        {category.badgeText}
                      </Badge>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif text-xl sm:text-2xl font-bold text-brand-text-primary mb-1 tracking-tight group-hover:text-brand-green transition-colors duration-200">
                      {category.name}
                    </h4>

                    {/* Subtitle */}
                    <p className="text-xs font-semibold text-brand-text-muted uppercase tracking-wider mb-3">
                      {category.subtitle}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-brand-text-secondary leading-relaxed">
                      {category.description}
                    </p>
                  </div>

                  {/* Card Bottom Indicator */}
                  <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-between text-xs text-brand-text-muted">
                    <span className="font-medium text-brand-text-secondary">In Development</span>
                    <span className="text-[11px] text-brand-green font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      Notify Me →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </Container>
    </section>
  );
}
