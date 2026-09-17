"use client";

import React from "react";
import Image from "next/image";
import { ArrowRight, Leaf, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export function HeroSection() {
  const scrollToSection = (e: React.MouseEvent<HTMLElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const navOffset = 70;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <section
      id="hero-product"
      className="relative pt-4 pb-10 sm:pt-8 sm:pb-14 lg:pt-14 lg:pb-20 overflow-hidden bg-brand-ivory"
      aria-label="Hero Section - Vermicompost Fertiliser"
    >
      {/* Subtle organic background aura */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] sm:w-[600px] lg:w-[800px] h-[320px] sm:h-[500px] lg:h-[600px] bg-gradient-to-br from-brand-green/5 via-brand-gold/5 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

      <Container size="lg">
        {/* Main Grid: Left copy & CTAs, Right Product Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          
          {/* LEFT SIDE: Typography, Supporting Description & CTA Buttons */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            
            {/* 1. Small Premium Eyebrow Label */}
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 mb-3 sm:mb-5 rounded-full bg-brand-green/10 border border-brand-green/20 text-brand-green text-[11px] sm:text-xs font-semibold uppercase tracking-[0.18em] sm:tracking-[0.2em]">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0 animate-pulse" />
              <span>KP NATURAL DAIRY FARM</span>
            </div>

            {/* 2. Main Headline */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-[58px] font-bold text-brand-text-primary tracking-tight leading-[1.1] mb-4 sm:mb-5 text-balance">
              Nourish Your Soil.
              <br />
              <span className="text-brand-green">Grow Naturally.</span>
            </h1>

            {/* 3. Short Supporting Description */}
            <p className="text-sm sm:text-base md:text-lg text-brand-text-secondary leading-relaxed mb-6 sm:mb-8 max-w-xl font-normal text-balance">
              Enrich your garden, crops, and home plants with pure, nutrient-dense vermicompost fertilizer. Handcrafted naturally at KP Natural Dairy Farm to build living soil, strengthen root systems, and cultivate vigorous plant vitality.
            </p>

            {/* 4 & 5. Primary & Secondary CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
              <Button
                variant="primary"
                size="lg"
                href="#vermicompost-showcase"
                onClick={(e) => scrollToSection(e, "vermicompost-showcase")}
                icon={<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" />}
                className="group w-full sm:w-auto text-center justify-center shadow-subtle hover:shadow-premium min-h-[48px]"
              >
                SHOP VERMICOMPOST
              </Button>
              <Button
                variant="secondary"
                size="lg"
                href="#categories"
                onClick={(e) => scrollToSection(e, "categories")}
                className="w-full sm:w-auto text-center justify-center min-h-[48px]"
              >
                EXPLORE OUR PRODUCTS
              </Button>
            </div>
          </div>

          {/* RIGHT SIDE: Premium Product Visual Composition */}
          <div className="lg:col-span-5 flex justify-center items-center w-full z-10 mt-2 lg:mt-0">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[420px]">
              
              {/* Soft Organic Backdrop Halo */}
              <div
                className="absolute inset-0 -m-2 sm:-m-4 rounded-[28px] bg-gradient-to-b from-brand-green/10 via-brand-cream to-brand-border/40 blur-sm -z-10"
                aria-hidden="true"
              />

              {/* Product Presentation Card Frame */}
              <div className="relative rounded-farm-xl bg-[#FCF9F2] p-3.5 sm:p-5 border border-brand-border/90 shadow-elevated transition-all duration-300 hover:shadow-2xl hover:border-brand-green/40 group">
                
                {/* Micro-Badge: VERMICOMPOST FERTILISER • AVAILABLE NOW */}
                <div className="flex items-center justify-between gap-2 mb-2.5 px-1">
                  <div className="flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span className="text-[10px] sm:text-[11px] font-bold tracking-wider uppercase text-brand-green truncate">
                      Vermicompost Fertiliser
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-green text-brand-ivory text-[9px] sm:text-[10px] font-bold tracking-wider uppercase shadow-xs shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#55E59C] animate-pulse" />
                    Available Now
                  </span>
                </div>

                {/* Exact Product Label Artwork Showcase - Preserving 100% fidelity */}
                <div className="relative w-full aspect-[1/1.414] rounded-farm overflow-hidden border border-brand-border/70 bg-white shadow-xs">
                  <Image
                    src="/images/vermicompost-label.png"
                    alt="KP Natural Vermicompost Organic Fertilizer Official Packaging and Label Reference"
                    fill
                    priority
                    sizes="(max-width: 640px) 300px, (max-width: 1024px) 380px, 420px"
                    className="object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                    unoptimized
                  />
                </div>

                {/* Subtle Supporting Line Below Artwork */}
                <div className="mt-3 pt-2.5 border-t border-brand-border/60 flex items-center justify-between text-xs">
                  <div className="flex flex-col">
                    <span className="font-serif font-bold text-brand-text-primary text-xs sm:text-sm">
                      KP Natural Vermicompost
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-brand-text-muted">
                      Natural Farm Formulation
                    </span>
                  </div>
                  <div className="text-right flex items-center gap-1 text-brand-green font-medium text-[11px] sm:text-xs">
                    <Sparkles className="w-3 h-3 shrink-0" />
                    <span>Direct From Farm</span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* 7. OPTIONAL SMALL TRUST ROW: 3 Short Minimal Points */}
        <div className="mt-8 sm:mt-12 lg:mt-16 pt-5 sm:pt-7 border-t border-brand-border/70">
          <div className="flex flex-wrap items-center justify-center gap-y-2.5 gap-x-5 sm:gap-x-10 text-xs sm:text-sm font-medium text-brand-text-secondary">
            
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
              <span>Natural Soil Care</span>
            </div>

            <span className="text-brand-border-dark hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
              <span>Balanced Plant Nutrition</span>
            </div>

            <span className="text-brand-border-dark hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-green shrink-0" />
              <span>Direct From KP Natural</span>
            </div>

          </div>
        </div>

      </Container>
    </section>
  );
}
