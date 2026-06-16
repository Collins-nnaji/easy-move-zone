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
  title: "EasyMoveZone — One app for every kind of move",
  description:
    "Book your trip, find a place to stay, and sort your visa in one place. EasyMoveZone plans your whole move around how long you're staying — two weeks or forever.",
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
