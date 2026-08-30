"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import Image from "next/image";
import { QrCode, Sparkles, Smartphone, ExternalLink } from "lucide-react";

interface DynamicUpiQrProps {
  amount: number;
  orderId: string;
  payeeUpi?: string;
  payeeName?: string;
}

export function DynamicUpiQr({
  amount,
  orderId,
  payeeUpi = "shailesh03k@okaxis",
  payeeName = "Shailesh Kankotia",
}: DynamicUpiQrProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [upiUri, setUpiUri] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(true);

  useEffect(() => {
    if (!amount || amount <= 0) return;

    setIsGenerating(true);

    // Format amount with 2 decimal places if needed or clean integer
    const formattedAmount = Number(amount).toFixed(2);
    const encodedPayee = encodeURIComponent(payeeName);
    const note = encodeURIComponent(`KP Natural Dairy Farm Order ${orderId || ""}`.trim());

    // Standard NPCI UPI URI specifications
    // upi://pay?pa=shailesh03k@okaxis&pn=Shailesh%20Kankotia&am=700.00&cu=INR&tn=KP%20Natural%20Dairy%20Farm%20Order%20KP-20260830-XXXX
    const generatedUri = `upi://pay?pa=${payeeUpi}&pn=${encodedPayee}&am=${formattedAmount}&cu=INR&tn=${note}`;
    setUpiUri(generatedUri);

    // Generate high-resolution, high-contrast QR Data URL
    QRCode.toDataURL(generatedUri, {
      errorCorrectionLevel: "H",
      margin: 1.5,
      width: 600,
      color: {
        dark: "#0F5E3D", // Brand Primary Green
        light: "#FFFFFF",
      },
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl);
        setIsGenerating(false);
      })
      .catch((err) => {
        console.error("Failed to generate dynamic UPI QR code:", err);
        setIsGenerating(false);
      });
  }, [amount, orderId, payeeUpi, payeeName]);

  return (
    <div className="flex flex-col items-center">
      {/* QR Code Presentation Box */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-farm-lg overflow-hidden border-2 border-brand-green/40 bg-white p-3 shadow-md flex items-center justify-center">
        {isGenerating || !qrDataUrl ? (
          <div className="flex flex-col items-center gap-3 animate-pulse text-brand-green">
            <QrCode className="w-10 h-10 animate-spin text-brand-green/60" />
            <span className="text-xs font-semibold text-brand-text-secondary">
              Generating Dynamic QR...
            </span>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <Image
              src={qrDataUrl}
              alt={`Dynamic UPI QR Code for ₹${amount} - KP Natural Dairy Farm`}
              fill
              priority
              sizes="256px"
              className="object-contain"
            />
          </div>
        )}

        {/* Small Dynamic Amount Overlay Badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-brand-green text-[10px] font-bold text-brand-ivory shadow-xs flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-brand-ivory" />
          <span>Auto: ₹{Number(amount).toLocaleString("en-IN")}</span>
        </div>
      </div>

      {/* Direct Mobile UPI App Launcher */}
      {upiUri && (
        <a
          href={upiUri}
          className="mt-3.5 sm:hidden inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-farm bg-brand-green text-brand-ivory font-semibold text-xs shadow-subtle hover:bg-[#0A472E] active:scale-[0.98] transition-all"
        >
          <Smartphone className="w-4 h-4" />
          <span>Tap to Pay ₹{Number(amount).toLocaleString("en-IN")} via UPI App</span>
          <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
        </a>
      )}
    </div>
  );
}
