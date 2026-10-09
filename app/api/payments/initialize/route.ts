import { NextResponse } from "next/server";
import { getMove } from "@/lib/moving/store";
import { body, InputError, reference } from "@/lib/marketplace/http";
import { due, type Payment } from "@/lib/marketplace/model";
import { marketplaceDb } from "@/lib/marketplace/store";
import { paystack } from "@/lib/marketplace/paystack";
export async function POST(request: Request) {
  try {
    const b = await body(request);
    if (!reference(b.reference) || !["deposit", "balance"].includes(b.purpose))
      throw new InputError("Check the move reference and payment type.");
    if (!process.env.PAYSTACK_SECRET_KEY)
      throw new InputError(
        "Online payments are not available yet. Contact our team to arrange your deposit.",
        503,
      );
    const sql = await marketplaceDb();
    const move = await getMove(b.reference);
    if (!move) throw new InputError("Move not found.", 404);
    if (b.purpose === "balance" && move.status !== "completed")
      throw new InputError("The balance becomes payable after delivery.");
    const amount = due(move, b.purpose);
    if (amount <= 0)
      throw new InputError(
        "No payment is due. Your quote may still be under review.",
        409,
      );
    const id = `EMZPAY-${crypto.randomUUID()}`;
    const payment: Payment = {
      id,
      reference: move.reference,
      amount,
      purpose: b.purpose,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    // One outstanding checkout per move prevents simultaneous deposit/balance overpayments.
    const results = await sql.transaction([
      sql`SELECT pg_advisory_xact_lock(719260101)`,
      sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) SELECT 'payment',${id},${move.reference},${JSON.stringify(payment)}::jsonb
        WHERE EXISTS(SELECT 1 FROM emz_moves WHERE reference=${move.reference} AND data=${JSON.stringify(move)}::jsonb)
        AND NOT EXISTS(SELECT 1 FROM emz_marketplace WHERE kind='payment' AND owner_id=${move.reference} AND data->>'status'='pending') RETURNING data`,
    ]);
    if (!results[1].length) {
      const rows =
        await sql`SELECT data FROM emz_marketplace WHERE kind='payment' AND owner_id=${move.reference} AND data->>'status'='pending' LIMIT 1`;
      const pending = rows[0]?.data as Payment | undefined;
      if (pending?.authorizationUrl)
        return NextResponse.json({
          url: pending.authorizationUrl,
          id: pending.id,
        });
      throw new InputError(
        "An existing payment is processing. Contact support with your reference if checkout was interrupted.",
        409,
      );
    }
    try {
      const origin = (
        process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin
      ).replace(/\/$/, "");
      const result = await paystack("transaction/initialize", {
        email: move.email,
        amount: amount * 100,
        currency: "NGN",
        reference: id,
        callback_url: `${origin}/checkout?move=${move.reference}`,
        metadata: { moveReference: move.reference, purpose: b.purpose },
      });
      if (
        typeof result.authorization_url !== "string" ||
        !result.authorization_url.startsWith("https://checkout.paystack.com/")
      )
        throw new InputError("Invalid checkout response.", 502);
      await sql`UPDATE emz_marketplace SET data=data || ${JSON.stringify({ authorizationUrl: result.authorization_url })}::jsonb WHERE kind='payment' AND id=${id}`;
      return NextResponse.json({ url: result.authorization_url, id });
    } catch (error) {
      // Retain unknown provider outcomes for safe reconciliation; never manufacture a successful payment.
      throw error;
    }
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof InputError ? e.message : "Could not start checkout.",
      },
      { status: e instanceof InputError ? e.status : 503 },
    );
  }
}
