import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

// Body / UI text — clean, modern, excellent readability
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// Display headings — geometric, bold, contemporary
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyMoveZone — Trusted Land & Property in Nigeria",
  description:
    "The trusted land and property platform for Nigerian professionals, diaspora, and returnees. Every listing is title-verified. Every transaction is guided end to end.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${bricolage.variable} min-h-screen min-w-0 flex flex-col overflow-x-hidden antialiased`}
      >
        <AppChrome>{children}</AppChrome>
      </body>
    </html>
  );
}
