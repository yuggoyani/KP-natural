import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0F5E3D",
};
import { arupalaGrotesk } from "@/lib/fonts";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "KP Natural Dairy Farm | Pure Farm Products & Organic Vermicompost",
  description:
    "KP Natural Dairy Farm delivers pure, unadulterated farm offerings. Explore our 100% organic Vermicompost Fertilizer and upcoming farm-fresh dairy staples.",
  keywords: [
    "KP Natural Dairy Farm",
    "Vermicompost Organic Fertilizer",
    "Natural Dairy",
    "Organic Farm",
    "Pure Farm Products",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={arupalaGrotesk.variable}>
      <body className="font-sans antialiased bg-brand-ivory text-brand-text-primary flex flex-col min-h-screen">
        <CartProvider>
          <Navbar />
          <main className="flex-grow">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
