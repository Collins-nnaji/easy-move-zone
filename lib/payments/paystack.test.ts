import crypto from "crypto";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getPaymentsProvider,
  makePaymentReference,
  toKobo,
  verifyPaystackSignature,
} from "./paystack";

describe("getPaymentsProvider", () => {
  const original = process.env.PAYMENTS_PROVIDER;
  afterEach(() => {
    if (original === undefined) delete process.env.PAYMENTS_PROVIDER;
    else process.env.PAYMENTS_PROVIDER = original;
  });

  it("defaults to stripe when unset", () => {
    delete process.env.PAYMENTS_PROVIDER;
    expect(getPaymentsProvider()).toBe("stripe");
  });

  it("recognizes paystack and flutterwave case-insensitively", () => {
    process.env.PAYMENTS_PROVIDER = "PayStack";
    expect(getPaymentsProvider()).toBe("paystack");
    process.env.PAYMENTS_PROVIDER = "flutterwave";
    expect(getPaymentsProvider()).toBe("flutterwave");
  });

  it("falls back to stripe for unknown values", () => {
    process.env.PAYMENTS_PROVIDER = "square";
    expect(getPaymentsProvider()).toBe("stripe");
  });
});

describe("toKobo", () => {
  it("passes minor units through, rounding to an integer", () => {
    expect(toKobo(85000)).toBe(85000);
    expect(toKobo(1200.6)).toBe(1201);
  });
});

describe("verifyPaystackSignature", () => {
  const secret = "sk_test_example_secret";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "ref_123" } });
  const validSig = crypto.createHmac("sha512", secret).update(body).digest("hex");

  it("accepts a correct signature", () => {
    expect(verifyPaystackSignature(body, validSig, secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const tampered = body.replace("ref_123", "ref_999");
    expect(verifyPaystackSignature(tampered, validSig, secret)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    expect(verifyPaystackSignature(body, validSig, "sk_test_other")).toBe(false);
  });

  it("rejects a missing or malformed signature", () => {
    expect(verifyPaystackSignature(body, null, secret)).toBe(false);
    expect(verifyPaystackSignature(body, "", secret)).toBe(false);
    expect(verifyPaystackSignature(body, "deadbeef", secret)).toBe(false);
  });

  it("rejects when no secret is configured", () => {
    expect(verifyPaystackSignature(body, validSig, "")).toBe(false);
  });
});

describe("makePaymentReference", () => {
  it("produces unique, prefixed references", async () => {
    const a = makePaymentReference("emz_fund", "shift1");
    await new Promise((r) => setTimeout(r, 2));
    const b = makePaymentReference("emz_fund", "shift1");
    expect(a).toMatch(/^emz_fund_shift1_/);
    expect(a).not.toBe(b);
  });
});
