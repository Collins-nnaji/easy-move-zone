import type { Metadata } from "next";
import { BRAND } from "@/lib/brand";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL
  ? new URL(process.env.NEXT_PUBLIC_APP_URL)
  : new URL(BRAND.url);

export const siteMetadata: Metadata = {
  metadataBase: siteUrl,
  title: {
    default: `${BRAND.name} — ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description: BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "used cars",
    "car finance",
    "part exchange",
    "CFR cars",
    "imported cars",
    "cars for sale",
    "UK cars",
    "US cars",
    "Nigeria cars",
    "Lagos used cars",
    "EasyMoveZone",
  ],
  authors: [{ name: BRAND.name }],
  creator: BRAND.name,
  publisher: BRAND.name,
  category: "business",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: BRAND.name,
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [
      {
        url: BRAND.logo,
        width: 512,
        height: 315,
        alt: BRAND.logoAlt,
      },
    ],
  },
  twitter: {
    card: "summary",
    title: `${BRAND.name} — ${BRAND.tagline}`,
    description: BRAND.description,
    images: [BRAND.logo],
  },
  appleWebApp: {
    capable: true,
    title: BRAND.shortName,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/icon.png"],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};
