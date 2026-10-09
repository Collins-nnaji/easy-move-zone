import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { marketplaceDb, getRecord } from "./store";
import type { Payment } from "./model";
import { queueUpdate } from "./notifications";
import type { Move } from "@/lib/moving/model";
import { InputError } from "./http";
export function validSignature(
  raw: string,
  signature: string | null,
  secret = process.env.PAYSTACK_SECRET_KEY,
) {
  if (!secret || !signature || !/^[a-f0-9]{128}$/i.test(signature))
    return false;
  return timingSafeEqual(
    Buffer.from(createHmac("sha512", secret).update(raw).digest("hex"), "hex"),
    Buffer.from(signature, "hex"),
  );
}
export async function paystack(path: string, payload?: unknown) {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key)
    throw new InputError(
      "Online payments are not available yet. Contact our team to arrange your deposit.",
      503,
    );
  const response = await fetch(`https://api.paystack.co/${path}`, {
    method: payload ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    ...(payload ? { body: JSON.stringify(payload) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json();
  if (!response.ok || !result.status)
    throw new InputError(
      "Payment provider unavailable. Please try again.",
      502,
    );
  return result.data;
}
export function matchesPayment(
  payment: Payment,
  result: {
    status?: string;
    reference?: string;
    amount?: number;
    currency?: string;
  },
) {
  return (
    result.status === "success" &&
    result.reference === payment.id &&
    result.currency === "NGN" &&
    result.amount === payment.amount * 100
  );
}
export async function settlePayment(id: string) {
  const payment = await getRecord<Payment>("payment", id);
  if (!payment) throw new InputError("Payment not found.", 404);
  const verified = await paystack(
    `transaction/verify/${encodeURIComponent(id)}`,
  );
  if (!matchesPayment(payment, verified))
    throw new InputError(
      "Payment has not been confirmed or the amount does not match.",
      409,
    );
  const sql = await marketplaceDb();
  // Lock and consume the pending payment once; update the move in the same statement.
  const rows = await sql`WITH settled AS (
    UPDATE emz_marketplace SET data=data || jsonb_build_object('status','paid','paidAt',now()), updated_at=now()
    WHERE kind='payment' AND id=${id} AND data->>'status' IN ('pending','failed') RETURNING data
  ) UPDATE emz_moves SET data=data || jsonb_build_object('paidAmount',COALESCE((data->>'paidAmount')::numeric,0)+${payment.amount}, 'status',
    CASE WHEN data->>'status'='quoted' AND COALESCE((data->>'paidAmount')::numeric,0)+${payment.amount} >= (data->>'quote')::numeric * COALESCE((data->>'depositPercent')::numeric,30)/100 THEN 'scheduled' ELSE data->>'status' END), updated_at=now()
    WHERE reference=${payment.reference} AND EXISTS(SELECT 1 FROM settled) RETURNING data`;
  if (rows[0]) await queueUpdate(rows[0].data as Move);
  return {
    payment: { ...payment, status: "paid" as const },
    changed: rows.length > 0,
  };
}
