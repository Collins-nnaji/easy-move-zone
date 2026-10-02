import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";
const mocks = vi.hoisted(() => ({ middleware: vi.fn(), proxy: vi.fn() }));
vi.mock("@neondatabase/auth/next/server", () => ({ neonAuthMiddleware: () => mocks.middleware }));
vi.mock("@/lib/auth/proxy", () => ({ forwardAuthRequest: mocks.proxy }));
import middleware from "../../middleware";

describe("authentication middleware", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.middleware.mockResolvedValue(NextResponse.next()); });
  it.each(["/auth", "/auth/callback"])("forwards a verifier from skipped auth landing %s", async (path) => {
    const response = await middleware(new NextRequest(`https://example.com${path}?redirect=%2Fprofile&neon_auth_session_verifier=one-time`));
    expect(response.headers.get("location")).toBe("https://example.com/profile?neon_auth_session_verifier=one-time");
    expect(mocks.middleware).not.toHaveBeenCalled();
  });
  it("exchanges a verifier on a public destination", async () => {
    await middleware(new NextRequest("https://example.com/book?neon_auth_session_verifier=one-time"));
    expect(mocks.middleware).toHaveBeenCalledOnce();
  });
  it("exchanges Google callback cookies without splitting Expires dates", async () => {
    const headers = new Headers();
    headers.append("set-cookie", "__Secure-neon-auth.session_token=sample; Path=/");
    headers.append("set-cookie", "__Secure-neon-auth.session_data=sample; Expires=Wed, 01 Jan 2031 00:00:00 GMT; Path=/");
    mocks.proxy.mockResolvedValue(Response.json({ session: { id: "sample" }, user: { id: "sample" } }, { headers }));
    const response = await middleware(new NextRequest("https://example.com/profile?neon_auth_session_verifier=once", {
      headers: { cookie: "__Secure-neon-auth.session_challange=challenge" },
    }));
    expect(response.headers.get("location")).toBe("https://example.com/profile");
    expect(response.headers.getSetCookie()).toHaveLength(2);
    expect(mocks.middleware).not.toHaveBeenCalled();
  });
  it("returns a failed Google exchange to sign-in with its original destination", async () => {
    mocks.proxy.mockResolvedValue(Response.json(null));
    const response = await middleware(new NextRequest("https://example.com/profile?neon_auth_session_verifier=once", {
      headers: { cookie: "__Secure-neon-auth.session_challange=challenge" },
    }));
    const target = new URL(response.headers.get("location")!);
    expect(target.pathname).toBe("/auth");
    expect(target.searchParams.get("redirect")).toBe("/profile");
    expect(target.searchParams.get("error")).toBe("oauth");
  });
  it("returns users to the protected destination after signing in", async () => {
    mocks.middleware.mockResolvedValue(NextResponse.redirect("https://example.com/auth"));
    const response = await middleware(new NextRequest("https://example.com/profile?tab=account"));
    expect(new URL(response.headers.get("location")!).searchParams.get("redirect")).toBe("/profile?tab=account");
  });
  it("allows public pages without requiring a session", async () => {
    await middleware(new NextRequest("https://example.com/book"));
    expect(mocks.middleware).not.toHaveBeenCalled();
  });
});
