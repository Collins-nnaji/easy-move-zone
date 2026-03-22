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
  title: "EasyMoveZone — Trusted Land & Property in Africa",
  description:
    "The trusted land and property platform for African professionals, diaspora, and returnees. Every listing is title-verified. Every transaction is guided end to end.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} ${spaceGrotesk.variable} ${playfairDisplay.variable} min-h-screen min-w-0 flex flex-col overflow-x-hidden`}>
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
