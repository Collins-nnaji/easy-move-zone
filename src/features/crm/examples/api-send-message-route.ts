/**
 * Example route handler for App Router.
 * Copy into app/api/crm/messages/route.ts (or src/app/... depending your project layout)
 */

import { sendAndPersistThreadMessage, type DbExecutor } from "../index";

declare const db: DbExecutor;

export async function POST(request: Request) {
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

  const result = await sendAndPersistThreadMessage(db, payload);
  return Response.json(result, { status: 200 });
}
