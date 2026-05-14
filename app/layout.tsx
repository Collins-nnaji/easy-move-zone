import type { Metadata } from "next";
import { Inter, DM_Sans } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyMoveZone — The Relocation OS",
  description:
    "The operating system for moving and settling. From 'I think I want to move' to 'I live here now' — in one personalised dashboard. AI-powered area recommendations, housing matches, and guided relocation journeys.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${dmSans.variable} min-h-screen min-w-0 flex flex-col overflow-x-hidden antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
