/**
 * Azure OpenAI + fallback OpenAI client for property AI features.
 *
 * Priority: Azure OpenAI (if configured) → OpenAI (fallback)
 *
 * Env vars:
 *   AZURE_OPENAI_API_KEY
 *   AZURE_OPENAI_ENDPOINT        (e.g. https://YOUR_RESOURCE.openai.azure.com — trailing slash OK)
 *   AZURE_OPENAI_DEPLOYMENT      (your Azure deployment name, e.g. gpt-4o-mini)
 *   AZURE_OPENAI_API_VERSION     (e.g. 2024-02-15-preview — must match what your resource supports)
 *   OPENAI_API_KEY               (fallback when Azure is not set)
 */
import OpenAI from "openai"

const azureKey = process.env.AZURE_OPENAI_API_KEY?.trim()
const azureEndpoint = (process.env.AZURE_OPENAI_ENDPOINT ?? "").replace(/\/+$/, "")
const azureDeployment = (process.env.AZURE_OPENAI_DEPLOYMENT ?? "gpt-4o").trim()
const azureApiVersion =
  (process.env.AZURE_OPENAI_API_VERSION ?? "2024-08-01-preview").trim()
const openaiKey = process.env.OPENAI_API_KEY?.trim()

function buildAzureClient(): OpenAI | null {
  if (!azureKey || !azureEndpoint) return null
  const baseURL = `${azureEndpoint}/openai/deployments/${azureDeployment}`
  return new OpenAI({
    apiKey: azureKey,
    baseURL,
    defaultQuery: { "api-version": azureApiVersion },
    defaultHeaders: { "api-key": azureKey },
  })
}

function buildOpenAiClient(): OpenAI | null {
  if (!openaiKey) return null
  return new OpenAI({ apiKey: openaiKey })
}

function getClient(): OpenAI | null {
  return buildAzureClient() ?? buildOpenAiClient()
}

const client = getClient()

export type AiProvider = "azure-openai" | "openai" | null

export function getAiProvider(): AiProvider {
  if (azureKey && azureEndpoint) return "azure-openai"
  if (openaiKey) return "openai"
  return null
}

export function getAzureOpenAiConfig(): {
  endpoint: string
  deployment: string
  apiVersion: string
} | null {
  if (!azureKey || !azureEndpoint) return null
  return {
    endpoint: azureEndpoint,
    deployment: azureDeployment,
    apiVersion: azureApiVersion,
  }
}

export async function chatJson<T>(
  systemPrompt: string,
  userPrompt: string,
  fallback: T,
): Promise<T> {
  if (!client) return fallback
  try {
    const completion = await client.chat.completions.create({
      model: getAiProvider() === "azure-openai" ? azureDeployment : "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 1000,
    })
    const content = completion.choices[0]?.message?.content?.trim() ?? ""
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return fallback
    return JSON.parse(jsonMatch[0]) as T
  } catch (e) {
    if (process.env.AI_DEBUG_LOG === "1") {
      console.error("[chatJson]", e)
    }
    return fallback
  }
}

export async function chatStream(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!client) return "AI features are not configured."
  try {
    const completion = await client.chat.completions.create({
      model: getAiProvider() === "azure-openai" ? azureDeployment : "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 800,
    })
    return completion.choices[0]?.message?.content?.trim() ?? ""
  } catch (e) {
    if (process.env.AI_DEBUG_LOG === "1") {
      console.error("[chatStream]", e)
    }
    return "Unable to process your request right now."
  }
}

export { client as openaiClient }
