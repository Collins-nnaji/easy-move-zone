/** Proxy Neon Auth without joining cookies or forwarding stale compression headers. */
export async function forwardAuthRequest(request: Request, path: string[]) {
  const base = process.env.NEON_AUTH_BASE_URL;
  if (!base) return Response.json({ error: { message: "Sign-in is temporarily unavailable." } }, { status: 503 });
  if (path.some(part => !part || part === "." || part === ".." || /[/\\]/.test(part))) {
    return Response.json({ error: { message: "Invalid authentication request." } }, { status: 400 });
  }
  const incoming = new URL(request.url);
  const target = new URL(`${base.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}`);
  target.search = incoming.search;
  const headers = new Headers();
  for (const name of ["user-agent", "authorization", "referer", "content-type"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  headers.set("origin", request.headers.get("origin") || incoming.origin);
  headers.set("X-Neon-Auth-Next-Middleware", "true");
  const cookies = (request.headers.get("cookie") || "").split(";").map(value => value.trim())
    .filter(value => value.startsWith("__Secure-neon-auth."));
  if (cookies.length) headers.set("cookie", cookies.join("; "));
  try {
    const upstream = await fetch(target, {
      method: request.method, headers, cache: "no-store", redirect: "manual",
      body: ["GET", "HEAD"].includes(request.method) ? undefined : await request.text(),
      signal: AbortSignal.timeout(15000),
    });
    const responseHeaders = new Headers({ "Cache-Control": "no-store" });
    for (const name of ["content-type", "location", "set-auth-jwt", "set-auth-token", "x-neon-ret-request-id"]) {
      const value = upstream.headers.get(name);
      if (value) responseHeaders.set(name, value);
    }
    for (const cookie of upstream.headers.getSetCookie()) responseHeaders.append("Set-Cookie", cookie);
    return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return Response.json({ error: { message: "We couldn’t reach sign-in. Please try again." } }, {
      status: 502, headers: { "Cache-Control": "no-store" },
    });
  }
}
