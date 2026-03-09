import { draftAiReply } from "@/src/features/crm";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      relationshipType: "prospect" | "client";
      relationshipName: string;
      threadSummary: string;
      goal: string;
    };

    const draft = await draftAiReply({
      relationshipType: payload.relationshipType,
      relationshipName: payload.relationshipName,
      threadSummary: payload.threadSummary,
      goal: payload.goal,
    });

    return Response.json({ draft }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
