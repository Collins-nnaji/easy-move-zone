import { NextResponse } from "next/server"
import { chatJson, getAiProvider, getAzureOpenAiConfig } from "@/lib/ai/openai"
import { isStripeConfigured } from "@/lib/payments/stripe"
import { isTwilioConfigured } from "@/lib/notify/sms"
import { isWebPushConfigured } from "@/lib/notify/push"
import { isSentryConfigured } from "@/lib/monitoring/sentry"

/**
 * GET — reports which integrations are configured (no secrets).
 * Optional ?testAi=1 runs a tiny Azure/OpenAI call (uses a few tokens).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testAi = searchParams.get("testAi") === "1"

  const aiProvider = getAiProvider()
  const azureOpenAi = getAzureOpenAiConfig()

  let aiTest: { ok: boolean; message?: string } | undefined
  if (testAi && aiProvider) {
    const ping = await chatJson<{ pong: boolean }>(
      "Reply with exactly this JSON and nothing else: {\"pong\":true}",
      "ping",
      { pong: false },
    )
    aiTest = { ok: ping.pong === true, message: ping.pong ? "Completion OK" : "Unexpected model output" }
  }

  const has = (name: string) => Boolean(process.env[name]?.trim())

  // Launch-readiness integrations (see docs/launch-readiness-ui-integrations.md).
  const paystackConfigured = has("PAYSTACK_SECRET_KEY")
  const flutterwaveConfigured = has("FLUTTERWAVE_SECRET_KEY")
  const paymentsProvider = (process.env.PAYMENTS_PROVIDER?.trim() || "stripe").toLowerCase()
  const localPayoutsReady = paystackConfigured || flutterwaveConfigured
  const mapboxConfigured = has("MAPBOX_TOKEN") || has("NEXT_PUBLIC_MAPBOX_TOKEN")
  const realtimeConfigured = has("PUSHER_KEY") || has("ABLY_API_KEY")
  const kycConfigured = has("DOJAH_API_KEY") || has("SMILE_API_KEY")
  const objectStorageConfigured =
    (has("R2_ACCESS_KEY_ID") && has("R2_BUCKET")) || has("BLOB_READ_WRITE_TOKEN") || has("S3_BUCKET")
  const localSmsConfigured = has("TERMII_API_KEY") || has("AT_API_KEY")
  const analyticsConfigured = has("NEXT_PUBLIC_POSTHOG_KEY")

  return NextResponse.json({
    ai: {
      provider: aiProvider,
      azure: azureOpenAi
        ? {
            endpoint: azureOpenAi.endpoint,
            deployment: azureOpenAi.deployment,
            apiVersion: azureOpenAi.apiVersion,
          }
        : null,
      openaiConfigured: !!process.env.OPENAI_API_KEY?.trim(),
    },
    payments: {
      provider: paymentsProvider,
      stripe: { configured: isStripeConfigured },
      paystack: { configured: paystackConfigured },
      flutterwave: { configured: flutterwaveConfigured },
      // Stripe cannot pay out to Nigerian banks — a local rail is needed for real cash-out.
      localPayoutsReady,
      note: localPayoutsReady
        ? undefined
        : "No Nigerian payout rail configured — cash-outs stay on the in-app ledger.",
    },
    // Kept for backwards compatibility with existing callers.
    stripe: { configured: isStripeConfigured },
    email: { configured: Boolean(process.env.RESEND_API_KEY?.trim()) },
    sms: { configured: isTwilioConfigured() },
    localSms: { configured: localSmsConfigured },
    push: { configured: isWebPushConfigured() },
    sentry: { configured: isSentryConfigured() },
    analytics: { configured: analyticsConfigured },
    kyc: { configured: kycConfigured },
    objectStorage: { configured: objectStorageConfigured },
    realtime: { configured: realtimeConfigured },
    maps: {
      mode: mapboxConfigured ? "mapbox" : "openstreetmap",
      mapboxConfigured,
      note: mapboxConfigured
        ? "Mapbox token present — interactive tiles, routing, and geocoding available."
        : "GPS clock-in + OSM embed; set MAPBOX_TOKEN for routes, ETA, and live tracking.",
    },
    ...(aiTest ? { aiTest } : {}),
  })
}
