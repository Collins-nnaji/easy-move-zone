import { neon } from "@neondatabase/serverless";
import { sendAndPersistThreadMessage, type DbExecutor } from "@/src/features/crm";

export const runtime = "nodejs";

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

const db: DbExecutor = {
  async query<T>(queryText: string, params?: unknown[]) {
    if (!sql) throw new Error("DATABASE_URL is not configured.");
    const rows = (await sql.query(queryText, params ?? [])) as T[];
    return { rows };
  },
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      threadId: string;
      senderParticipantId: string | null;
      direction: "inbound" | "outbound" | "internal_note";
      body: string;
      channel: "in_app" | "email" | "sms";
      toEmail?: string;
      toPhone?: string;
      subject?: string;
    };

    if (!payload.threadId || !payload.body?.trim()) {
      return Response.json({ error: "threadId and body are required." }, { status: 400 });
    }

    const result = await sendAndPersistThreadMessage(db, {
      threadId: payload.threadId,
      senderParticipantId: payload.senderParticipantId ?? null,
      direction: payload.direction ?? "outbound",
      body: payload.body.trim(),
      channel: payload.channel ?? "in_app",
      toEmail: payload.toEmail,
      toPhone: payload.toPhone,
      subject: payload.subject,
    });

    return Response.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
