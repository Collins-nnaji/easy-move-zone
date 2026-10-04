import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("@/lib/moving/store", () => ({
  saveMove: vi.fn(async (move) => move),
}));
import { saveMove } from "@/lib/moving/store";
import { POST } from "./route";
import { instantQuote, today } from "@/lib/moving/model";
const input = {
  service: "item",
  inventory: "Sofa",
  size: "Single bulky item",
  pickup: "10 Example St, Yaba",
  destination: "20 Example St, Yaba",
  date: today(),
  pickupFloor: 0,
  destinationFloor: 1,
  access: "",
  extras: ["Loading crew"],
  name: "Test Customer",
  email: "test@example.com",
  phone: "+2348000000000",
  photos: [],
  requestId: "12345678-1234-4123-8123-123456789012",
};
function request(body: unknown, origin = "https://example.com") {
  return new Request("https://example.com/api/moves", {
    method: "POST",
    headers: { "Content-Type": "application/json", origin },
    body: JSON.stringify(body),
  });
}
describe("move requests", () => {
  beforeEach(() => vi.clearAllMocks());
  it("books immediately with a confirmed price and private reference", async () => {
    const r = await POST(request({ ...input, status: "completed", quote: 1 }));
    expect(r.status).toBe(201);
    const quote = instantQuote(input);
    expect(await r.json()).toEqual({
      reference: "EMZ-12345678123441238123123456789012",
      quote,
    });
    expect(vi.mocked(saveMove).mock.calls[0][0]).toMatchObject({
      status: "scheduled",
      quote,
      moverId: null,
      vehicleId: null,
    });
  });
  it("rejects invalid fields and cross-origin submissions", async () => {
    expect(
      (await POST(request({ ...input, destination: input.pickup }))).status,
    ).toBe(400);
    expect((await POST(request(input, "https://other.example"))).status).toBe(
      403,
    );
    expect(saveMove).not.toHaveBeenCalled();
  });
  it("does not confirm a request when persistence fails", async () => {
    vi.mocked(saveMove).mockRejectedValueOnce(new Error("offline"));
    expect((await POST(request(input))).status).toBe(503);
  });
});
