# EasyMoveZone — iOS & Android apps

This repo ships **one codebase** to web, iOS, and Google Play. The native apps
are thin [Capacitor](https://capacitorjs.com) shells that load the live,
server-rendered Next.js site in a hardened WebView and add native capabilities
(splash screen, status bar, safe areas, hardware back button, and real
APNs/FCM push). The web app is unchanged — none of the native wiring runs in a
browser.

> **Why a WebView shell and not a static export?** The product is fully
> server-rendered (React Server Components, API routes, Neon auth, Stripe /
> Paystack checkout). A static export would drop all of that. The shell keeps a
> single source of truth: ship the web app, and both stores get the update
> instantly — no native rebuild for content/feature changes.

---

## What was added (and what stays untouched)

| Added for mobile | Purpose |
| --- | --- |
| `capacitor.config.ts` | App id, name, the live URL to load, native plugin config |
| `components/native/NativeBridge.tsx` | Client component — **no-op on web**; wires native features when in the app |
| `lib/native/platform.ts` | Safe `isNativeApp()` / `getPlatform()` helpers |
| `app/api/driver/push/native/route.ts` | Stores APNs/FCM device tokens |
| `lib/notify/native-push.ts` | FCM HTTP v1 sender (env-gated) + token storage |
| `db/migrations/20260724_native_push_tokens.sql` | `driver_native_push_tokens` table |
| `native/www/index.html` | Offline fallback shell |
| `assets/logo.png` | Source image for generating icons + splash |
| `.native-app` CSS block in `app/globals.css` | Safe-area padding, only inside the app |

Everything above is additive and guarded. The web build, routes, and behaviour
are unchanged — `NativeBridge` renders `null` and runs zero effects in a
browser, and native push delivery is skipped unless `FCM_*` env is set.

---

## One-time setup (on a Mac for iOS; Mac/Linux/Windows for Android)

Prerequisites:

- **Node 20+** and this repo's deps: `npm install`
- **iOS:** macOS + Xcode 15+, CocoaPods (`sudo gem install cocoapods`), an
  Apple Developer account ($99/yr)
- **Android:** Android Studio (Giraffe+) + JDK 17, a Google Play Developer
  account ($25 one-time)

Add the native platforms (creates the git-ignored `ios/` and `android/`
folders):

```bash
npm install
npx cap add ios       # macOS only
npx cap add android
```

Generate app icons and splash screens from `assets/logo.png`
(**replace it with a 1024×1024 PNG first** for best quality). This pulls the
`@capacitor/assets` generator on demand via `npx` (it needs `sharp`, so it is
not a hard dependency of the app):

```bash
npm run cap:assets
```

Point the shell at the environment you want to bundle (defaults to the prod
domain if unset):

```bash
export CAP_SERVER_URL=https://easymovezone.com
npx cap sync
```

`cap sync` copies config + web fallback and installs native plugin pods/gradle
deps. Re-run it after changing `capacitor.config.ts`, plugins, or env.

---

## Run / build

```bash
npm run cap:open:ios       # opens Xcode
npm run cap:open:android   # opens Android Studio
```

From there, run on a simulator/emulator or a physical device as usual.

Because the app loads the live site, **most changes need no native rebuild** —
ship the web deploy and the apps pick it up. You only rebuild + resubmit when
you change `capacitor.config.ts`, native plugins, icons/splash, or store
metadata.

---

## Push notifications (native)

Native push uses **Firebase Cloud Messaging (HTTP v1)** for both platforms
(APNs is routed through FCM on iOS).

1. Create a Firebase project. Add an iOS app and an Android app using the
   bundle/app id `com.easymovezone.app`.
2. **Android:** download `google-services.json` into `android/app/`.
3. **iOS:** download `GoogleService-Info.plist` into `ios/App/App/`, enable the
   Push Notifications + Background Modes (Remote notifications) capabilities in
   Xcode, and upload your APNs auth key to Firebase.
4. Add the FCM plugin dependency the platforms expect (Capacitor's
   `@capacitor/push-notifications` handles the JS bridge; native FCM libs are
   pulled by the platform config above).
5. Set the server env from a Firebase **service-account JSON**:

   ```bash
   FCM_PROJECT_ID=your-project-id
   FCM_CLIENT_EMAIL=firebase-adminsdk-xxxx@your-project-id.iam.gserviceaccount.com
   FCM_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

Flow: on first launch the app requests permission, registers, and POSTs the
device token to `/api/driver/push/native`. Any existing call to
`sendMarketplacePush(...)` now also delivers to native devices — no call sites
changed. Without `FCM_*`, tokens are still stored and delivery is silently
skipped (web push keeps working independently).

---

## Submitting to the stores

### Apple App Store

1. In Xcode: set the Team, bump **Version**/**Build**, archive
   (`Product → Archive`), and upload to App Store Connect.
2. In App Store Connect: fill listing (name, subtitle, description, keywords),
   screenshots (6.7" + 5.5" iPhone required), privacy policy URL
   (`/legal`), and the **App Privacy** questionnaire — declare location, contact
   info, and identifiers as used.
3. Because the app wraps web content, be ready to show reviewers the native
   value (push, offline shell, safe-area chrome). Submit for review.

### Google Play

1. In Android Studio: set `versionCode`/`versionName`, then
   `Build → Generate Signed Bundle` → **Android App Bundle (.aab)**. Keep the
   keystore safe.
2. In the Play Console: create the app, upload the `.aab` to a track
   (internal → closed → production), complete the Data Safety form, content
   rating, and privacy policy URL.
3. Roll out to internal testing first, then production.

---

## Versioning

Bump the marketing version in `package.json` and set the matching native
`Version`/`Build` (iOS) and `versionName`/`versionCode` (Android) before each
store submission. The app id is `com.easymovezone.app` on both platforms —
keep it stable or you lose update continuity.
