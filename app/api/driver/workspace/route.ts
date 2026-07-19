import { neonAuth } from "@neondatabase/auth/next/server";
import { buildWorkspace } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { user } = await neonAuth();
    const authUserId = user ? String(user.id) : null;
    const { searchParams } = new URL(request.url);
    const zone = searchParams.get("zone");

    const workspace = await buildWorkspace(authUserId, zone);
    return Response.json(workspace);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load workspace.";
    return Response.json({ error: message }, { status: 500 });
  }
}
