import type { Metadata } from "next";
import { Inter, Manrope, Cormorant_Garamond, Sora } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

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
  title: "EasyMoveZone — Africa's Agro Logistics Platform",
  description:
    "Move your harvest, not just your home. EasyMoveZone connects African farmers, transporters, and buyers — trusted agro logistics across Nigeria and beyond.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="overflow-x-hidden" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} min-h-screen min-w-0 flex flex-col overflow-x-hidden antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
