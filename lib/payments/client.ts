import type { PaymentStatus } from "./service";

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

export async function fetchPaymentStatus(): Promise<PaymentStatus & { configured: boolean }> {
  return parseJson(await fetch("/api/payments/connect", { cache: "no-store" }));
}

export async function startConnectOnboarding(): Promise<{ url: string }> {
  return parseJson(
    await fetch("/api/payments/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    }),
  );
}

export async function refreshConnectStatus(): Promise<{ payoutsEnabled: boolean }> {
  return parseJson(
    await fetch("/api/payments/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "refresh" }),
    }),
  );
}

export async function cashOutPayment(): Promise<{
  amount: number;
  mode: "stripe" | "ledger";
  message: string;
}> {
  return parseJson(await fetch("/api/payments/cashout", { method: "POST" }));
}

export async function fundLoad(shiftId: string): Promise<{ url: string }> {
  return parseJson(
    await fetch("/api/payments/fund", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shiftId }),
    }),
  );
}
