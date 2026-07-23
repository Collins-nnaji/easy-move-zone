import crypto from "node:crypto";
import { driverSql } from "@/lib/driver/db";

/**
 * Native push (APNs / FCM) for the iOS + Android apps.
 *
 * Token storage always works when the database is configured. Actual delivery
 * uses Firebase Cloud Messaging HTTP v1 and is gated entirely behind a service
 * account in the environment — with no FCM_* config this module no-ops exactly
 * like web-push does without VAPID keys, so it can never break existing
 * notification flows.
 *
 * Required env for delivery (from a Firebase service-account JSON):
 *   FCM_PROJECT_ID
 *   FCM_CLIENT_EMAIL
 *   FCM_PRIVATE_KEY   (the PEM string, with real newlines or \n-escaped)
 */

export type NativePlatform = "ios" | "android";

export function isNativePushConfigured() {
  return Boolean(
    process.env.FCM_PROJECT_ID?.trim() &&
      process.env.FCM_CLIENT_EMAIL?.trim() &&
      process.env.FCM_PRIVATE_KEY?.trim(),
  );
}

export async function saveNativePushToken(authUserId: string, token: string, platform: NativePlatform) {
  if (!driverSql) throw new Error("Database not configured.");
  if (!token) throw new Error("Missing device token.");
  await driverSql.query(
    `insert into driver_native_push_tokens (auth_user_id, token, platform)
     values ($1, $2, $3)
     on conflict (token) do update
       set auth_user_id = excluded.auth_user_id,
           platform = excluded.platform,
           updated_at = now()`,
    [authUserId, token, platform],
  );
}

export async function deleteNativePushToken(token: string) {
  if (!driverSql) return;
  await driverSql.query(`delete from driver_native_push_tokens where token = $1`, [token]);
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Mint a short-lived Google OAuth2 access token from the service account. */
async function getFcmAccessToken(): Promise<string | null> {
  const clientEmail = process.env.FCM_CLIENT_EMAIL!.trim();
  const privateKey = process.env.FCM_PRIVATE_KEY!.trim().replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);

  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({
      iss: clientEmail,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signature = base64url(
    crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claim}`), privateKey),
  );
  const assertion = `${header}.${claim}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!res.ok) {
    console.error("[notify:native:token]", res.status, await res.text().catch(() => ""));
    return null;
  }
  const data = (await res.json()) as { access_token?: string };
  return data.access_token ?? null;
}

export async function sendNativePush(input: {
  userId: string;
  title: string;
  body: string;
  link?: string;
}): Promise<{ ok: boolean; skipped?: boolean; sent?: number; error?: string }> {
  if (!isNativePushConfigured()) return { ok: true, skipped: true };
  if (!driverSql) return { ok: false, error: "Database not configured." };

  const rows = (await driverSql.query(
    `select id, token from driver_native_push_tokens where auth_user_id = $1`,
    [input.userId],
  )) as Array<{ id: string; token: string }>;
  if (rows.length === 0) return { ok: true, skipped: true, sent: 0 };

  const accessToken = await getFcmAccessToken();
  if (!accessToken) return { ok: false, error: "Unable to authenticate with FCM." };

  const projectId = process.env.FCM_PROJECT_ID!.trim();
  const endpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
  const link = input.link ?? "/";

  let sent = 0;
  for (const row of rows) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: row.token,
            notification: { title: input.title, body: input.body },
            data: { url: link },
            android: { priority: "high" },
            apns: { payload: { aps: { sound: "default", badge: 1 } } },
          },
        }),
      });
      if (res.ok) {
        sent += 1;
      } else if (res.status === 404 || res.status === 400) {
        // UNREGISTERED / invalid token — prune it.
        await driverSql.query(`delete from driver_native_push_tokens where id = $1`, [row.id]);
      } else {
        console.error("[notify:native:failed]", res.status, await res.text().catch(() => ""));
      }
    } catch (err) {
      console.error("[notify:native:failed]", err);
    }
  }

  return { ok: true, sent };
}
