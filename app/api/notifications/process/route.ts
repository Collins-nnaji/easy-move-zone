import { NextResponse } from "next/server";
import { deliverUpdates } from "@/lib/marketplace/notifications";
export async function POST(request: Request) {
  if (
    !process.env.CRON_SECRET ||
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  )
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    return NextResponse.json(await deliverUpdates());
  } catch {
    return NextResponse.json({ error: "Queue unavailable" }, { status: 503 });
  }
}
