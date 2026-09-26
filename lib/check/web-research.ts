import type { CheckSource } from "./types"

const OFFICIAL_PAGES: Record<string, Array<{ title: string; url: string }>> = {
  "united-kingdom": [
    { title: "UK Skilled Worker visa", url: "https://www.gov.uk/skilled-worker-visa" },
    { title: "UK work visas overview", url: "https://www.gov.uk/browse/visas-immigration/work-visas" },
    { title: "UK sponsor a skilled worker", url: "https://www.gov.uk/uk-visa-sponsorship-employers" },
  ],
  canada: [
    { title: "IRCC Express Entry", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/immigrate-canada/express-entry.html" },
    { title: "IRCC work in Canada", url: "https://www.canada.ca/en/immigration-refugees-citizenship/services/work-canada.html" },
  ],
  germany: [
    { title: "Germany Opportunity Card", url: "https://www.make-it-in-germany.com/en/visa-residence/types/opportunity-card" },
    { title: "Germany work visa overview", url: "https://www.make-it-in-germany.com/en/visa-residence/types/work-visa" },
  ],
  australia: [
    { title: "Australia skilled migration", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing/skilled-independent-189" },
    { title: "Australia work visas", url: "https://immi.homeaffairs.gov.au/visas/getting-a-visa/visa-listing" },
  ],
  netherlands: [
    { title: "Netherlands highly skilled migrant", url: "https://ind.nl/en/residence-permits/work/highly-skilled-migrant" },
  ],
  ireland: [
    { title: "Ireland Critical Skills Employment Permit", url: "https://enterprise.gov.ie/en/what-we-do/workplace-and-skills/employment-permits/permit-types/critical-skills-employment-permit/" },
  ],
  portugal: [
    { title: "Portugal D7 / residence overview", url: "https://www.sef.pt/en/pages/conteudo-detalhe.aspx?nID=93" },
  ],
  "united-arab-emirates": [
    { title: "UAE work / residency overview", url: "https://u.ae/en/information-and-services/jobs/working-in-the-private-sector" },
  ],
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim()
}

async function fetchPageSnippet(url: string, title: string): Promise<CheckSource | null> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EasyMoveZoneCheck/1.0 (+https://easymovezone.com)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return { title, url, snippet: `Official page returned HTTP ${res.status}.` }
    const html = await res.text()
    const text = stripHtml(html).slice(0, 1800)
    return { title, url, snippet: text || undefined }
  } catch {
    return { title, url, snippet: "Could not fetch this page right now; treat as a reference link." }
  }
}

async function duckDuckGoSearch(query: string): Promise<CheckSource[]> {
  try {
    const res = await fetch(`https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`, {
      headers: {
        "User-Agent": "EasyMoveZoneCheck/1.0",
        Accept: "text/html",
      },
      signal: AbortSignal.timeout(9000),
    })
    if (!res.ok) return []
    const html = await res.text()
    const results: CheckSource[] = []
    const linkRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
    const snipRe = /class="result__snippet"[^>]*>([\s\S]*?)<\/(?:a|td|div)>/gi
    const links: Array<{ url: string; title: string }> = []
    let match: RegExpExecArray | null
    while ((match = linkRe.exec(html)) && links.length < 5) {
      const href = match[1] || ""
      const title = stripHtml(match[2] || "").slice(0, 120)
      const urlMatch = href.match(/uddg=([^&]+)/)
      const url = urlMatch ? decodeURIComponent(urlMatch[1]) : href
      if (!url.startsWith("http")) continue
      links.push({ url, title: title || url })
    }
    const snippets: string[] = []
    while ((match = snipRe.exec(html)) && snippets.length < 5) {
      snippets.push(stripHtml(match[1] || "").slice(0, 280))
    }
    for (let i = 0; i < links.length; i++) {
      results.push({
        title: links[i]!.title,
        url: links[i]!.url,
        snippet: snippets[i],
      })
    }
    return results
  } catch {
    return []
  }
}

/** OpenAI Responses API web search when available (skipped for Azure-only setups). */
async function openAiWebSearch(query: string): Promise<CheckSource[]> {
  const key = process.env.OPENAI_API_KEY?.trim()
  if (!key) return []
  try {
    const res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        tools: [{ type: "web_search_preview" }],
        input: `Find current official immigration and work-visa requirements relevant to: ${query}. Prefer government sites.`,
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return []
    const data = (await res.json()) as {
      output_text?: string
      output?: Array<{ type?: string; content?: Array<{ type?: string; text?: string; annotations?: Array<{ type?: string; url?: string; title?: string }> }> }>
    }
    const sources: CheckSource[] = []
    for (const item of data.output ?? []) {
      for (const part of item.content ?? []) {
        for (const ann of part.annotations ?? []) {
          if (ann.url) {
            sources.push({
              title: ann.title || ann.url,
              url: ann.url,
              snippet: (part.text || data.output_text || "").slice(0, 400),
            })
          }
        }
      }
    }
    if (sources.length === 0 && data.output_text) {
      sources.push({
        title: "Web research summary",
        url: "https://openai.com",
        snippet: data.output_text.slice(0, 800),
      })
    }
    return sources.slice(0, 6)
  } catch {
    return []
  }
}

export async function researchMoveChances(input: {
  fromCountry: string
  toCountry: string
  toSlug: string
  targetRole: string
  needsSponsorship: boolean
}): Promise<CheckSource[]> {
  const query = [
    `${input.toCountry} work visa`,
    input.needsSponsorship ? "employer sponsorship" : "skilled migration",
    input.targetRole,
    `from ${input.fromCountry}`,
    "official requirements 2025 2026",
  ].join(" ")

  const official = OFFICIAL_PAGES[input.toSlug] ?? [
    { title: `${input.toCountry} immigration`, url: `https://www.google.com/search?q=${encodeURIComponent(`${input.toCountry} official immigration work visa`)}` },
  ]

  const [officialSnippets, ddg, openai] = await Promise.all([
    Promise.all(official.slice(0, 3).map((page) => fetchPageSnippet(page.url, page.title))),
    duckDuckGoSearch(query),
    openAiWebSearch(query),
  ])

  const merged: CheckSource[] = []
  const seen = new Set<string>()
  for (const source of [...officialSnippets.filter(Boolean), ...openai, ...ddg] as CheckSource[]) {
    const key = source.url.replace(/\/$/, "").toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    merged.push(source)
    if (merged.length >= 10) break
  }
  return merged
}

export function formatSourcesForPrompt(sources: CheckSource[]): string {
  if (!sources.length) return "No live web sources were retrieved."
  return sources
    .map((source, index) => {
      const snip = source.snippet ? `\nSnippet: ${source.snippet.slice(0, 700)}` : ""
      return `[${index + 1}] ${source.title}\nURL: ${source.url}${snip}`
    })
    .join("\n\n")
}
