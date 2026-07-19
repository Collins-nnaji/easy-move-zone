import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import "./globals.css";

// App-like mobile behaviour: lock zoom (no pinch / no focus-zoom on inputs)
// and extend under the notch/home-indicator so fixed bars sit flush.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f6f3ec",
  // When the on-screen keyboard opens, shrink the layout viewport so fixed
  // bars and bottom sheets reflow above it instead of being covered.
  interactiveWidget: "resizes-content",
};

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
  title: "EasyMoveZone — Relocate and settle in, with AI guidance in your pocket",
  description:
    "Moving abroad for work, school, or a visa? EasyMoveZone scores your eligibility, builds document checklists, and guides you through settling in for destinations worldwide — without the consultant fees.",
  metadataBase: process.env.NEXT_PUBLIC_APP_URL
    ? new URL(process.env.NEXT_PUBLIC_APP_URL)
    : undefined,
  openGraph: {
    type: "website",
    siteName: "EasyMoveZone",
    title: "EasyMoveZone — Relocation & settlement, powered by AI",
    description:
      "Work visas, school admissions, and settling in — sorted by AI tools built for movers, students, and remote workers.",
  },
  twitter: {
    card: "summary_large_image",
    title: "EasyMoveZone — Relocation & settlement, powered by AI",
    description:
      "Work visas, school admissions, and settling in — sorted by AI tools built for movers, students, and remote workers.",
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
