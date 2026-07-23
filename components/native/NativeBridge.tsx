"use client";

/**
 * NativeBridge wires the web app into native iOS/Android capabilities when it
 * runs inside the Capacitor shell. On the web it renders nothing and runs no
 * effects — every code path is guarded by `isNativeApp()` and the native
 * plugins are loaded with dynamic `import()` so they are never part of the web
 * bundle's execution.
 *
 * Responsibilities on native:
 *   - Hide the splash screen once the WebView is ready.
 *   - Style the status bar to match the brand chrome.
 *   - Add a `.native-app` / `.native-ios` / `.native-android` class to <html>
 *     so CSS can add safe-area padding for the notch / home indicator.
 *   - Route the Android hardware back button through the app history.
 *   - Register for native push (APNs / FCM) and hand the device token to the
 *     backend; deep-link on notification tap.
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPlatform, isNativeApp } from "@/lib/native/platform";

const BRAND_BG = "#f6f3ec";

export function NativeBridge() {
  const router = useRouter();

  useEffect(() => {
    if (!isNativeApp()) return;

    const platform = getPlatform();
    const cleanups: Array<() => void> = [];
    let cancelled = false;

    const root = document.documentElement;
    root.classList.add("native-app", `native-${platform}`);

    async function init() {
      // --- Splash screen: reveal the app once React has mounted ---------------
      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide({ fadeOutDuration: 250 });
      } catch {
        /* plugin not installed / not native */
      }

      // --- Status bar styling -------------------------------------------------
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Light });
        if (platform === "android") {
          await StatusBar.setBackgroundColor({ color: BRAND_BG });
          await StatusBar.setOverlaysWebView({ overlay: false });
        }
      } catch {
        /* ignore */
      }

      // --- Android hardware back button --------------------------------------
      try {
        const { App } = await import("@capacitor/app");
        const backHandle = await App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack && window.history.length > 1) {
            window.history.back();
          } else {
            void App.exitApp();
          }
        });
        cleanups.push(() => void backHandle.remove());

        // Deep links: easymovezone.com/... → in-app navigation
        const urlHandle = await App.addListener("appUrlOpen", ({ url }) => {
          try {
            const parsed = new URL(url);
            const path = `${parsed.pathname}${parsed.search}${parsed.hash}`;
            if (path && path !== "/") router.push(path);
          } catch {
            /* ignore malformed url */
          }
        });
        cleanups.push(() => void urlHandle.remove());
      } catch {
        /* ignore */
      }

      // --- Native push notifications -----------------------------------------
      try {
        const { PushNotifications } = await import("@capacitor/push-notifications");

        const registrationHandle = await PushNotifications.addListener(
          "registration",
          (token) => {
            void fetch("/api/driver/push/native", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: token.value, platform }),
            }).catch(() => {});
          },
        );
        cleanups.push(() => void registrationHandle.remove());

        const tapHandle = await PushNotifications.addListener(
          "pushNotificationActionPerformed",
          (action) => {
            const url = (action.notification.data?.url as string | undefined) ?? "/";
            if (url && url !== "/") router.push(url);
          },
        );
        cleanups.push(() => void tapHandle.remove());

        const perm = await PushNotifications.checkPermissions();
        if (perm.receive === "prompt") {
          const req = await PushNotifications.requestPermissions();
          if (req.receive === "granted") await PushNotifications.register();
        } else if (perm.receive === "granted") {
          await PushNotifications.register();
        }
      } catch {
        /* push plugin unavailable */
      }

      if (cancelled) cleanups.forEach((fn) => fn());
    }

    void init();

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
    // router is stable across renders in the app router
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
