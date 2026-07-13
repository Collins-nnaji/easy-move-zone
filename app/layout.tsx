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
  title: "EasyMoveZone — Relocate and settle in, with an AI agency in your pocket",
  description:
    "Moving abroad for work, school, or a visa? EasyMoveZone is your AI-powered relocation agency — eligibility, document checklists, and settling-in guidance for destinations worldwide, without the consultant fees.",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    type: "website",
    siteName: "EasyMoveZone",
    title: "EasyMoveZone — Relocation & settlement, powered by AI",
    description:
      "Work visas, school admissions, and settling in — sorted by an AI relocation agency built for movers, students, and remote workers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyMoveZone — Relocation & settlement, powered by AI",
    description:
      "Work visas, school admissions, and settling in — sorted by an AI relocation agency built for movers, students, and remote workers.",
  },
  icons: {
    icon: "/emz.png",
    shortcut: "/emz.png",
    apple: "/emz.png",
  },
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
