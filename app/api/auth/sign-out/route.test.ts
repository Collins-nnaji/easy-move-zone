import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
const mocks = vi.hoisted(() => ({ post: vi.fn() }));
vi.mock("@neondatabase/auth/next/server", () => ({ authApiHandler: () => ({ POST: mocks.post }) }));
import { POST } from "./route";

function request(origin = "https://example.com") {
  return new NextRequest("https://example.com/api/auth/sign-out", {
    method: "POST", headers: {
      origin,
      cookie: "__Secure-neon-auth.session_token=test; __Secure-neon-auth.session_data=cache; neon-auth.session_token=local; preference=keep",
    },
  });
}

describe("sign out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.post.mockResolvedValue(new Response('{"success":true}'));
  });
  it("revokes the session and independently expires all received auth cookies", async () => {
    const response = await POST(request());
    expect(mocks.post).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
    for (const name of ["__Secure-neon-auth.session_token", "__Secure-neon-auth.session_data", "neon-auth.session_token"]) {
      expect(response.cookies.get(name)).toMatchObject({ value: "", path: "/", maxAge: 0, httpOnly: true, secure: true });
    }
    expect(response.cookies.get("preference")).toBeUndefined();
    expect(response.headers.getSetCookie().length).toBeGreaterThan(1);
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
  it("ends the local browser session even when the auth provider rejects revocation", async () => {
    mocks.post.mockResolvedValue(new Response("unavailable", { status: 503 }));
    const response = await POST(request());
    expect(response.status).toBe(200);
    expect(response.cookies.get("__Secure-neon-auth.session_token")?.maxAge).toBe(0);
  });
  it("ends the local session when the auth provider throws", async () => {
    mocks.post.mockRejectedValue(new Error("offline"));
    const response = await POST(request());
    expect(response.cookies.get("__Secure-neon-auth.session_token")?.maxAge).toBe(0);
  });
  it("does not leave sign-out waiting indefinitely for the provider", async () => {
    vi.useFakeTimers();
    try {
      mocks.post.mockReturnValue(new Promise(() => {}));
      const pending = POST(request());
      await vi.advanceTimersByTimeAsync(5000);
      const response = await pending;
      expect(response.cookies.get("__Secure-neon-auth.session_token")?.maxAge).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("rejects cross-origin requests before revoking or clearing cookies", async () => {
    const response = await POST(request("https://another.example"));
    expect(response.status).toBe(403);
    expect(mocks.post).not.toHaveBeenCalled();
    expect(response.cookies.getAll()).toHaveLength(0);
  });
});
