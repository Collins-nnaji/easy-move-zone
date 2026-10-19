import { NextResponse } from "next/server"

/*
 * Rent: marks unpaid charges past their due date overdue and sends due-soon and
 * overdue reminders (property/server/services/rent.js). Serverless hosting has
 * no long-running timer, so schedule a POST here every few hours with
 * `Authorization: Bearer <CRON_SECRET>` — the same secret as
 * /api/notifications/process.
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
    const rent = await import("@/property/server/services/rent.js")
    const { runRentReminders } = (rent.default ?? rent) as { runRentReminders: () => Promise<unknown> }
    const background = await import("@/property/server/background.js")
    const { flush } = (background.default ?? background) as { flush: () => Promise<void> }
    await ensureDb()
    const result = await runRentReminders()
    await flush()
    return NextResponse.json(result)
  } catch (err) {
    console.error("Rent reminders failed:", err)
    return NextResponse.json({ error: "Rent reminders failed" }, { status: 500 })
  }
}
