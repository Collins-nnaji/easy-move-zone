import { sendOutboundMessage } from "./communication";
import type { Channel, MessageDirection } from "./types";
import type { DbExecutor } from "./repository";

interface SendThreadMessageInput {
  threadId: string;
  senderParticipantId: string | null;
  direction: MessageDirection;
  body: string;
  channel: Channel;
  toEmail?: string;
  toPhone?: string;
  subject?: string;
}

interface PersistedMessage {
  id: string;
}

export async function sendAndPersistThreadMessage(db: DbExecutor, input: SendThreadMessageInput) {
  const inserted = await db.query<PersistedMessage>(
    `insert into communication_messages (
      thread_id,
      sender_participant_id,
      direction,
      body,
      metadata,
      is_read
    ) values ($1, $2, $3, $4, $5::jsonb, false)
    returning id`,
    [
      input.threadId,
      input.senderParticipantId,
      input.direction,
      input.body,
      JSON.stringify({ channel: input.channel, subject: input.subject ?? null }),
    ],
  );

  const messageId = inserted.rows[0]?.id;
  if (!messageId) {
    throw new Error("Message insert failed.");
  }

  const providerResult = await sendOutboundMessage({
    channel: input.channel,
    body: input.body,
    toEmail: input.toEmail,
    toPhone: input.toPhone,
    subject: input.subject,
  });

  if (input.channel === "email") {
    await db.query(
      `insert into email_deliveries (message_id, provider, provider_message_id, send_status, failure_reason, sent_at)
       values ($1, 'resend', $2, $3, $4, case when $3 = 'sent' then now() else null end)`,
      [
        messageId,
        providerResult.providerMessageId ?? null,
        providerResult.ok ? "sent" : "failed",
        providerResult.error ?? null,
      ],
    );
  }

  if (input.channel === "sms") {
    await db.query(
      `insert into sms_deliveries (message_id, provider, provider_message_id, send_status, failure_reason, sent_at)
       values ($1, 'twilio', $2, $3, $4, case when $3 = 'sent' then now() else null end)`,
      [
        messageId,
        providerResult.providerMessageId ?? null,
        providerResult.ok ? "sent" : "failed",
        providerResult.error ?? null,
      ],
    );
  }

  await db.query(
    `update communication_threads
        set last_message_at = now(),
            updated_at = now()
      where id = $1`,
    [input.threadId],
  );

  return { messageId, providerResult };
}
