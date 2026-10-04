import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth/assert-admin-api", () => ({
  assertAdminApi: vi.fn(async () => ({ email: "admin@example.com" })),
  AdminForbiddenError: class AdminForbiddenError extends Error {},
}));
vi.mock("@/lib/moving/store", () => ({
  listMoves: vi.fn(),
  updateMove: vi.fn(async (_reference, patch) => ({ reference: "EMZ-1", ...patch })),
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

import { updateMove } from "@/lib/moving/store";
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
    headers: { "Content-Type": "application/json", origin: "https://example.com" },
    body: JSON.stringify(payload),
  });
}

describe("admin job assignment", () => {
  beforeEach(() => vi.clearAllMocks());
  it("assigns a mover and a vehicle onto the booked move", async () => {
    const response = await PATCH(request(body));
    expect(response.status).toBe(200);
    expect(vi.mocked(updateMove).mock.calls[0][1]).toMatchObject({
      moverId: body.moverId,
      vehicleId: body.vehicleId,
      crew: "Movers: Ada Crew · Truck Kola Trucks (LAG 22)",
    });
  });
  it("rejects a vehicle id used as a mover", async () => {
    const response = await PATCH(
      request({ ...body, moverId: body.vehicleId, vehicleId: null }),
    );
    expect(response.status).toBe(400);
    expect(updateMove).not.toHaveBeenCalled();
  });
});
