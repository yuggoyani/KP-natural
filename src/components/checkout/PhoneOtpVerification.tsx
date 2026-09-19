"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Edit2,
  KeyRound,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PhoneOtpVerificationProps {
  mobileNumber: string;
  onMobileChange: (newNumber: string) => void;
  isVerified: boolean;
  onVerified: (verificationToken: string, verifiedNumber: string) => void;
  onResetVerification: () => void;
  error?: string;
  required?: boolean;
  purpose?: "checkout" | "order_history";
  compact?: boolean;
}

export function PhoneOtpVerification({
  mobileNumber,
  onMobileChange,
  isVerified,
  onVerified,
  onResetVerification,
  error: externalError,
  required = true,
  purpose = "checkout",
  compact = false,
}: PhoneOtpVerificationProps) {
  // Verification states
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState(["", "", "", "", "", ""]);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // Clean 10-digit number
  const cleanNumber = mobileNumber.replace(/\D/g, "");
  const isValidMobile = cleanNumber.length === 10 && /^[6-9]\d{9}$/.test(cleanNumber);

  // Send OTP handler
  const handleSendOtp = async () => {
    if (!isValidMobile) {
      setErrorMessage("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: cleanNumber,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Unable to send OTP right now. Please try again.");
        setIsSending(false);
        return;
      }

      setIsOtpSent(true);
      setCountdown(data.resendCooldownSeconds || 45);
      if (data.isDemoMode) setIsDemoMode(true);
      setSuccessMessage(data.message || `OTP sent to +91 ${cleanNumber.slice(0, 5)} ${cleanNumber.slice(5)}`);
      
      // Auto-focus first digit
      setTimeout(() => {
        otpInputsRef.current[0]?.focus();
      }, 100);
    } catch (err) {
      setErrorMessage("OTP service is temporarily unavailable. Please try again in a few minutes.");
    } finally {
      setIsSending(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0 || isSending) return;
    setOtpValue(["", "", "", "", "", ""]);
    await handleSendOtp();
  };

  // Handle single digit input
  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1).replace(/\D/g, "");
    const newOtp = [...otpValue];
    newOtp[index] = char;
    setOtpValue(newOtp);
    if (errorMessage) setErrorMessage(null);

    // Auto-advance to next input
    if (char && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }

    // Auto-trigger verification when 6 digits are typed
    if (char && index === 5 && newOtp.every((d) => d.length === 1)) {
      triggerVerify(newOtp.join(""));
    }
  };

  // Handle keydown for backspace
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValue[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  // Handle paste full 6-digit OTP
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newOtp = [...otpValue];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasted[i] || "";
    }
    setOtpValue(newOtp);

    const nextFocusIndex = Math.min(pasted.length, 5);
    otpInputsRef.current[nextFocusIndex]?.focus();

    if (pasted.length === 6) {
      triggerVerify(pasted);
    }
  };

  // Verify OTP handler
  const triggerVerify = async (fullOtp?: string) => {
    const code = fullOtp || otpValue.join("");
    if (code.length !== 6) {
      setErrorMessage("Please enter all 6 digits of the OTP.");
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobileNumber: cleanNumber,
          otp: code,
          purpose,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "Incorrect OTP. Please check and try again.");
        setIsVerifying(false);
        return;
      }

      // Verification Success!
      setIsOtpSent(false);
      setSuccessMessage(null);
      setErrorMessage(null);
      onVerified(data.phoneVerificationToken || "", data.verifiedMobile || cleanNumber);
    } catch (err) {
      setErrorMessage("Network error verifying OTP. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Change Number handler (resets verification state)
  const handleChangeNumber = () => {
    setIsOtpSent(false);
    setOtpValue(["", "", "", "", "", ""]);
    setErrorMessage(null);
    setSuccessMessage(null);
    onResetVerification();
  };

  return (
    <div className="flex flex-col text-left w-full">
      {/* Field Label */}
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor="mobileNumberInput"
          className="text-xs font-semibold uppercase tracking-wider text-brand-text-primary flex items-center gap-1"
        >
          <Phone className="w-3.5 h-3.5 text-brand-green" />
          <span>Mobile Number</span>
          {required && <span className="text-rose-600 font-bold">*</span>}
        </label>

        {isVerified && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mobile number verified</span>
          </span>
        )}
      </div>

      {/* VERIFIED STATE: Locked field with Verified Badge & Change Button */}
      {isVerified ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-12 px-4 rounded-farm bg-emerald-50/80 border border-emerald-300 flex items-center justify-between text-sm text-brand-text-primary font-semibold select-none">
            <div className="flex items-center gap-2">
              <span className="text-brand-text-muted font-normal">+91</span>
              <span className="font-mono text-base font-bold text-emerald-900 tracking-wider">
                {cleanNumber.slice(0, 5)} {cleanNumber.slice(5)}
              </span>
            </div>

            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-full border border-emerald-300/60">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>✓ Verified</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleChangeNumber}
            className="h-12 px-3.5 rounded-farm bg-white border border-brand-border hover:bg-brand-ivory-300 text-xs font-semibold text-brand-text-secondary hover:text-brand-green transition-colors flex items-center gap-1.5 shrink-0"
            title="Change mobile number"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Change</span>
          </button>
        </div>
      ) : (
        /* UNVERIFIED STATE: Input with Verify button */
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-brand-text-muted select-none">
                +91
              </span>
              <input
                id="mobileNumberInput"
                type="tel"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "");
                  onMobileChange(cleaned);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isOtpSent && !isVerified}
                placeholder="9876543210"
                className={cn(
                  "w-full h-12 pl-12 pr-4 rounded-farm bg-white border text-sm font-mono text-brand-text-primary placeholder:text-brand-text-muted focus:outline-none focus:ring-2 focus:ring-brand-green",
                  externalError || errorMessage
                    ? "border-rose-500 ring-1 ring-rose-500/30"
                    : "border-brand-border",
                  isOtpSent && "bg-brand-ivory-300/60 opacity-80"
                )}
              />
            </div>

            {!isOtpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={!isValidMobile || isSending}
                className={cn(
                  "h-12 px-5 rounded-farm font-bold text-xs uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 shrink-0 min-w-[90px] shadow-xs active:scale-[0.98]",
                  isValidMobile && !isSending
                    ? "bg-brand-green hover:bg-[#0A472E] text-brand-ivory cursor-pointer"
                    : "bg-brand-ivory-300 text-brand-text-muted border border-brand-border cursor-not-allowed"
                )}
              >
                {isSending ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Verify</span>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleChangeNumber}
                className="h-12 px-3 rounded-farm bg-white border border-brand-border hover:bg-brand-ivory-300 text-xs font-semibold text-brand-text-secondary hover:text-brand-green transition-colors shrink-0"
              >
                Edit No.
              </button>
            )}
          </div>

          {/* INLINE OTP VERIFICATION BOX */}
          {isOtpSent && !isVerified && (
            <div className="p-4 sm:p-5 rounded-farm-lg bg-white border-2 border-brand-green/40 shadow-subtle flex flex-col gap-3.5 animate-scale-in">
              <div className="flex items-start justify-between gap-2 border-b border-brand-border/60 pb-2.5">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-brand-green flex items-center gap-1">
                    <KeyRound className="w-3.5 h-3.5 text-brand-green" />
                    <span>Enter 6-Digit OTP</span>
                  </span>
                  <p className="text-[11px] sm:text-xs text-brand-text-secondary mt-0.5">
                    Enter the 6-digit OTP sent to <strong>+91 {cleanNumber.slice(0, 5)} {cleanNumber.slice(5)}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="text-[11px] font-semibold text-brand-text-muted hover:text-brand-green underline"
                >
                  Change number
                </button>
              </div>

              {/* 6-Digit Inputs */}
              <div className="flex items-center justify-center gap-1.5 sm:gap-2.5 my-1">
                {otpValue.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputsRef.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-10 h-12 sm:w-12 sm:h-13 rounded-farm text-center font-mono font-bold text-lg sm:text-xl text-brand-text-primary bg-[#FAF7F0] border border-brand-border focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-brand-green transition-all"
                  />
                ))}
              </div>

              {/* Verify OTP CTA + Resend Timer */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => triggerVerify()}
                  disabled={isVerifying || otpValue.join("").length !== 6}
                  className={cn(
                    "h-11 px-5 rounded-farm font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xs",
                    otpValue.join("").length === 6 && !isVerifying
                      ? "bg-brand-green hover:bg-[#0A472E] text-brand-ivory cursor-pointer"
                      : "bg-brand-ivory-300 text-brand-text-muted border border-brand-border cursor-not-allowed"
                  )}
                >
                  {isVerifying ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify OTP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center sm:justify-end gap-1.5 text-xs text-brand-text-secondary">
                  {countdown > 0 ? (
                    <span className="text-[11px] text-brand-text-muted">
                      Resend OTP in <strong className="text-brand-text-primary font-mono">{countdown}s</strong>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isSending}
                      className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1"
                    >
                      <RefreshCw className={cn("w-3 h-3", isSending && "animate-spin")} />
                      <span>Resend OTP</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inline Feedback Messages */}
      {errorMessage && (
        <div className="mt-1.5 p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {externalError && !errorMessage && !isVerified && (
        <span className="text-xs text-rose-600 font-medium mt-1">
          {externalError}
        </span>
      )}

      {successMessage && !isVerified && (
        <div className="mt-1.5 p-2 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
