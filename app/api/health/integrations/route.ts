import { NextResponse } from "next/server"
import { isAzureConfigured } from "@/lib/storage/azure"
import { chatJson, getAiProvider, getAzureOpenAiConfig } from "@/lib/ai/openai"

/**
 * GET — reports which integrations are configured (no secrets).
 * Optional ?testAi=1 runs a tiny Azure/OpenAI call (uses a few tokens).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const testAi = searchParams.get("testAi") === "1"

  let azureBlob = { configured: false as boolean, containerExists: false as boolean, error: null as string | null }

  if (isAzureConfigured()) {
    azureBlob.configured = true
    try {
      const { BlobServiceClient } = await import("@azure/storage-blob")
      const conn = process.env.AZURE_STORAGE_CONNECTION_STRING!
      const container = process.env.AZURE_STORAGE_CONTAINER ?? "properties"
      const svc = BlobServiceClient.fromConnectionString(conn)
      const cont = svc.getContainerClient(container)
      azureBlob.containerExists = await cont.exists()
    } catch (e) {
      azureBlob.error = e instanceof Error ? e.message : "Unknown blob error"
    }
  }

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
    azureBlob,
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
    ...(aiTest ? { aiTest } : {}),
  })
}
