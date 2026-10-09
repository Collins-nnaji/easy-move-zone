import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/assert-admin-api", () => ({
  assertAdminApi: vi.fn(async () => ({ email: "admin@example.com" })),
  AdminForbiddenError: class AdminForbiddenError extends Error {},
}));
vi.mock("@/lib/moving/store", () => ({
  listMoves: vi.fn(),
  getMove: vi.fn(async () => ({
    reference: "EMZ-12345678123441238123123456789012",
    status: "quoted",
    quote: 45000,
    paidAmount: 13500,
    depositPercent: 30,
  })),
}));
vi.mock("@/lib/moving/worker-store", () => ({
  getWorker: vi.fn(async (id: string) =>
    id === "11111111-1111-4111-8111-111111111111"
      ? { id, kind: "mover", name: "Ada Crew" }
      : id === "22222222-2222-4222-8222-222222222222"
        ? {
            id,
            kind: "vehicle",
            name: "Kola Trucks",
            vehicleType: "Truck",
            plate: "LAG 22",
          }
        : undefined,
  ),
}));

vi.mock("@/lib/marketplace/moves", () => ({
  changeMove: vi.fn(async (_current, patch) => ({
    reference: "EMZ-1",
    ...patch,
  })),
}));
vi.mock("@/lib/marketplace/store", () => ({
  workerExtras: vi.fn(async () => ({
    verification: { status: "verified" },
    available: true,
  })),
}));
vi.mock("@/lib/marketplace/notifications", () => ({ queueUpdate: vi.fn() }));
import { changeMove } from "@/lib/marketplace/moves";
import { getMove } from "@/lib/moving/store";
import { workerExtras } from "@/lib/marketplace/store";
import { PATCH } from "./route";

const body = {
  reference: "EMZ-12345678123441238123123456789012",
  status: "scheduled",
  quote: 45000,
  crew: "",
  arrival: "",
  moverId: "11111111-1111-4111-8111-111111111111",
  vehicleId: "22222222-2222-4222-8222-222222222222",
};

function request(payload: unknown) {
  return new Request("https://example.com/api/admin/moves", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      origin: "https://example.com",
    },
    body: JSON.stringify(payload),
  });
}

describe("admin job assignment", () => {
  beforeEach(() => vi.clearAllMocks());
  it("assigns a mover and a vehicle onto the booked move", async () => {
    const response = await PATCH(request(body));
    expect(response.status).toBe(200);
    expect(vi.mocked(changeMove).mock.calls[0][1]).toMatchObject({
      moverId: body.moverId,
      vehicleId: body.vehicleId,
      crew: "Movers: Ada Crew · Truck Kola Trucks (LAG 22)",
    });
  });
  it("blocks scheduling without a verified deposit", async () => {
    vi.mocked(getMove).mockResolvedValueOnce({
      reference: body.reference,
      status: "quoted",
      quote: 45000,
      paidAmount: 0,
    } as never);
    expect((await PATCH(request(body))).status).toBe(409);
    expect(changeMove).not.toHaveBeenCalled();
  });
  it("blocks unverified partners", async () => {
    vi.mocked(workerExtras).mockResolvedValueOnce({
      verification: { status: "pending" },
      available: true,
    } as never);
    expect((await PATCH(request(body))).status).toBe(409);
    expect(changeMove).not.toHaveBeenCalled();
  });
  it("rejects a vehicle id used as a mover", async () => {
    const response = await PATCH(
      request({ ...body, moverId: body.vehicleId, vehicleId: null }),
    );
    expect(response.status).toBe(400);
    expect(changeMove).not.toHaveBeenCalled();
  });
});
