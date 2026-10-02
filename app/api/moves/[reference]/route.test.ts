import { describe, expect, it, vi } from "vitest";
vi.mock("@/lib/moving/store", () => ({ getMove: vi.fn() }));
import { getMove } from "@/lib/moving/store";
import { GET } from "./route";
import type { Move } from "@/lib/moving/model";
const reference = "EMZ-12345678123441238123123456789012";
const request = new Request(`https://example.com/api/moves/${reference}`);
describe("private move tracking", () => {
  it("omits personal details, addresses, inventories and photos", async () => {
    vi.mocked(getMove).mockResolvedValueOnce({
      reference,
      service: "home",
      status: "requested",
      quote: null,
      crew: "",
      arrival: "",
      date: "2026-10-04",
      name: "Private",
      phone: "Private",
      email: "Private",
      pickup: "Private",
      destination: "Private",
      photos: ["Private"],
      inventory: "Private",
    } as Move);
    const result = await GET(request, {
      params: Promise.resolve({ reference }),
    });
    expect(result.status).toBe(200);
    expect(await result.json()).toEqual({
      move: {
        reference,
        service: "home",
        status: "requested",
        quote: null,
        crew: "",
        arrival: "",
        date: "2026-10-04",
      },
    });
    expect(result.headers.get("Cache-Control")).toBe("no-store");
  });
  it("returns an error for an unknown private reference", async () => {
    vi.mocked(getMove).mockResolvedValueOnce(undefined);
    expect(
      (await GET(request, { params: Promise.resolve({ reference }) })).status,
    ).toBe(404);
  });
});
