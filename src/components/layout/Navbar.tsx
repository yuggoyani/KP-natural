"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/#vermicompost-showcase" },
  { label: "Our Products", href: "/#categories" },
  { label: "About Us", href: "/#story" },
  { label: "Track Order", href: "/track-order" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, isHydrated } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const displayCount = isHydrated ? totalItems : 0;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-all duration-300 w-full",
        scrolled
          ? "bg-brand-ivory/95 backdrop-blur-md shadow-sm border-b border-brand-border/80 py-2.5"
          : "bg-brand-ivory/80 backdrop-blur-sm border-b border-brand-border/40 py-3.5"
      )}
    >
      <Container size="lg">
        <div className="flex items-center justify-between">
          {/* Official Brand Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus-visible:outline-none"
            aria-label="KP Natural Dairy Farm Home"
          >
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 md:w-14 md:h-14 rounded-full overflow-hidden shrink-0 border border-brand-green/20 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="KP Natural Dairy Farm Official Logo"
                fill
                priority
                sizes="(max-width: 768px) 48px, 56px"
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

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-brand-text-secondary hover:text-brand-green transition-colors duration-200 py-1 relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-brand-green after:origin-bottom-right after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Cart Link & Mobile Toggle */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart Link with Live Dynamic Counter */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-full text-brand-green hover:bg-brand-green-50 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
              aria-label={`Shopping Cart (${displayCount} items)`}
            >
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.8]" />
              {displayCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-green text-brand-ivory text-[10px] font-bold flex items-center justify-center border-2 border-brand-ivory shadow-xs animate-scale-in">
                  {displayCount}
                </span>
              )}
            </Link>

            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2.5 rounded-lg text-brand-text-primary hover:bg-brand-ivory-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green"
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
          "fixed inset-0 top-[65px] z-40 bg-brand-forest/30 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      >
        <div
          className={cn(
            "bg-brand-ivory border-b border-brand-border shadow-elevated transition-transform duration-300 px-6 py-8 flex flex-col gap-6",
            isOpen ? "translate-y-0" : "-translate-y-4"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between text-lg font-serif font-medium text-brand-text-primary hover:text-brand-green transition-colors py-2 border-b border-brand-border/40"
              >
                <span>{link.label}</span>
                <ArrowUpRight className="w-4 h-4 text-brand-text-muted" />
              </Link>
            ))}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <Link
              href="/cart"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-center rounded-farm border-2 border-brand-green text-brand-green font-medium text-base hover:bg-brand-green-50 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>View Cart ({displayCount})</span>
            </Link>

            <Link
              href="/#vermicompost-showcase"
              onClick={() => setIsOpen(false)}
              className="w-full py-3 text-center rounded-farm bg-brand-green text-brand-ivory font-medium text-base shadow-subtle hover:bg-[#0A472E] transition-colors"
            >
              Shop Vermicompost
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
