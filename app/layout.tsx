import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
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

// UI and body — a geometric grotesque that stays crisp in nav, forms and dense consoles.
const jakarta = Manrope({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Display — an editorial serif for headings. Variable names stay --font-jakarta
// and --font-bricolage so existing stylesheets pick the new faces up.
const bricolage = Newsreader({
  subsets: ["latin"],
  variable: "--font-bricolage",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = siteMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Font variables live on <html> so :root-level tokens (the property
    // site's --font-sans / --font-display) can resolve them.
    <html lang="en" className={`${jakarta.variable} ${bricolage.variable}`} suppressHydrationWarning>
      <body className="min-h-screen min-w-0 flex flex-col overflow-x-hidden antialiased">
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
