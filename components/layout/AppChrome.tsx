"use client";

import { usePathname } from "next/navigation";
import { ClientErrorBoundary } from "@/components/monitoring/ClientErrorBoundary";

/**
 * /auth is a Next.js page with its own centred layout. Every other URL is the
 * property site (app/property-app, moving included), which renders its own
 * navbar, footer and phone tab bar.
 */
export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth" || pathname.startsWith("/auth/");

  return (
    <ClientErrorBoundary>
      {isAuth ? (
        <main className="min-h-0 min-w-0 flex-1">{children}</main>
      ) : (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
      )}
    </ClientErrorBoundary>
  );
}
