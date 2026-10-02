import { NextRequest, NextResponse } from "next/server";
import { authApiHandler } from "@neondatabase/auth/next/server";

export const dynamic = "force-dynamic";
const upstream = authApiHandler();

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  // Try to revoke the remote session as well as ending this browser's session.
  // A provider outage must not prevent a user from signing out locally.
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const result = await Promise.race([
      upstream.POST(request, { params: Promise.resolve({ path: ["sign-out"] }) }),
      new Promise<never>((_, reject) => {
        timeout = setTimeout(() => reject(new Error("Sign-out timed out")), 5000);
      }),
    ]);
    if (!result.ok) console.warn("[auth/sign-out] Remote session revocation failed.");
  } catch {
    console.warn("[auth/sign-out] Remote session revocation unavailable.");
  } finally {
    clearTimeout(timeout);
  }

  const response = NextResponse.json({ success: true }, {
    headers: { "Cache-Control": "no-store" },
  });
  const names = new Set([
    "__Secure-neon-auth.session_token",
    "__Secure-neon-auth.session_data",
    "__Secure-neon-auth.session_challange",
    ...request.cookies.getAll().map(cookie => cookie.name).filter(name =>
      name.startsWith("__Secure-neon-auth.") || name.startsWith("neon-auth.")),
  ]);
  for (const name of names) {
    response.cookies.set(name, "", {
      path: "/", maxAge: 0, expires: new Date(0), httpOnly: true,
      secure: name.startsWith("__Secure-") || request.nextUrl.protocol === "https:",
      sameSite: "lax",
    });
  }
  return response;
}
