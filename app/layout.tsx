import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import { AppChrome } from "@/components/layout/AppChrome";
import { NativeBridge } from "@/components/native/NativeBridge";
import { AuthSessionCleanup } from "@/components/platform/AuthSessionCleanup";
import { ToastProvider } from "@/components/ui/Toast";
import { GoogleAnalytics } from "@/components/seo/GoogleAnalytics";
import { JsonLd, organizationSchema, websiteSchema } from "@/components/seo/JsonLd";
import { BRAND } from "@/lib/brand";
import { siteMetadata } from "@/lib/site-metadata";
import "./globals.css";

// App-like mobile behaviour: lock zoom (no pinch / no focus-zoom on inputs)
// and extend under the notch/home-indicator so fixed bars sit flush.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: BRAND.backgroundColor,
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

export const metadata: Metadata = siteMetadata;

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
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <GoogleAnalytics />
        <ToastProvider>
          <NativeBridge />
          <AuthSessionCleanup />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <AppChrome>{children}</AppChrome>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
