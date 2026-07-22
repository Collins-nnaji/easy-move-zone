import crypto from "crypto";

/**
 * Paystack payment rail (Nigeria).
 *
 * Stripe cannot pay out to Nigerian bank accounts, so for a real in-market
 * launch funding + payouts run through Paystack. This module is a thin, typed
 * client over the Paystack REST API plus webhook-signature verification.
 *
 * Activation: set PAYMENTS_PROVIDER=paystack and PAYSTACK_SECRET_KEY. When not
 * configured, the app falls back to the existing Stripe/ledger behavior.
 */

const PAYSTACK_BASE = "https://api.paystack.co";

export const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY?.trim() ?? "";
export const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY ?? "";
export const isPaystackConfigured = Boolean(PAYSTACK_SECRET);

export type PaymentsProvider = "stripe" | "paystack" | "flutterwave";

/** The configured payment provider (defaults to Stripe for backwards compatibility). */
export function getPaymentsProvider(): PaymentsProvider {
  const raw = (process.env.PAYMENTS_PROVIDER?.trim() || "stripe").toLowerCase();
  return raw === "paystack" || raw === "flutterwave" ? raw : "stripe";
}

/** True when Paystack is both selected and configured. */
export function isPaystackActive(): boolean {
  return getPaymentsProvider() === "paystack" && isPaystackConfigured;
}

/** Our ledger stores amounts in minor units (kobo for NGN), which is what Paystack expects. */
export function toKobo(minorUnits: number): number {
  return Math.round(minorUnits);
}

type PaystackEnvelope<T> = { status: boolean; message: string; data: T };

async function paystackFetch<T>(path: string, init?: RequestInit): Promise<T> {
  if (!PAYSTACK_SECRET) {
    throw new Error("Paystack is not configured. Set PAYSTACK_SECRET_KEY.");
  }
  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  let json: Partial<PaystackEnvelope<T>> = {};
  try {
    json = (await res.json()) as PaystackEnvelope<T>;
  } catch {
    // fall through to the status check below
  }

  if (!res.ok || json.status === false) {
    throw new Error(json.message || `Paystack request failed (${res.status}).`);
  }
  return json.data as T;
}

export type PaystackInitResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

/** Initialize a checkout transaction (fleet funding a load). Returns a hosted payment URL. */
export function initializePaystackFunding(params: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl?: string;
  metadata?: Record<string, unknown>;
}): Promise<PaystackInitResult> {
  return paystackFetch<PaystackInitResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: toKobo(params.amountKobo),
      reference: params.reference,
      currency: "NGN",
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
}

export type PaystackVerifyResult = {
  status: string; // "success" | "failed" | "abandoned"
  reference: string;
  amount: number;
  currency: string;
};

/** Verify a transaction after redirect/webhook. */
export function verifyPaystackTransaction(reference: string): Promise<PaystackVerifyResult> {
  return paystackFetch<PaystackVerifyResult>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export type PaystackAccount = { account_number: string; account_name: string };

/** Resolve a NUBAN account number to the registered account name (payout confirmation UX). */
export function resolvePaystackAccount(accountNumber: string, bankCode: string): Promise<PaystackAccount> {
  const qs = new URLSearchParams({ account_number: accountNumber, bank_code: bankCode });
  return paystackFetch<PaystackAccount>(`/bank/resolve?${qs.toString()}`);
}

export type PaystackRecipient = { recipient_code: string };

/** Create a transfer recipient for a driver's bank account (needed before payouts). */
export function createPaystackRecipient(params: {
  name: string;
  accountNumber: string;
  bankCode: string;
}): Promise<PaystackRecipient> {
  return paystackFetch<PaystackRecipient>("/transferrecipient", {
    method: "POST",
    body: JSON.stringify({
      type: "nuban",
      name: params.name,
      account_number: params.accountNumber,
      bank_code: params.bankCode,
      currency: "NGN",
    }),
  });
}

export type PaystackTransfer = { transfer_code: string; status: string; reference: string | null };

/** Initiate a payout (driver cash-out) to a previously created recipient. */
export function initiatePaystackTransfer(params: {
  amountKobo: number;
  recipientCode: string;
  reason?: string;
  reference?: string;
}): Promise<PaystackTransfer> {
  return paystackFetch<PaystackTransfer>("/transfer", {
    method: "POST",
    body: JSON.stringify({
      source: "balance",
      amount: toKobo(params.amountKobo),
      recipient: params.recipientCode,
      reason: params.reason,
      reference: params.reference,
    }),
  });
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Verify a Paystack webhook signature. Paystack signs the raw request body with
 * HMAC-SHA512 using your secret key and sends it in the x-paystack-signature header.
 */
export function verifyPaystackSignature(
  rawBody: string,
  signature: string | null | undefined,
  secret: string = PAYSTACK_SECRET,
): boolean {
  if (!signature || !secret) return false;
  const expected = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Generate a unique, provider-safe reference for a payment. */
export function makePaymentReference(prefix: string, id: string): string {
  return `${prefix}_${id}_${Date.now().toString(36)}`;
}
