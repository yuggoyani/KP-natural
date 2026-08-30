import { HeroSection } from "@/components/home/HeroSection";
import { ProductCategoriesSection } from "@/components/home/ProductCategoriesSection";
import { VermicompostProductSection } from "@/components/home/VermicompostProductSection";
import { BrandStorySection } from "@/components/home/BrandStorySection";
import { TrustSection } from "@/components/home/TrustSection";

export default function HomePage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. PRODUCT CATEGORIES SECTION */}
      <ProductCategoriesSection />

      {/* 3. VERMICOMPOST PRODUCT SHOWCASE & PURCHASE SELECTION */}
      <VermicompostProductSection />

      {/* 4. BRAND STORY SECTION */}
      <BrandStorySection />

      {/* 5. TRUST & QUALITY STANDARDS SECTION */}
      <TrustSection />
    </div>
  );
}
