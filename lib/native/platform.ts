/**
 * Small, dependency-light helpers for reasoning about the runtime platform.
 *
 * These are safe to import from anywhere — including server components and the
 * web bundle. They never statically import a native plugin; the actual
 * Capacitor plugins are only loaded (dynamically) inside client code that has
 * already confirmed it is running in the native shell.
 */

/** True only when running inside the Capacitor native shell (iOS/Android app). */
export function isNativeApp(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

/** "ios" | "android" | "web" — usable on the client; returns "web" on the server. */
export function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: { getPlatform?: () => string } }).Capacitor;
  const platform = cap?.getPlatform?.();
  return platform === "ios" || platform === "android" ? platform : "web";
}
