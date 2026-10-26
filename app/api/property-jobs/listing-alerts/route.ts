import { NextResponse } from "next/server"

/*
 * Saved-search alerts: emails people when a new live listing matches a search
 * they saved. Schedule a POST here every few hours with
 * `Authorization: Bearer <CRON_SECRET>` — the same secret as rent reminders.
 */
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function POST(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  try {
    const server = await import("@/property/server/index.js")
    const { ensureDb } = (server.default ?? server) as { ensureDb: () => Promise<void> }
    const alerts = await import("@/property/server/services/alerts.js")
    const { runListingAlerts } = (alerts.default ?? alerts) as { runListingAlerts: () => Promise<unknown> }
    const background = await import("@/property/server/background.js")
    const { flush } = (background.default ?? background) as { flush: () => Promise<void> }
    await ensureDb()
    const result = await runListingAlerts()
    await flush()
    return NextResponse.json(result)
  } catch (err) {
    console.error("Listing alerts failed:", err)
    return NextResponse.json({ error: "Listing alerts failed" }, { status: 500 })
  }
}
