import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { forwardAuthRequest } from "./proxy";
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubEnv("NEON_AUTH_BASE_URL", "https://auth.example/neondb/auth");
  vi.stubGlobal("fetch", fetchMock); fetchMock.mockReset();
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });
describe("authentication proxy", () => {
  it("preserves separate session cookies and removes decoded-body compression headers", async () => {
    const headers = new Headers({ "content-type": "application/json", "content-encoding": "gzip", "content-length": "999" });
    headers.append("set-cookie", "__Secure-neon-auth.session_token=value; Path=/; HttpOnly");
    headers.append("set-cookie", "__Secure-neon-auth.session_data=cache; Expires=Wed, 01 Jan 2031 00:00:00 GMT; Path=/");
    fetchMock.mockResolvedValue(new Response('{"user":{"id":"sample"}}', { headers }));
    const response = await forwardAuthRequest(new Request("https://site.example/api/auth/get-session?disableCookieCache=true", {
      headers: { cookie: "__Secure-neon-auth.session_token=sample; unrelated=private" },
    }), ["get-session"]);
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(response.headers.get("content-encoding")).toBeNull();
    expect(response.headers.get("content-length")).toBeNull();
    expect(response.headers.get("cache-control")).toBe("no-store");
    const [url, options] = fetchMock.mock.calls[0];
    expect(url.href).toBe("https://auth.example/neondb/auth/get-session?disableCookieCache=true");
    expect(options.headers.get("cookie")).toBe("__Secure-neon-auth.session_token=sample");
    expect(options.headers.get("origin")).toBe("https://site.example");
  });
  it("forwards email requests and provider errors without caching", async () => {
    fetchMock.mockResolvedValue(Response.json({ message: "Invalid credentials" }, { status: 401 }));
    const response = await forwardAuthRequest(new Request("https://site.example/api/auth/sign-in/email", {
      method: "POST", headers: { "content-type": "application/json" }, body: '{"email":"sample@example.com"}',
    }), ["sign-in", "email"]);
    expect(response.status).toBe(401);
    expect(fetchMock.mock.calls[0][1].body).toBe('{"email":"sample@example.com"}');
  });
  it("returns a recoverable error when the provider cannot be reached", async () => {
    fetchMock.mockRejectedValue(new Error("network"));
    expect((await forwardAuthRequest(new Request("https://site.example/api/auth/get-session"), ["get-session"])).status).toBe(502);
  });
  it("rejects path traversal before forwarding", async () => {
    expect((await forwardAuthRequest(new Request("https://site.example/api/auth/test"), [".."])).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
