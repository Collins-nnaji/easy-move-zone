import type { Channel } from "./types";

export interface OutboundMessageInput {
  toEmail?: string;
  toPhone?: string;
  subject?: string;
  body: string;
  channel: Channel;
}

export interface ProviderSendResult {
  ok: boolean;
  provider: "resend" | "twilio" | "none";
  providerMessageId?: string;
  error?: string;
}

export async function sendOutboundMessage(input: OutboundMessageInput): Promise<ProviderSendResult> {
  if (input.channel === "email") {
    return sendEmail(input);
  }
  if (input.channel === "sms") {
    return sendSms(input);
  }
  return { ok: true, provider: "none" };
}

async function sendEmail(input: OutboundMessageInput): Promise<ProviderSendResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail || !input.toEmail) {
    return { ok: false, provider: "resend", error: "Missing RESEND_API_KEY, RESEND_FROM_EMAIL, or recipient email." };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [input.toEmail],
      subject: input.subject ?? "Update from your account team",
      text: input.body,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return { ok: false, provider: "resend", error: `Resend error: ${response.status} ${errorBody}` };
  }

  const payload = (await response.json()) as { id?: string };
  return { ok: true, provider: "resend", providerMessageId: payload.id };
}

async function sendSms(input: OutboundMessageInput): Promise<ProviderSendResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_FROM_PHONE;
  if (!accountSid || !authToken || !fromPhone || !input.toPhone) {
    return {
      ok: false,
      provider: "twilio",
      error: "Missing TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE, or recipient phone.",
    };
  }

  const form = new URLSearchParams({
    To: input.toPhone,
    From: fromPhone,
    Body: input.body,
  });

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return { ok: false, provider: "twilio", error: `Twilio error: ${response.status} ${errorBody}` };
  }

  const payload = (await response.json()) as { sid?: string };
  return { ok: true, provider: "twilio", providerMessageId: payload.sid };
}

export async function draftAiReply(context: {
  relationshipType: "prospect" | "client";
  relationshipName: string;
  threadSummary: string;
  goal: string;
}): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return "OPENAI_API_KEY is not set. Add it to enable AI message drafting.";
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content:
            "You write concise, warm, professional CRM follow-up messages. Keep to under 120 words and include one clear next step.",
        },
        {
          role: "user",
          content: `Type: ${context.relationshipType}\nName: ${context.relationshipName}\nSummary: ${context.threadSummary}\nGoal: ${context.goal}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return `AI draft failed: ${response.status} ${errorBody}`;
  }

  const payload = (await response.json()) as {
    output_text?: string;
  };
  return payload.output_text ?? "No draft returned by AI provider.";
}
