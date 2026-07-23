import { driverSql } from "@/lib/driver/db";
import { sendNativePush } from "@/lib/notify/native-push";

export type PushSubscriptionInput = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export function isWebPushConfigured() {
  return Boolean(
    process.env.VAPID_PUBLIC_KEY?.trim() &&
      process.env.VAPID_PRIVATE_KEY?.trim() &&
      process.env.VAPID_SUBJECT?.trim(),
  );
}

export function getVapidPublicKey() {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim() || process.env.VAPID_PUBLIC_KEY?.trim() || null;
}

export async function savePushSubscription(authUserId: string, sub: PushSubscriptionInput, userAgent?: string) {
  if (!driverSql) throw new Error("Database not configured.");
  if (!sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    throw new Error("Invalid push subscription.");
  }

  await driverSql.query(
    `insert into driver_push_subscriptions (auth_user_id, endpoint, p256dh, auth, user_agent)
     values ($1, $2, $3, $4, $5)
     on conflict (auth_user_id, endpoint) do update
       set p256dh = excluded.p256dh,
           auth = excluded.auth,
           user_agent = coalesce(excluded.user_agent, driver_push_subscriptions.user_agent),
           updated_at = now()`,
    [authUserId, sub.endpoint, sub.keys.p256dh, sub.keys.auth, userAgent ?? null],
  );
}

export async function deletePushSubscription(authUserId: string, endpoint: string) {
  if (!driverSql) return;
  await driverSql.query(
    `delete from driver_push_subscriptions where auth_user_id = $1 and endpoint = $2`,
    [authUserId, endpoint],
  );
}

export async function sendMarketplacePush(input: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}): Promise<{ ok: boolean; skipped?: boolean; sent?: number; error?: string }> {
  // Native (APNs/FCM) delivery for the iOS/Android apps — best effort and
  // independent of web-push config, so it runs even when VAPID keys are absent.
  const native = await sendNativePush(input).catch((err) => {
    console.error("[notify:native:failed]", err);
    return { ok: false as const, sent: 0 };
  });
  const nativeSent = native.sent ?? 0;

  if (!isWebPushConfigured()) {
    if (nativeSent === 0) console.info("[notify:push:skipped]", input.title, "→", input.userId);
    return { ok: true, skipped: nativeSent === 0, sent: nativeSent };
  }
  if (!driverSql) return { ok: false, error: "Database not configured." };

  const rows = (await driverSql.query(
    `select id, endpoint, p256dh, auth from driver_push_subscriptions where auth_user_id = $1`,
    [input.userId],
  )) as Array<{ id: string; endpoint: string; p256dh: string; auth: string }>;

  if (rows.length === 0) return { ok: true, skipped: nativeSent === 0, sent: nativeSent };

  let webpush: typeof import("web-push");
  try {
    webpush = await import("web-push");
  } catch {
    console.info("[notify:push:skipped] web-push package unavailable");
    return { ok: true, skipped: true };
  }

  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!.trim(),
    process.env.VAPID_PUBLIC_KEY!.trim(),
    process.env.VAPID_PRIVATE_KEY!.trim(),
  );

  const payload = JSON.stringify({
    title: input.title,
    body: input.body,
    url: input.link ?? "/",
  });

  let sent = 0;
  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload,
      );
      sent += 1;
    } catch (err) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        await driverSql.query(`delete from driver_push_subscriptions where id = $1`, [row.id]);
      } else {
        console.error("[notify:push:failed]", err);
      }
    }
  }

  return { ok: true, sent: sent + nativeSent };
}
