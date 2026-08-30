"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, ShieldCheck, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please enter your admin email and password.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check credentials.");
        setIsLoading(false);
        return;
      }

      // Store in session/localStorage for client navigation
      localStorage.setItem("kp_admin_logged_in", "true");
      localStorage.setItem("kp_admin_email", data.email);
      if (data.token) {
        localStorage.setItem("kp_admin_token", data.token);
      }

      // Redirect to admin orders dashboard
      router.push("/admin/orders");
    } catch (err: any) {
      console.error("Admin Login Error:", err);
      setError("Network error contacting admin authentication server.");
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20 min-h-[80vh] flex items-center justify-center bg-brand-ivory">
      <Container size="sm">
        <div className="rounded-farm-xl bg-[#FCF9F2] p-7 sm:p-10 border border-brand-border shadow-elevated max-w-md mx-auto text-left">
          {/* Logo & Portal Header */}
          <div className="flex flex-col items-center text-center pb-6 mb-6 border-b border-brand-border/70">
            <div className="relative w-20 h-20 mb-3">
              <Image
                src="/images/logo.png"
                alt="KP Natural Dairy Farm"
                fill
                priority
                sizes="80px"
                className="object-contain"
              />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-green mb-1">
              KP Natural Dairy Farm
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-brand-text-primary">
              Admin Portal
            </h1>
            <p className="text-xs text-brand-text-secondary mt-1">
              Secure authentication for order management & payment verification.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            {/* Email Field */}
            <div className="flex flex-col text-left">
              <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-brand-green" />
                <span>Admin Email</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="admin@kpnaturals.com"
                className="h-12 px-4 rounded-farm bg-white border border-brand-border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                required
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col text-left">
              <label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-brand-green" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full h-12 pl-4 pr-11 rounded-farm bg-white border border-brand-border text-sm text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-text-muted hover:text-brand-text-primary transition-colors p-1"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-farm bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="lg"
              type="submit"
              disabled={isLoading}
              icon={
                isLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )
              }
              className="w-full py-3.5 text-sm shadow-subtle hover:shadow-premium mt-2"
            >
              {isLoading ? "Authenticating..." : "Secure Sign In"}
            </Button>
          </form>

          {/* Security Guarantee Notice */}
          <div className="mt-6 pt-4 border-t border-brand-border/60 flex items-center justify-center gap-1.5 text-[11px] text-brand-text-muted">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-green" />
            <span>Encrypted Server-Side Session Protection</span>
          </div>
        </div>
      </Container>
    </div>
  );
}
