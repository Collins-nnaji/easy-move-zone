import type { DriverProfile, DriverWorkspace } from "./types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchDriverWorkspace(filters?: {
  zone?: string;
  cargo?: string;
  vehicle?: string;
}): Promise<DriverWorkspace> {
  const qs = new URLSearchParams();
  if (filters?.zone) qs.set("zone", filters.zone);
  if (filters?.cargo) qs.set("cargo", filters.cargo);
  if (filters?.vehicle) qs.set("vehicle", filters.vehicle);
  const query = qs.toString();
  return parseJson<DriverWorkspace>(
    await fetch(`/api/driver/workspace${query ? `?${query}` : ""}`, { cache: "no-store" }),
  );
}

export async function updateDriverProfile(body: Partial<DriverProfile>): Promise<DriverProfile> {
  const data = await parseJson<{ profile: DriverProfile }>(
    await fetch("/api/driver/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
  return data.profile;
}

export async function claimShift(shiftId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/driver/shifts/${shiftId}/claim`, { method: "POST" }),
  );
}

export async function clockInSession(sessionId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/driver/sessions/${sessionId}/clock-in`, { method: "POST" }),
  );
}

export async function cashOutWallet(): Promise<{ amount: number }> {
  return parseJson<{ amount: number }>(
    await fetch("/api/driver/wallet/cashout", { method: "POST" }),
  );
}

export async function uploadComplianceDoc(docKey: string): Promise<void> {
  await parseJson(
    await fetch("/api/driver/vault", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ docKey }),
    }),
  );
}

export async function completeDriverShift(shiftId: string): Promise<void> {
  await parseJson(await fetch(`/api/driver/shifts/${shiftId}/complete`, { method: "POST" }));
}

export async function acceptOfferApi(offerId: string): Promise<{ shiftId: string }> {
  return parseJson(
    await fetch(`/api/driver/offers/${offerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "accept" }),
    }),
  );
}

export async function declineOfferApi(offerId: string): Promise<void> {
  await parseJson(
    await fetch(`/api/driver/offers/${offerId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "decline" }),
    }),
  );
}
