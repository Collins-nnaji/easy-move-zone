"use client";

import { usePathname } from "next/navigation";
import { PlatformNav } from "@/components/platform/PlatformNav";
import { PlatformFooter } from "@/components/platform/PlatformFooter";
import { SupportWidget } from "@/components/platform/SupportWidget";
import { ClientErrorBoundary } from "@/components/monitoring/ClientErrorBoundary";
import { LANDING_HREFS } from "@/lib/seo/landing-pages";

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/");
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");
  const showFooter =
    pathname === "/" ||
    pathname.startsWith("/legal/") ||
    pathname === "/contact" ||
    LANDING_HREFS.includes(pathname);

  if (isAuth) {
    return (
      <ClientErrorBoundary>
        <main className="flex-1 min-w-0">
          {children}
          <SupportWidget />
        </main>
      </ClientErrorBoundary>
    );
  }

  return (
    <ClientErrorBoundary>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {!isAdmin && <PlatformNav />}
        <main className="min-h-0 min-w-0 flex-1">{children}</main>
        {showFooter && <PlatformFooter />}
        {!isAdmin && <SupportWidget />}
      </div>
    </ClientErrorBoundary>
  );
}
