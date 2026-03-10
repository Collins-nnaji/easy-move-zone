import type { Metadata } from "next";
import { Manrope, Cormorant_Garamond, Sora } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const outfit = Manrope({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Sora({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const playfairDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyMoveZone Homes — Buy & Sell Property Platform",
  description:
    "A modern property ownership platform for Nigeria and Africa: verified listings, city intelligence, trusted agents, and buy/sell support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} min-h-screen flex flex-col`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
