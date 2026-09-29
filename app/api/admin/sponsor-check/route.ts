import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import {
  checkDistinctSponsors,
  checkJobSponsors,
  clearCheckResults,
  clearVisaTags,
  deleteRegister,
  importRegisterRows,
  listRegisters,
  sponsorCheckQueue,
  sponsorCheckSummary,
  type RegisterRowInput,
} from "@/lib/career/sponsor-check"

export const runtime = "nodejs"
export const maxDuration = 60

const toIds = (value: unknown) =>
  Array.isArray(value) ? value.map(Number).filter((id) => Number.isInteger(id) && id > 0) : []

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const [registers, summary] = await Promise.all([listRegisters(), sponsorCheckSummary()])
    return NextResponse.json({ registers, summary })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>

  try {
    switch (body.action) {
      case "check": {
        const ids = toIds(body.ids).slice(0, 1000)
        const results = await checkJobSponsors(ids, { applyTags: body.applyTags !== false })
        return NextResponse.json({ results })
      }
      case "check-companies": {
        const result = await checkDistinctSponsors({
          limit: Number(body.limit) || 40,
          before: typeof body.before === "string" ? body.before : null,
          country: typeof body.country === "string" ? body.country : null,
          applyTags: body.applyTags !== false,
        })
        return NextResponse.json(result)
      }
      case "queue": {
        const queue = await sponsorCheckQueue({
          limit: Number(body.limit) || 500,
          before: typeof body.before === "string" ? body.before : null,
          country: typeof body.country === "string" ? body.country : null,
        })
        return NextResponse.json(queue)
      }
      case "clear-tags": {
        const cleared = await clearVisaTags(toIds(body.ids))
        return NextResponse.json({ cleared })
      }
      case "clear-results": {
        await clearCheckResults()
        return NextResponse.json({ ok: true })
      }
      case "import-register": {
        const rows = Array.isArray(body.rows) ? (body.rows as RegisterRowInput[]).slice(0, 5000) : []
        const result = await importRegisterRows({
          country: String(body.country ?? ""),
          label: typeof body.label === "string" ? body.label : null,
          visaType: typeof body.visaType === "string" ? body.visaType : null,
          sourceUrl: typeof body.sourceUrl === "string" ? body.sourceUrl : null,
          rows,
          replace: Boolean(body.replace),
        })
        return NextResponse.json(result)
      }
      case "delete-register": {
        await deleteRegister(String(body.id ?? ""))
        return NextResponse.json({ ok: true })
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Request failed" }, { status: 500 })
  }
}
