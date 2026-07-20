import { neonAuth } from "@neondatabase/auth/next/server";
import { deletePushSubscription, savePushSubscription } from "@/lib/notify/push";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return Response.json({ error: "Invalid subscription." }, { status: 400 });
    }

    await savePushSubscription(
      String(user.id),
      {
        endpoint: body.endpoint,
        keys: { p256dh: body.keys.p256dh, auth: body.keys.auth },
      },
      request.headers.get("user-agent") ?? undefined,
    );
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to save subscription.";
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });
    const body = (await request.json()) as { endpoint?: string };
    if (!body.endpoint) return Response.json({ error: "endpoint required" }, { status: 400 });
    await deletePushSubscription(String(user.id), body.endpoint);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to remove subscription.";
    return Response.json({ error: message }, { status: 400 });
  }
}
