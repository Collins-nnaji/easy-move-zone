/** Keep authentication redirects on this site and away from auth loops. */
export function safeAuthRedirect(requested: string | null): string {
  if (!requested?.startsWith("/") || requested.startsWith("//") || /[\\\x00-\x20]/.test(requested)) return "/book";
  const target = new URL(requested, "https://auth.local");
  if (target.origin !== "https://auth.local" || target.pathname === "/auth" || target.pathname.startsWith("/auth/") || target.pathname.startsWith("/api/")) return "/book";
  return `${target.pathname}${target.search}${target.hash}`;
}
