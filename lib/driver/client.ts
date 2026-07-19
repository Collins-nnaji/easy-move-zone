import type { DriverProfile, DriverWorkspace } from "./types";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchDriverWorkspace(zone?: string): Promise<DriverWorkspace> {
  const qs = zone ? `?zone=${encodeURIComponent(zone)}` : "";
  return parseJson<DriverWorkspace>(await fetch(`/api/driver/workspace${qs}`, { cache: "no-store" }));
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
