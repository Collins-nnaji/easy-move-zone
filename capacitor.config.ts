import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Capacitor configuration for the EasyMoveZone native apps (iOS App Store +
 * Google Play). The web product is a server-rendered Next.js app, so rather
 * than bundling a static export the native shell loads the live deployment in
 * a hardened WebView and layers native capabilities (splash, status bar,
 * push, safe areas, hardware back) on top.
 *
 * Nothing here affects the web build — this file is only read by the
 * `@capacitor/cli` when building the iOS/Android projects.
 *
 * The production URL is taken from CAP_SERVER_URL (falls back to the public
 * app URL, then the marketing domain) so staging/prod can be swapped without
 * code changes.
 */
const origin = (
  process.env.CAP_SERVER_URL?.trim() ||
  process.env.NEXT_PUBLIC_APP_URL?.trim() ||
  "https://easymovezone.com"
).replace(/\/+$/, "");
// Open the app on the role chooser (Company / Driver). Override the landing
// path with CAP_ENTRY_PATH if needed.
const entryPath = process.env.CAP_ENTRY_PATH?.trim() || "/start";
const serverUrl = `${origin}${entryPath}`;

const config: CapacitorConfig = {
  appId: "com.easymovezone.app",
  appName: "EasyMoveZone",
  // Bundled web assets. We ship the live site via `server.url`, but Capacitor
  // still requires a local webDir to exist; `native/www` holds a lightweight
  // offline fallback shell.
  webDir: "native/www",
  backgroundColor: "#f6f3ec",
  server: {
    // Load the live, server-rendered app. Comment this block out (and rely on
    // webDir) only if you move to a fully static export.
    url: serverUrl,
    cleartext: false,
    // Keep navigations to our own domain inside the app; everything else
    // (Paystack/Stripe checkout, external links) opens in the system browser.
    allowNavigation: [
      "easymovezone.com",
      "*.easymovezone.com",
      "*.netlify.app",
    ],
  },
  ios: {
    contentInset: "always",
    backgroundColor: "#f6f3ec",
    // Allow the WebView to hand off to SFSafariViewController / system browser
    // for payment providers and OAuth.
    limitsNavigationsToAppBoundDomains: false,
  },
  android: {
    backgroundColor: "#f6f3ec",
    allowMixedContent: false,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: false,
      backgroundColor: "#f6f3ec",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#f6f3ec",
      overlaysWebView: false,
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    Keyboard: {
      resize: "native",
    },
  },
};

export default config;
