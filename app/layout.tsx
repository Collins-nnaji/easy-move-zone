import type { Metadata } from "next";
import { Outfit, Playfair_Display, Space_Grotesk } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyMoveZone — Platform Blueprint",
  description:
    "EasyMoveZone connects businesses to African markets — and African businesses to the world through intelligence, execution, and advisory.",
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
