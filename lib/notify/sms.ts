export function isTwilioConfigured() {
  return Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
      process.env.TWILIO_AUTH_TOKEN?.trim() &&
      process.env.TWILIO_FROM_PHONE?.trim(),
  );
}

export async function sendMarketplaceSms(input: {
  to: string;
  body: string;
}): Promise<{ ok: boolean; skipped?: boolean; sid?: string; error?: string }> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
  const fromPhone = process.env.TWILIO_FROM_PHONE?.trim();

  if (!accountSid || !authToken || !fromPhone) {
    console.info("[notify:sms:skipped]", input.body.slice(0, 48), "→", input.to);
    return { ok: true, skipped: true };
  }

  const phone = input.to.trim();
  if (!phone) return { ok: false, error: "Missing recipient phone." };

  try {
    const form = new URLSearchParams({
      To: phone,
      From: fromPhone,
      Body: input.body.slice(0, 1500),
    });
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: form.toString(),
      },
    );

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[notify:sms:failed]", response.status, errorBody);
      return { ok: false, error: errorBody };
    }

    const payload = (await response.json()) as { sid?: string };
    return { ok: true, sid: payload.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "SMS send failed";
    console.error("[notify:sms:error]", message);
    return { ok: false, error: message };
  }
}
