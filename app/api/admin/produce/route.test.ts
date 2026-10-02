import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CATALOG } from "@/lib/produce/model";
const mocks = vi.hoisted(() => ({
  assertAdmin: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
}));
vi.mock("@/lib/auth/assert-admin-api", () => ({
  assertAdminApi: mocks.assertAdmin,
  AdminForbiddenError: class extends Error {},
}));
vi.mock("@/lib/produce/store", () => ({
  readCatalog: mocks.read,
  writeCatalog: mocks.write,
}));
import { AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { GET, POST } from "./route";
const request = (body: unknown, origin = "http://localhost") =>
  new Request("http://localhost/api/admin/produce", {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.assertAdmin.mockResolvedValue({ id: "admin" });
  mocks.read.mockResolvedValue({
    catalog: structuredClone(DEFAULT_CATALOG),
    revision: 2,
  });
  mocks.write.mockResolvedValue(3);
});
describe("catalogue admin API", () => {
  it("blocks anonymous reads and writes before touching the store", async () => {
    mocks.assertAdmin.mockRejectedValue(new AdminForbiddenError());
    expect((await GET()).status).toBe(403);
    expect((await POST(request({}))).status).toBe(403);
    expect(mocks.read).not.toHaveBeenCalled();
    expect(mocks.write).not.toHaveBeenCalled();
  });
  it("rejects cross-origin mutations", async () => {
    expect((await POST(request({}, "https://other.example"))).status).toBe(403);
    expect(mocks.write).not.toHaveBeenCalled();
  });
  it("rejects stale edits so another admin’s changes are preserved", async () => {
    const response = await POST(
      request({
        revision: 1,
        collection: "lots",
        action: "update",
        data: DEFAULT_CATALOG.lots[0],
      }),
    );
    expect(response.status).toBe(409);
    expect(mocks.write).not.toHaveBeenCalled();
  });
  it("creates a listing, then allows its price and published state to change", async () => {
    const data = {
      ...DEFAULT_CATALOG.lots[0],
      id: "new-lot",
      imageUrl: "https://example.com/photo.png",
    };
    const created = await POST(
      request({ revision: 2, collection: "lots", action: "create", data }),
    );
    expect(created.status).toBe(200);
    const first = await created.json();
    expect(
      first.catalog.lots.find((l: { id: string }) => l.id === "new-lot")
        .imageUrl,
    ).toBe(data.imageUrl);
    mocks.read.mockResolvedValue({ catalog: first.catalog, revision: 3 });
    mocks.write.mockResolvedValue(4);
    const updated = await POST(
      request({
        revision: 3,
        collection: "lots",
        action: "update",
        data: { ...data, pricePerTonne: 999999, active: false },
      }),
    );
    expect(updated.status).toBe(200);
    const result = await updated.json();
    expect(
      result.catalog.lots.find((l: { id: string }) => l.id === "new-lot"),
    ).toMatchObject({ pricePerTonne: 999999, active: false });
  });
  it("prevents removing a location still referenced by a route", async () => {
    const response = await POST(
      request({
        revision: 2,
        collection: "places",
        action: "delete",
        id: "makurdi",
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.write).not.toHaveBeenCalled();
  });
  it("reports a conflict if another writer saves between read and write", async () => {
    mocks.write.mockResolvedValue(undefined);
    const response = await POST(
      request({
        revision: 2,
        collection: "settings",
        action: "update",
        data: DEFAULT_CATALOG.settings,
      }),
    );
    expect(response.status).toBe(409);
  });
});
