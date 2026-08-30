import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  { label: "Vermicompost Fertiliser", href: "#hero-product", badge: "Available" },
  { label: "Traditional Sweets", href: "#categories", badge: "Coming Soon" },
  { label: "Milk & Dairy Products", href: "#categories", badge: "Coming Soon" },
  { label: "Desi Cow Ghee", href: "#categories", badge: "Coming Soon" },
  { label: "Fresh Paneer", href: "#categories", badge: "Coming Soon" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-ivory border-t border-brand-border mt-20 pt-16 pb-12 transition-colors">
      <Container size="lg">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-brand-border/60">
          {/* Col 1 & 2: Brand Info */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-8">
            <Link href="/" className="flex items-center gap-3 group mb-4">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border border-brand-green/20 shadow-sm">
                <Image
                  src="/images/logo.png"
                  alt="KP Natural Dairy Farm Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-lg text-brand-green tracking-tight leading-none">
                  KP NATURAL
                </span>
                <span className="text-[10px] font-semibold tracking-[0.2em] text-brand-text-secondary uppercase mt-0.5">
                  Dairy Farm
                </span>
              </div>
            </Link>

            <p className="text-sm text-brand-text-secondary leading-relaxed max-w-sm">
              Committed to authentic, natural farming practices and sustainable agriculture. Nourishing soil and families with pure, unadulterated farm-fresh products.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-green-50 border border-brand-green-100 text-brand-green text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-brand-green" />
              <span>Authentic Farm Heritage</span>
            </div>
          </div>

          {/* Col 3: Quick Links */}
          <div className="flex flex-col">
            <h3 className="font-serif text-base font-semibold text-brand-text-primary mb-4 tracking-wide">
              Navigation
            </h3>
            <ul className="flex flex-col gap-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text-secondary hover:text-brand-green transition-colors duration-150 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Product Range */}
          <div className="flex flex-col">
            <h3 className="font-serif text-base font-semibold text-brand-text-primary mb-4 tracking-wide">
              Products
            </h3>
            <ul className="flex flex-col gap-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.label} className="flex items-center gap-2">
                  <Link
                    href={link.href}
                    className="text-sm text-brand-text-secondary hover:text-brand-green transition-colors duration-150"
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
          <div className="flex flex-col">
            <h3 className="font-serif text-base font-semibold text-brand-text-primary mb-4 tracking-wide">
              Farm Inquiries
            </h3>
            <div className="flex flex-col gap-3 text-sm text-brand-text-secondary">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted block mb-0.5">
                  Customer Support
                </span>
                <span className="text-brand-text-primary font-medium">
                  [Contact Email Placeholder]
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-text-muted block mb-0.5">
                  Farm Location
                </span>
                <span className="text-brand-text-primary">
                  [Farm Address Placeholder]
                </span>
              </div>

              <div className="pt-2">
                <span className="text-xs text-brand-text-muted leading-snug block">
                  Support hours and direct farm inquiries will be available shortly.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Note */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-brand-text-muted">
          <p>
            © {currentYear} KP Natural Dairy Farm. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span>Natural Farming & Organic Nutrition</span>
            <span>•</span>
            <span>Pure & Uncompromised</span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
