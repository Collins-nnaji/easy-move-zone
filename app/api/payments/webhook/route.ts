import { NextResponse } from "next/server";
import { settlePayment, validSignature } from "@/lib/marketplace/paystack";
export async function POST(request: Request) {
  const raw = await request.text();
  if (
    raw.length > 1000000 ||
    !validSignature(raw, request.headers.get("x-paystack-signature"))
  )
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  try {
    const event = JSON.parse(raw);
    // Rent paid through the tenant portal (property/server/routes/tenant.js).
    // Paystack has one webhook URL per account, so hand those on, signed body intact.
    if (
      typeof event.data?.reference === "string" &&
      event.data.reference.startsWith("EMZRENT-")
    ) {
      const res = await fetch(new URL("/api/property/tenant/pay/webhook", request.url), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-paystack-signature": request.headers.get("x-paystack-signature") ?? "",
        },
        body: raw,
      });
      return NextResponse.json({ received: res.ok }, { status: res.ok ? 200 : 503 });
    }
    if (
      typeof event.data?.reference === "string" &&
      event.data.reference.startsWith("EMZAGENT-")
    ) {
      const res = await fetch(new URL("/api/property/agent/billing/webhook", request.url), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-paystack-signature": request.headers.get("x-paystack-signature") ?? "",
        },
        body: raw,
      });
      return NextResponse.json({ received: res.ok }, { status: res.ok ? 200 : 503 });
    }
    if (
      event.event === "charge.success" &&
      typeof event.data?.reference === "string" &&
      event.data.reference.startsWith("EMZPAY-")
    )
      await settlePayment(event.data.reference);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json(
      { error: "Payment reconciliation failed. Retry required." },
      { status: 503 },
    );
  }
}
