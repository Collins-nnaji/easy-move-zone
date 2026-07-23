import { neonAuth } from "@neondatabase/auth/next/server";
import { deleteNativePushToken, saveNativePushToken } from "@/lib/notify/native-push";

export const runtime = "nodejs";

/** Register an APNs/FCM device token from the native iOS/Android app. */
export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as { token?: string; platform?: string };
    const platform = body.platform === "ios" || body.platform === "android" ? body.platform : null;
    if (!body.token || !platform) {
      return Response.json({ error: "token and platform required." }, { status: 400 });
    }

    await saveNativePushToken(String(user.id), body.token, platform);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to save device token.";
    return Response.json({ error: message }, { status: 400 });
  }
}

/** Remove a device token (sign-out / uninstall best-effort). */
export async function DELETE(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });
    const body = (await request.json()) as { token?: string };
    if (!body.token) return Response.json({ error: "token required." }, { status: 400 });
    await deleteNativePushToken(body.token);
    return Response.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to remove device token.";
    return Response.json({ error: message }, { status: 400 });
  }
}
