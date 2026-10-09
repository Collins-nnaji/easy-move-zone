import "server-only";
import { createHash } from "node:crypto";
import { marketplaceDb } from "./store";
import { STATUSES, STATUS_LABELS, type Move } from "@/lib/moving/model";
export async function queueUpdate(move: Move) {
  if (!move.notifications) return;
  const sql = await marketplaceDb();
  const label =
    move.status === "scheduled" && (move.moverId || move.vehicleId)
      ? "Crew assigned"
      : STATUS_LABELS[STATUSES.indexOf(move.status)];
  const revision = createHash("sha256")
    .update(
      JSON.stringify([move.date, move.moverId, move.vehicleId, move.arrival]),
    )
    .digest("hex")
    .slice(0, 16);
  const channels = ["sms", "whatsapp"];
  for (const channel of channels) {
    const id = `${move.reference}:${move.status}:${revision}:${channel}`;
    await sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) VALUES('notification',${id},${move.reference},${JSON.stringify({ id, reference: move.reference, channel, phone: move.phone, label, status: "queued", attempts: 0, createdAt: new Date().toISOString() })}::jsonb) ON CONFLICT DO NOTHING`;
  }
}
export type Notification = {
  id: string;
  reference: string;
  channel: string;
  phone: string;
  label: string;
  status: string;
  attempts: number;
  createdAt: string;
};
export async function deliverUpdates() {
  const sid = process.env.TWILIO_ACCOUNT_SID,
    token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) return { sent: 0, pending: true };
  const sql = await marketplaceDb();
  const rows =
    await sql`UPDATE emz_marketplace SET data=data || jsonb_build_object('status','sending','attempts',COALESCE((data->>'attempts')::int,0)+1), updated_at=now()
    WHERE kind='notification' AND id IN (SELECT id FROM emz_marketplace WHERE kind='notification' AND (data->>'status' IN ('queued','failed') OR (data->>'status'='sending' AND updated_at < now()-interval '10 minutes')) AND COALESCE((data->>'attempts')::int,0)<5 ORDER BY updated_at LIMIT 20 FOR UPDATE SKIP LOCKED) RETURNING id,data`;
  let sent = 0;
  for (const row of rows) {
    const n = row.data as Notification;
    let phone = n.phone.replace(/[^+0-9]/g, "");
    if (phone.startsWith("0")) phone = "+234" + phone.slice(1);
    if (!phone.startsWith("+")) phone = "+" + phone;
    const whatsapp = n.channel === "whatsapp";
    const from = whatsapp
      ? process.env.TWILIO_WHATSAPP_FROM
      : process.env.TWILIO_FROM_PHONE;
    const template = process.env.TWILIO_WHATSAPP_CONTENT_SID;
    if (!from || (whatsapp && !template)) {
      await sql`UPDATE emz_marketplace SET data=data || '{"status":"queued","attempts":0}'::jsonb WHERE kind='notification' AND id=${row.id}`;
      continue;
    }
    try {
      const form = new URLSearchParams({
        To: whatsapp ? `whatsapp:${phone}` : phone,
        From: whatsapp
          ? from.startsWith("whatsapp:")
            ? from
            : `whatsapp:${from}`
          : from,
      });
      if (whatsapp) {
        form.set("ContentSid", template!);
        form.set(
          "ContentVariables",
          JSON.stringify({ "1": n.reference, "2": n.label }),
        );
      } else
        form.set(
          "Body",
          `EasyMoveZone ${n.reference}: ${n.label}. Track at ${process.env.NEXT_PUBLIC_APP_URL ?? "https://easymovezone.com"}/track?reference=${n.reference}`,
        );
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: form,
          signal: AbortSignal.timeout(10000),
        },
      );
      if (!response.ok) throw new Error("Provider rejected message");
      await sql`UPDATE emz_marketplace SET data=data || '{"status":"sent"}'::jsonb, updated_at=now() WHERE kind='notification' AND id=${row.id}`;
      sent++;
    } catch {
      await sql`UPDATE emz_marketplace SET data=data || '{"status":"failed"}'::jsonb, updated_at=now() WHERE kind='notification' AND id=${row.id}`;
    }
  }
  return { sent };
}
