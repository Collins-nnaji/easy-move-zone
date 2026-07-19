import { neonAuth } from "@neondatabase/auth/next/server";
import { postShift } from "@/lib/fleet/service";
import type { PostShiftInput } from "@/lib/driver/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as PostShiftInput;
    const id = await postShift(String(user.id), body);
    return Response.json({ id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to post shift.";
    return Response.json({ error: message }, { status: 400 });
  }
}
