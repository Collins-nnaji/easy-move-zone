import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants";

export async function sendMarketplaceEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? PUBLIC_CONTACT_EMAIL;

  if (!apiKey) {
    console.info("[notify:email:skipped]", input.subject, "→", input.to);
    return { ok: true, skipped: true };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[notify:email:failed]", response.status, errorBody);
      return { ok: false, error: errorBody };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Email send failed";
    console.error("[notify:email:error]", message);
    return { ok: false, error: message };
  }
}
