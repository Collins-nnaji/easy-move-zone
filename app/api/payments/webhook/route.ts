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
