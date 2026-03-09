/**
 * Example route handler for AI message drafts.
 * Copy into app/api/crm/ai-draft/route.ts (or src/app/...).
 */

import { draftAiReply } from "../index";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    relationshipType: "prospect" | "client";
    relationshipName: string;
    threadSummary: string;
    goal: string;
  };

  const draft = await draftAiReply(payload);
  return Response.json({ draft }, { status: 200 });
}
