import { driverSql } from "@/lib/driver/db";
import { sendMarketplaceEmail } from "./email";
import { sendMarketplaceSms } from "./sms";
import { sendMarketplacePush } from "./push";

export async function createInAppNotification(input: {
  userId: string;
  kind: string;
  title: string;
  body: string;
  link?: string;
  meta?: Record<string, unknown>;
}) {
  if (!driverSql) return;
  await driverSql.query(
    `insert into marketplace_notifications (user_id, kind, title, body, link, meta)
     values ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      input.userId,
      input.kind,
      input.title,
      input.body,
      input.link ?? null,
      JSON.stringify(input.meta ?? {}),
    ],
  );
}

async function resolveContact(userId: string): Promise<{ email: string | null; phone: string | null }> {
  if (!driverSql) return { email: null, phone: null };

  const driver = (await driverSql.query(
    `select contact_email, contact_phone from driver_profiles where auth_user_id = $1`,
    [userId],
  )) as Array<{ contact_email: string | null; contact_phone: string | null }>;

  if (driver[0]) {
    return { email: driver[0].contact_email, phone: driver[0].contact_phone };
  }

  const fleet = (await driverSql.query(
    `select contact_email, contact_phone from fleet_operator_profiles where auth_user_id = $1`,
    [userId],
  )) as Array<{ contact_email: string | null; contact_phone: string | null }>;

  return {
    email: fleet[0]?.contact_email ?? null,
    phone: fleet[0]?.contact_phone ?? null,
  };
}

/** Fan-out: in-app + email + SMS + web push (each channel skips if not configured). */
export async function notifyUser(input: {
  userId: string;
  kind: string;
  title: string;
  body: string;
  link?: string;
  meta?: Record<string, unknown>;
  emailText?: string;
  smsText?: string;
}) {
  await createInAppNotification(input);

  const contact = await resolveContact(input.userId);
  const emailText = input.emailText ?? `${input.body}${input.link ? `\n\nOpen: ${input.link}` : ""}\n\n— EasyMoveZone`;
  const smsText = input.smsText ?? `${input.title}: ${input.body}`.slice(0, 320);

  const results = await Promise.allSettled([
    contact.email
      ? sendMarketplaceEmail({ to: contact.email, subject: input.title, text: emailText })
      : Promise.resolve({ ok: true, skipped: true }),
    contact.phone
      ? sendMarketplaceSms({ to: contact.phone, body: smsText })
      : Promise.resolve({ ok: true, skipped: true }),
    sendMarketplacePush({
      userId: input.userId,
      title: input.title,
      body: input.body,
      link: input.link,
    }),
  ]);

  return results;
}
