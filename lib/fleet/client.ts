import type { FleetProfile, FleetWorkspace, PostShiftInput, RateInput } from "@/lib/driver/types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchFleetWorkspace(params?: {
  zone?: string;
  vehicleType?: string;
}): Promise<FleetWorkspace> {
  const qs = new URLSearchParams();
  if (params?.zone) qs.set("zone", params.zone);
  if (params?.vehicleType) qs.set("vehicleType", params.vehicleType);
  const query = qs.toString();
  return parseJson<FleetWorkspace>(
    await fetch(`/api/fleet/workspace${query ? `?${query}` : ""}`, { cache: "no-store" }),
  );
}

export async function updateFleetProfile(body: Partial<FleetProfile>): Promise<FleetProfile> {
  const data = await parseJson<{ profile: FleetProfile }>(
    await fetch("/api/fleet/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return data.profile;
}

export async function postFleetShift(body: PostShiftInput): Promise<{ id: string }> {
  return parseJson<{ id: string }>(
    await fetch("/api/fleet/shifts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

export async function completeFleetShift(shiftId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/fleet/shifts/${shiftId}/complete`, { method: "POST" }),
  );
}

export async function cancelFleetShift(shiftId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/fleet/shifts/${shiftId}/cancel`, { method: "POST" }),
  );
}

export async function rateFromFleet(input: RateInput): Promise<void> {
  await parseJson(
    await fetch("/api/fleet/ratings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}
