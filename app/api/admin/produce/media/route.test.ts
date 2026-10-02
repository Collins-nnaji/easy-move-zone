import { beforeEach, describe, expect, it, vi } from "vitest";
import sharp from "sharp";
import { DEFAULT_CATALOG } from "@/lib/produce/model";
const mocks = vi.hoisted(() => ({
  guard: vi.fn(),
  sql: vi.fn(),
  read: vi.fn(),
}));
vi.mock("@/lib/auth/assert-admin-api", () => ({
  assertAdminApi: vi.fn(),
  AdminForbiddenError: class extends Error {},
}));
vi.mock("@/lib/produce/admin-api", async () => {
  const original = await vi.importActual<
    typeof import("@/lib/produce/admin-api")
  >("@/lib/produce/admin-api");
  return { ...original, guardAdmin: mocks.guard };
});
vi.mock("@/lib/produce/store", () => ({
  ensureProduceStore: vi.fn(),
  database: () => mocks.sql,
  readCatalog: mocks.read,
}));
import { POST, DELETE } from "./route";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.guard.mockResolvedValue(undefined);
  mocks.sql.mockResolvedValue([]);
  mocks.read.mockResolvedValue({ catalog: structuredClone(DEFAULT_CATALOG) });
});
describe("admin picture library", () => {
  it("decodes and optimises a real picture before storing it", async () => {
    const image = await sharp({
      create: { width: 50, height: 30, channels: 3, background: "#2f5d50" },
    })
      .png()
      .toBuffer();
    const form = new FormData();
    form.set("file", new File([image], "produce.png", { type: "image/png" }));
    const response = await POST(
      new Request("http://localhost/api/admin/produce/media", {
        method: "POST",
        body: form,
      }),
    );
    expect(response.status).toBe(201);
    const args = mocks.sql.mock.calls[0];
    expect(args[3]).toBe("image/webp");
    const metadata = await sharp(Buffer.from(args[4], "base64")).metadata();
    expect(metadata).toMatchObject({ format: "webp", width: 50, height: 30 });
    expect((await response.json()).url).toMatch(/^\/api\/produce\/media\//);
  });
  it("rejects a truncated file even when its magic bytes look like a PNG", async () => {
    const form = new FormData();
    form.set(
      "file",
      new File(
        [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])],
        "broken.png",
      ),
    );
    expect(
      (
        await POST(
          new Request("http://localhost", { method: "POST", body: form }),
        )
      ).status,
    ).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });
  it("prevents deleting pictures still used by published content", async () => {
    const id = "12345678-1234-1234-1234-123456789abc";
    const catalog = structuredClone(DEFAULT_CATALOG);
    catalog.settings.homeImage = `/api/produce/media/${id}`;
    mocks.read.mockResolvedValue({ catalog });
    const response = await DELETE(
      new Request("http://localhost", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.sql).not.toHaveBeenCalled();
  });
});
