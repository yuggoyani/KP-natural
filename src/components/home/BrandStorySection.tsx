import React from "react";
import Image from "next/image";
import { Leaf, Sun, HeartHandshake } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function BrandStorySection() {
  return (
    <section id="story" className="py-12 sm:py-16 md:py-20 lg:py-24 bg-brand-ivory">
      <Container size="lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Official Emblem Display */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-80 lg:h-80 rounded-full border-4 border-brand-green/20 p-2 shadow-elevated bg-[#FCF9F2] transition-transform duration-300 hover:scale-105">
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="KP Natural Dairy Farm Brand Emblem"
                  fill
                  sizes="(max-width: 640px) 176px, (max-width: 1024px) 288px, 320px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="mt-4 sm:mt-6 text-center">
              <span className="font-serif text-base sm:text-lg font-bold text-brand-green tracking-wide">
                KP Natural Dairy Farm
              </span>
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-brand-text-muted block mt-0.5">
                Rooted in Nature • Since 1989
              </span>
            </div>
          </div>

          {/* Right Column: Philosophy Narrative */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            <SectionHeading
              eyebrow="Our Story & Philosophy"
              title="A Commitment to Healthy Soil, Wholesome Animals, and Pure Produce"
              description="At KP Natural Dairy Farm, we believe that true wellness begins directly with living soil and naturally cared-for farm animals."
              align="left"
              className="mb-6 sm:mb-8"
            />

            <div className="space-y-3.5 sm:space-y-4 text-brand-text-secondary text-sm sm:text-base md:text-lg leading-relaxed font-normal">
              <p>
                Our farming philosophy revolves around ecological balance. By cycling organic matter and dairy manure back into high-grade vermicompost, we revitalize the microflora of our soils without resorting to synthetic chemical inputs.
              </p>
              <p>
                From nutrient-dense soil supplements to future farm-fresh dairy staples, every offering from KP Natural Dairy Farm represents transparent care, time-tested wisdom, and unwavering integrity.
              </p>
            </div>

            {/* Farm Values Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-brand-border/60 w-full">
              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-green-50 text-brand-green flex items-center justify-center">
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-text-primary text-sm sm:text-base">
                  Living Soil
                </h4>
                <p className="text-xs text-brand-text-secondary leading-snug">
                  Restoring organic matter and natural microbial vitality to farmland.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-green-50 text-brand-green flex items-center justify-center">
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-text-primary text-sm sm:text-base">
                  Natural Harmony
                </h4>
                <p className="text-xs text-brand-text-secondary leading-snug">
                  Working with natural biological cycles to cultivate pure produce.
                </p>
              </div>

              <div className="flex flex-col gap-1.5 sm:gap-2">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-brand-green-50 text-brand-green flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-serif font-bold text-brand-text-primary text-sm sm:text-base">
                  Transparent Care
                </h4>
                <p className="text-xs text-brand-text-secondary leading-snug">
                  Honest practices from farm to doorstep with zero adulteration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
