import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Leaf, ShieldCheck, Heart } from "lucide-react";
import { Container } from "@/components/ui/Container";

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop Products", href: "/#vermicompost-showcase" },
  { label: "Product Categories", href: "/#categories" },
  { label: "Track Your Order", href: "/track-order" },
  { label: "Our Farm Story", href: "/#story" },
  { label: "Quality & Trust", href: "/#quality" },
];

const PRODUCT_LINKS = [
  { label: "Vermicompost Fertiliser", href: "/#vermicompost-showcase", badge: "Available" },
  { label: "Traditional Sweets", href: "/#categories", badge: "Coming Soon" },
  { label: "Milk & Dairy Products", href: "/#categories", badge: "Coming Soon" },
  { label: "Desi Cow Ghee", href: "/#categories", badge: "Coming Soon" },
  { label: "Fresh Paneer", href: "/#categories", badge: "Coming Soon" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-ivory border-t border-brand-border mt-14 sm:mt-20 pt-12 sm:pt-16 pb-10 sm:pb-12 transition-colors">
      <Container size="lg">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-8 pb-10 sm:pb-12 border-b border-brand-border/60">
          {/* Col 1 & 2: Brand Info */}
          <div className="sm:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 border border-brand-green/20 shadow-xs">
                <Image
                  src="/images/logo.png"
                  alt="KP Natural Dairy Farm Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg sm:text-xl text-brand-green tracking-tight leading-none">
                  KP NATURAL
                </span>
                <span className="text-[10px] sm:text-xs font-semibold tracking-[0.2em] text-brand-text-secondary uppercase mt-0.5">
                  Dairy Farm
                </span>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-brand-text-secondary leading-relaxed max-w-sm mb-4">
              Committed to authentic, natural farming practices and sustainable agriculture. Nourishing soil and families with pure, unadulterated farm-fresh products.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-50 border border-brand-green-100 text-brand-green text-xs font-medium">
              <Leaf className="w-3.5 h-3.5 text-brand-green" />
              <span>Authentic Farm Heritage</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="flex flex-col">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-brand-text-primary mb-3 sm:mb-4 tracking-wide">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-brand-text-secondary hover:text-brand-green transition-colors duration-150 inline-block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Product Range */}
          <div className="flex flex-col">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-brand-text-primary mb-3 sm:mb-4 tracking-wide">
              Products
            </h3>
            <ul className="flex flex-col gap-2">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label} className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    className="text-xs sm:text-sm text-brand-text-secondary hover:text-brand-green transition-colors duration-150 py-1"
                  >
                    {link.label}
                  </Link>
                  {link.badge === "Available" ? (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-brand-green text-brand-ivory uppercase tracking-wider">
                      Live
                    </span>
                  ) : (
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-brand-ivory-300 text-brand-text-muted border border-brand-border">
                      Soon
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 5: Contact Placeholder Section */}
          <div className="flex flex-col sm:col-span-2 md:col-span-1">
            <h3 className="font-serif text-sm sm:text-base font-semibold text-brand-text-primary mb-3 sm:mb-4 tracking-wide">
              Farm Inquiries
            </h3>
            <div className="flex flex-col gap-2.5 text-xs sm:text-sm text-brand-text-secondary">
              <div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-text-muted block mb-0.5">
                  Customer Support
                </span>
                <span className="text-brand-text-primary font-medium">
                  support@kpnaturals.com
                </span>
              </div>

              <div>
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-brand-text-muted block mb-0.5">
                  Farm Location
                </span>
                <span className="text-brand-text-primary">
                  Gujarat, India
                </span>
              </div>

              <div className="pt-1">
                <span className="text-[11px] text-brand-text-muted leading-snug block">
                  Support hours and direct farm inquiries available Mon – Sat (9 AM – 6 PM).
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Note */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] sm:text-xs text-brand-text-muted text-center sm:text-left">
          <p>
            © {currentYear} KP Natural Dairy Farm. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            <span>Natural Farming & Organic Nutrition</span>
            <span className="hidden sm:inline">•</span>
            <span>Pure & Uncompromised</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
