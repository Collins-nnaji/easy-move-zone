import { NextRequest, NextResponse } from "next/server"
import { authServer } from "@/lib/auth/server"
import { chatStream, chatJson } from "@/lib/ai/openai"

export async function POST(req: NextRequest) {
  const session = await authServer.getSession()
  if (!session?.data?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { field, value, context } = await req.json()

  const systemPrompt = `You are a Nigerian property listing assistant for EasyMoveZone.
Your job is to help property owners write compelling, accurate, and professional listing content.
Be concise and practical. Always write in English. Focus on Nigerian property market context (Lagos, Abuja, Port Harcourt, etc).`

  let result: string | Record<string, string> = ""

  if (field === "title_suggestions") {
    // Return 3 title options as a JSON array
    const raw = await chatStream(
      systemPrompt,
      `Write 3 alternative property listing titles for this property.
Context: ${JSON.stringify(context)}
Current title: "${value ?? ""}"
Return exactly 3 titles, one per line, no numbering, no explanation, no quotes.`
    )
    result = raw.split("\n").map(l => l.trim()).filter(Boolean).slice(0, 3).join("\n")
  } else if (field === "title_refine") {
    result = await chatStream(
      systemPrompt,
      `Improve this property listing title. Make it more specific, compelling, and searchable.
Current title: "${value}"
Context: ${JSON.stringify(context)}
Return only the improved title, nothing else.`
    )
  } else if (field === "description") {
    result = await chatStream(
      systemPrompt,
      `Write a professional property description for this listing.
Context: ${JSON.stringify(context)}
Keep it factual, appealing, and under 150 words. Include key selling points: location, size, type, listing type.
Return only the description text, no labels or headers.`
    )
  } else if (field === "description_refine") {
    result = await chatStream(
      systemPrompt,
      `Improve this property description. Make it more professional, detailed, and compelling.
Current description: "${value}"
Context: ${JSON.stringify(context)}
Return only the improved description, nothing else.`
    )
  } else if (field === "price") {
    result = await chatStream(
      systemPrompt,
      `Suggest a realistic asking price for this Nigerian property.
Context: ${JSON.stringify(context)}
Return a brief 1-2 sentence answer with a specific price or price range in Naira (₦). Be specific about the location and property type.`
    )
  } else if (field === "prefill") {
    // Generate title + description + price all at once
    const data = await chatJson<{ title: string; description: string; price_ngn: string }>(
      systemPrompt,
      `Generate a complete property listing for this property.
Context: ${JSON.stringify(context)}

Return a JSON object with exactly these fields:
{
  "title": "compelling listing title (max 80 chars)",
  "description": "professional description under 150 words with key selling points",
  "price_ngn": "realistic asking price as a number string in Naira, no symbols (e.g. '85000000')"
}
Only return valid JSON, no explanation.`,
      { title: "", description: "", price_ngn: "" }
    )
    result = data as unknown as Record<string, string>
  } else if (field === "chat") {
    result = await chatStream(
      systemPrompt,
      `The property owner has a question: "${value}"
Context about their listing: ${JSON.stringify(context)}
Answer helpfully and concisely in 2-3 sentences.`
    )
  } else {
    return NextResponse.json({ error: "Unknown field" }, { status: 400 })
  }

  return NextResponse.json({ result })
}
