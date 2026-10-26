import { HeroSection } from "@/components/home/HeroSection";
import { ProductCategoriesSection } from "@/components/home/ProductCategoriesSection";
import { VermicompostProductSection } from "@/components/home/VermicompostProductSection";
import { CocopeatProductSection } from "@/components/home/CocopeatProductSection";
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

      {/* 4. COCOPEAT PRODUCT SHOWCASE & PURCHASE SELECTION */}
      <CocopeatProductSection />

      {/* 5. BRAND STORY SECTION */}
      <BrandStorySection />

      {/* 6. TRUST & QUALITY STANDARDS SECTION */}
      <TrustSection />
    </div>
  );
}
