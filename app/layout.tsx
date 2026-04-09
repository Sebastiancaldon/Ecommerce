/**
 * ============================================================
 * VISTA - Layout Principal (MVC)
 * ============================================================
 * Cumplimiento: ISO 9001, ISO/IEC 25000 - Usabilidad
 * ============================================================
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/context/auth-context";
import { CartProvider } from "@/lib/context/cart-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MODA - E-Commerce de Ropa",
  description:
    "Sistema de E-Commerce de Ropa desarrollado con arquitectura MVC. Cumple normas ISO 9001, IEEE 730, ISO/IEC 25000, CMMI.",
  keywords: ["e-commerce", "ropa", "moda", "tienda online", "MVC"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="font-sans antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </CartProvider>
        </AuthProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
