import { NextResponse } from "next/server";
import { settlePayment } from "@/lib/marketplace/paystack";
import { body, InputError } from "@/lib/marketplace/http";
export async function POST(request: Request) {
  try {
    const b = await body(request);
    if (typeof b.id !== "string" || !/^EMZPAY-[a-f0-9-]{36}$/.test(b.id))
      throw new InputError("Invalid payment reference.");
    const result = await settlePayment(b.id);
    return NextResponse.json({
      paid: true,
      reference: result.payment.reference,
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof InputError ? e.message : "Could not verify payment.",
      },
      { status: e instanceof InputError ? e.status : 503 },
    );
  }
}
