import { NextResponse } from "next/server";
import { releaseMaturedHoldbacks } from "@/lib/escrow/service";
import { flagNoShows } from "@/lib/disputes/service";

export const runtime = "nodejs";

/**
 * Time-driven escrow work: release holdbacks whose dispute window closed, and
 * auto-flag loads claimed but never picked up.
 *
 * Intended for a scheduled call (Vercel cron / Netlify scheduled function).
 * Protected by CRON_SECRET when set.
 */
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET?.trim();
  if (secret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  try {
    const [released, noShows] = await Promise.all([
      releaseMaturedHoldbacks(),
      flagNoShows(),
    ]);

    return NextResponse.json({
      ok: true,
      holdbacksReleased: released.length,
      releasedCents: released.reduce((sum, r) => sum + r.releasedCents, 0),
      noShowsFlagged: noShows.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Maintenance run failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
