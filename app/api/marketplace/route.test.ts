import { beforeEach, describe, it, expect, vi } from "vitest";
vi.mock("@/lib/auth/session", () => ({
  requireSessionUser: vi.fn(async () => ({
    userId: "customer",
    email: "customer@example.com",
    name: "Customer",
  })),
}));
vi.mock("@/lib/auth/assert-admin-api", () => ({
  assertAdminApi: vi.fn(),
  AdminForbiddenError: class extends Error {},
}));
vi.mock("@/lib/moving/store", () => ({ getMove: vi.fn(), listMoves: vi.fn() }));
vi.mock("@/lib/moving/worker-store", () => ({
  resolveWorkerForUser: vi.fn(async () => null),
  listWorkers: vi.fn(async () => []),
}));
vi.mock("@/lib/marketplace/moves", () => ({
  customerMoves: vi.fn(async () => []),
  changeMove: vi.fn(),
}));
vi.mock("@/lib/marketplace/store", () => ({
  account: vi.fn(async () => ({ addresses: [], business: null })),
  pricing: vi.fn(),
  getRecord: vi.fn(),
  putRecord: vi.fn(),
  listRecords: vi.fn(async () => []),
  workerExtras: vi.fn(),
  marketplaceDb: vi.fn(),
}));
vi.mock("@/lib/marketplace/notifications", () => ({
  queueUpdate: vi.fn(),
  deliverUpdates: vi.fn(),
}));
import { requireSessionUser } from "@/lib/auth/session";
import { getMove } from "@/lib/moving/store";
import { getRecord, putRecord } from "@/lib/marketplace/store";
import { POST, GET } from "./route";
const ref = "EMZ-12345678123441238123123456789012";
const request = (data: unknown) =>
  new Request("https://example.com/api/marketplace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      origin: "https://example.com",
    },
    body: JSON.stringify(data),
  });
describe("customer ownership and immutable evidence", () => {
  beforeEach(() => vi.clearAllMocks());
  it("requires a session for account data", async () => {
    vi.mocked(requireSessionUser).mockResolvedValueOnce(null);
    expect(
      (await GET(new Request("https://example.com/api/marketplace"))).status,
    ).toBe(401);
  });
  it("prevents access to another customer's move", async () => {
    vi.mocked(getMove).mockResolvedValueOnce({
      reference: ref,
      userId: "someone-else",
      status: "completed",
    } as never);
    expect(
      (
        await POST(
          request({
            action: "review",
            reference: ref,
            rating: 5,
            text: "Great move",
          }),
        )
      ).status,
    ).toBe(403);
    expect(putRecord).not.toHaveBeenCalled();
  });
  it("only permits reviews after completion and holds them for publication", async () => {
    vi.mocked(getMove).mockResolvedValue({
      reference: ref,
      userId: "customer",
      status: "scheduled",
      name: "Ada Customer",
    } as never);
    expect(
      (
        await POST(
          request({
            action: "review",
            reference: ref,
            rating: 5,
            text: "Great move",
          }),
        )
      ).status,
    ).toBe(400);
    vi.mocked(getMove).mockResolvedValueOnce({
      reference: ref,
      userId: "customer",
      status: "completed",
      name: "Ada Customer",
    } as never);
    expect(
      (
        await POST(
          request({
            action: "review",
            reference: ref,
            rating: 5,
            text: "Great move",
            published: true,
          }),
        )
      ).status,
    ).toBe(200);
    expect(putRecord).toHaveBeenCalledWith(
      "review",
      ref,
      expect.objectContaining({ published: false, name: "Ada" }),
      "customer",
    );
  });
  it("rejects edits to a signed checklist", async () => {
    vi.mocked(getMove).mockResolvedValueOnce({
      reference: ref,
      userId: "customer",
    } as never);
    vi.mocked(getRecord).mockResolvedValueOnce({
      signedAt: "2026-10-10T00:00:00Z",
    });
    expect(
      (
        await POST(
          request({
            action: "checklist",
            reference: ref,
            phase: "pickup",
            items: [],
          }),
        )
      ).status,
    ).toBe(409);
    expect(putRecord).not.toHaveBeenCalled();
  });
  it("rejects cross-origin writes and null bodies", async () => {
    const cross = new Request("https://example.com/api/marketplace", {
      method: "POST",
      headers: { origin: "https://evil.example" },
      body: "{}",
    });
    expect((await POST(cross)).status).toBe(403);
    expect((await POST(request(null))).status).toBe(400);
  });
});
