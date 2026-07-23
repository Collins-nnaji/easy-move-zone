import { neonAuth } from "@neondatabase/auth/next/server";
import { isAdminEmail } from "@/lib/auth/admin";

export const runtime = "nodejs";

/**
 * Lightweight admin check for the client — lets the app show an "Admin console"
 * entry point only to users on the admin_users allowlist. Never exposes any
 * privileged data; just a boolean.
 */
export async function GET() {
  try {
    const { user } = await neonAuth();
    const admin = await isAdminEmail(user?.email);
    return Response.json({ admin });
  } catch {
    return Response.json({ admin: false });
  }
}
