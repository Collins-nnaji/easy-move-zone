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
  title: "EasyMoveZonne — Find Your Territory. Make Your Move.",
  description:
    "EasyMoveZonne helps you scout the right city, secure the right property, and relocate with confidence from discovery to settled.",
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
