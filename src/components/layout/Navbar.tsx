"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingBag, Menu, X, ArrowUpRight, Leaf, PhoneCall, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop Vermicompost", href: "/#vermicompost-showcase" },
  { label: "Our Products", href: "/#categories" },
  { label: "About Us", href: "/#story" },
  { label: "Track Order", href: "/track-order" },
  { label: "Order History", href: "/order-history" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems, isHydrated } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.style.touchAction = "auto";
    };
  }, [isOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const displayCount = isHydrated ? totalItems : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 w-full",
        scrolled
          ? "bg-brand-ivory/95 backdrop-blur-md shadow-sm border-b border-brand-border/80 py-2 sm:py-2.5"
          : "bg-brand-ivory/85 backdrop-blur-sm border-b border-brand-border/50 py-3 sm:py-3.5"
      )}
    >
      <Container size="lg">
        <div className="flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus-visible:outline-none min-h-[44px]"
            aria-label="KP Natural Dairy Farm Home"
          >
            <div className="relative w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 border border-brand-green/20 shadow-xs transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="KP Natural Dairy Farm Official Logo"
                fill
                priority
                sizes="(max-width: 640px) 40px, (max-width: 768px) 48px, 56px"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-bold text-base sm:text-lg md:text-xl text-brand-green tracking-tight leading-tight whitespace-nowrap">
                KP NATURAL
              </span>
              <span className="text-[9px] sm:text-[11px] font-semibold tracking-[0.18em] sm:tracking-[0.2em] text-brand-text-secondary uppercase">
                Dairy Farm
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "text-xs lg:text-sm font-medium transition-colors duration-200 py-1 relative",
                    isActive
                      ? "text-brand-green font-semibold"
                      : "text-brand-text-secondary hover:text-brand-green after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-green after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Cart Link & Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Cart Link with Live Dynamic Counter */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-brand-green hover:bg-brand-green-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={`Shopping Cart (${displayCount} items)`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              {displayCount > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-brand-ivory text-[10px] font-bold flex items-center justify-center border-2 border-brand-ivory shadow-xs animate-scale-in">
                  {displayCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-lg text-brand-text-primary hover:bg-brand-ivory-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label={isOpen ? "Close Menu" : "Open Menu"}
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Navigation Overlay & Drawer */}
      <div
        className={cn(
          "fixed inset-0 top-[58px] sm:top-[65px] z-40 bg-brand-forest/40 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={cn(
            "bg-brand-ivory border-b border-brand-border shadow-elevated transition-all duration-300 px-5 sm:px-6 py-6 flex flex-col gap-5 max-h-[calc(100vh-65px)] overflow-y-auto touch-scroll safe-bottom",
            isOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile Navigation Links */}
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-base sm:text-lg font-serif font-medium text-brand-text-primary hover:text-brand-green transition-colors py-3 border-b border-brand-border/40 active:bg-brand-green-50/50 px-2 rounded-farm"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-brand-text-muted" />
              </Link>
            ))}
          </nav>

          {/* Quick Assurance Row in Drawer */}
          <div className="flex items-center justify-between text-xs text-brand-text-secondary bg-[#FCF9F2] p-3 rounded-farm border border-brand-border/70">
            <span className="flex items-center gap-1.5 font-medium">
              <Leaf className="w-3.5 h-3.5 text-brand-green" />
              100% Organic Farm
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
              Direct Delivery
            </span>
          </div>

          {/* Mobile Action Buttons */}
          <div className="pt-1 flex flex-col gap-2.5">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 text-center rounded-farm border-2 border-brand-green text-brand-green font-semibold text-sm hover:bg-brand-green-50 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>View Cart ({displayCount})</span>
            </Link>

            <Link
              href="/#vermicompost-showcase"
              onClick={() => setIsOpen(false)}
              className="w-full py-3.5 text-center rounded-farm bg-brand-green text-brand-ivory font-semibold text-sm shadow-subtle hover:bg-[#0A472E] active:scale-[0.99] transition-all"
            >
              Shop Vermicompost
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
