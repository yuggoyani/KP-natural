import React from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { OrderRecord, OrderItemRecord } from "@/types/database";

/**
 * Format Date to DD-MM-YYYY or localized full date
 */
export function formatInvoiceDate(dateString?: string | null): string {
  const date = dateString ? new Date(dateString) : new Date();
  if (isNaN(date.getTime())) {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Client-Side Trigger: Generate and Download PDF Invoice from DOM Template
 * Renders high-resolution A4 PDF preserving the exact final invoice design
 */
export async function downloadInvoicePdf(order: OrderRecord, items: OrderItemRecord[]) {
  if (typeof window === "undefined") return;

  const fileName = `KP-Natural-Dairy-Farm-Invoice-${order.order_id}.pdf`;

  try {
    // 1. Look for existing rendered template on page
    let element = document.getElementById("kp-invoice-printable");

    let cleanup = false;
    let tempContainer: HTMLElement | null = null;

    // 2. If element is not in DOM, create a hidden container
    if (!element) {
      cleanup = true;
      tempContainer = document.createElement("div");
      tempContainer.style.position = "fixed";
      tempContainer.style.left = "-9999px";
      tempContainer.style.top = "0";
      tempContainer.style.zIndex = "-1000";
      tempContainer.style.width = "800px";
      tempContainer.style.minHeight = "1130px";
      document.body.appendChild(tempContainer);

      const { createRoot } = await import("react-dom/client");
      const { InvoiceTemplate } = await import("@/components/invoice/InvoiceTemplate");

      const root = createRoot(tempContainer);
      root.render(React.createElement(InvoiceTemplate, { order, items }));

      // Wait for React to render and images to load
      await new Promise((resolve) => setTimeout(resolve, 350));
      element = tempContainer.querySelector("#kp-invoice-printable") as HTMLElement;
    }

    if (!element) {
      throw new Error("Could not find invoice template element for PDF generation");
    }

    // 3. Render high-res canvas (scale 2.5 for crisp print quality)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#FAF7F0",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.98);

    // 4. Create A4 jsPDF instance (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth(); // 210mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
    pdf.save(fileName);

    // Cleanup if temporary container was used
    if (cleanup && tempContainer && tempContainer.parentNode) {
      tempContainer.parentNode.removeChild(tempContainer);
    }

    return true;
  } catch (err) {
    console.error("Failed to generate invoice PDF via canvas, opening direct print preview:", err);
    window.open(`/invoice/${order.order_id}`, "_blank");
  }
}
