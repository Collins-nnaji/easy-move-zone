import { neonAuth } from "@neondatabase/auth/next/server";
import { buildFleetWorkspace } from "@/lib/fleet/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { user } = await neonAuth();
    const authUserId = user ? String(user.id) : null;
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");
    const vehicleType = searchParams.get("vehicleType");

    const workspace = await buildFleetWorkspace(authUserId, { zone, vehicleType });
    return Response.json(workspace);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load fleet workspace.";
    return Response.json({ error: message }, { status: 500 });
  }
}
