import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { createHmac } from "node:crypto";
vi.mock("./store", () => ({ marketplaceDb: vi.fn(), getRecord: vi.fn() }));
vi.mock("./notifications", () => ({ queueUpdate: vi.fn() }));
import { marketplaceDb, getRecord } from "./store";
import { validSignature, matchesPayment, settlePayment } from "./paystack";
import type { Payment } from "./model";
const payment: Payment = {
  id: "EMZPAY-test",
  reference: "EMZ-TEST",
  amount: 30000,
  purpose: "deposit",
  status: "pending",
  createdAt: "2026-10-10",
};
describe("verified Paystack collection", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("PAYSTACK_SECRET_KEY", "sk_test_secret");
  });
  it("validates raw-body HMAC and rejects tampered or absent signatures", () => {
    const raw = '{"event":"charge.success"}',
      secret = "secret",
      signature = createHmac("sha512", secret).update(raw).digest("hex");
    expect(validSignature(raw, signature, secret)).toBe(true);
    expect(validSignature(raw + " ", signature, secret)).toBe(false);
    expect(validSignature(raw, null, secret)).toBe(false);
    expect(validSignature(raw, "bad", secret)).toBe(false);
  });
  it("requires exact currency, amount, reference and success state", () => {
    const result = {
      reference: payment.id,
      amount: 3000000,
      currency: "NGN",
      status: "success",
    };
    expect(matchesPayment(payment, result)).toBe(true);
    for (const patch of [
      { amount: 1 },
      { currency: "USD" },
      { reference: "wrong" },
      { status: "pending" },
    ])
      expect(matchesPayment(payment, { ...result, ...patch })).toBe(false);
  });
  it("re-verifies with the provider and credits only a pending ledger entry", async () => {
    vi.mocked(getRecord).mockResolvedValue(payment);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          status: true,
          data: {
            status: "success",
            reference: payment.id,
            amount: 3000000,
            currency: "NGN",
          },
        }),
      ),
    );
    const queries: string[] = [];
    let credited = false;
    const sql = vi.fn(async (strings: TemplateStringsArray) => {
      queries.push(strings.join("?"));
      if (credited) return [];
      credited = true;
      return [
        {
          data: {
            reference: payment.reference,
            status: "scheduled",
            notifications: false,
          },
        },
      ];
    });
    vi.mocked(marketplaceDb).mockResolvedValue(sql as never);
    expect((await settlePayment(payment.id)).changed).toBe(true);
    expect((await settlePayment(payment.id)).changed).toBe(false);
    expect(queries[0]).toContain("data->>'status' IN ('pending','failed')");
    expect(queries[0]).toContain("WITH settled");
  });
  it("never writes a credit for a mismatched provider payment", async () => {
    vi.mocked(getRecord).mockResolvedValue(payment);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          status: true,
          data: {
            status: "success",
            reference: payment.id,
            amount: 1,
            currency: "NGN",
          },
        }),
      ),
    );
    await expect(settlePayment(payment.id)).rejects.toThrow(
      "amount does not match",
    );
    expect(marketplaceDb).not.toHaveBeenCalled();
  });
});
