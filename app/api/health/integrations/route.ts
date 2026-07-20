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
    stripe: { configured: isStripeConfigured },
    email: { configured: Boolean(process.env.RESEND_API_KEY?.trim()) },
    sms: { configured: isTwilioConfigured() },
    push: { configured: isWebPushConfigured() },
    sentry: { configured: isSentryConfigured() },
    maps: {
      mode: "openstreetmap",
      note: "GPS clock-in + OSM embed; optional MAPBOX_TOKEN reserved for future tiles",
    },
    ...(aiTest ? { aiTest } : {}),
  })
}
