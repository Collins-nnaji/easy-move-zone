import { describe, expect, it } from "vitest";
import { crewLabel, validateWorkerDraft } from "./workers";

const mover = {
  kind: "mover" as const,
  name: "Ada Crew",
  phone: "+2348000000000",
  area: "Yaba",
  crewSize: 3,
  vehicleType: "",
  plate: "",
  capacity: "",
  notes: "",
};

describe("worker onboarding", () => {
  it("accepts a mover and a vehicle owner", () => {
    expect(validateWorkerDraft(mover)).toBe(true);
    expect(
      validateWorkerDraft({
        ...mover,
        kind: "vehicle",
        crewSize: 0,
        vehicleType: "Truck",
        plate: "ABC 123",
        capacity: "3 tonnes",
      }),
    ).toBe(true);
  });
  it("rejects a vehicle without a plate and a mover without a crew", () => {
    expect(
      validateWorkerDraft({
        ...mover,
        kind: "vehicle",
        crewSize: 0,
        vehicleType: "Van",
        plate: "",
        capacity: "1 tonne",
      }),
    ).toBe(false);
    expect(validateWorkerDraft({ ...mover, crewSize: 0 })).toBe(false);
  });
  it("builds the customer-facing crew label from the assignment", () => {
    expect(
      crewLabel(
        { name: "Ada Crew" },
        { name: "Kola Trucks", vehicleType: "Truck", plate: "LAG 22" },
      ),
    ).toBe("Movers: Ada Crew · Truck Kola Trucks (LAG 22)");
  });
});
