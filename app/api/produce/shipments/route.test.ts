import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_CATALOG } from "@/lib/produce/model";
const mocks = vi.hoisted(() => ({
  readCatalog: vi.fn(),
  create: vi.fn(),
  readShipment: vi.fn(),
}));
vi.mock("@/lib/produce/store", () => ({
  readCatalog: mocks.readCatalog,
  createShipment: mocks.create,
  readShipment: mocks.readShipment,
}));
import { POST } from "./route";
import { GET } from "./[reference]/route";
const requestId = "12345678-1234-4321-8765-123456789abc";
const body = {
  requestId,
  role: "trader",
  commodityId: "yam",
  tonnes: 31,
  originId: "makurdi",
  destinationId: "mile12",
  readyDate: "2026-10-10",
  contact: "Test buyer · buyer@example.com",
  collectionAddress: "Private farm",
  deliveryAddress: "Private warehouse",
};
const request = (data: unknown) =>
  new Request("http://localhost/api/produce/shipments", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(data),
  });
beforeEach(() => {
  vi.clearAllMocks();
  mocks.readCatalog.mockResolvedValue({
    catalog: structuredClone(DEFAULT_CATALOG),
    revision: 1,
  });
  mocks.create.mockImplementation(async (s) => s);
});
describe("delivery requests and public tracking", () => {
  it("preserves weight and route, and derives the estimate on the server", async () => {
    const response = await POST(
      request({ ...body, fare: 1, status: "delivered" }),
    );
    expect(response.status).toBe(201);
    const { shipment } = await response.json();
    expect(shipment).toMatchObject({
      tonnes: 31,
      km: 780,
      status: "confirmed",
      reference: "EMZ-12345678123443218765",
    });
    expect(shipment.fare).toBe(1267200);
  });
  it("keeps the reference stable for retries", async () => {
    const first = await (await POST(request(body))).json();
    const second = await (await POST(request(body))).json();
    expect(first.shipment.reference).toBe(second.shipment.reference);
  });
  it("rejects invalid weights, dates and routes", async () => {
    for (const data of [
      { ...body, tonnes: 0 },
      { ...body, readyDate: "2026-02-30" },
      { ...body, destinationId: body.originId },
      { ...body, commodityId: "missing" },
    ])
      expect((await POST(request(data))).status).toBe(400);
    expect(mocks.create).not.toHaveBeenCalled();
  });
  it("does not reveal internal notes or private contact and address information in public tracking", async () => {
    const reference = "EMZ-12345678123443218765";
    mocks.readShipment.mockResolvedValue({
      ...body,
      reference,
      status: "transit",
      internalNotes: "Private operations note",
    });
    const response = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ reference }),
    });
    const data = await response.json();
    expect(data.shipment.status).toBe("transit");
    expect(data.shipment.internalNotes).toBeUndefined();
    expect(data.shipment.collectionAddress).toBeUndefined();
    expect(data.shipment.deliveryAddress).toBeUndefined();
    expect(data.shipment.contact).toBe("Contact our team");
  });
  it("does not fetch guessed short references from the database", async () => {
    expect(
      (
        await GET(new Request("http://localhost"), {
          params: Promise.resolve({ reference: "EMZ-1234" }),
        })
      ).status,
    ).toBe(404);
    expect(mocks.readShipment).not.toHaveBeenCalled();
  });
});
