import { neonAuth } from "@neondatabase/auth/next/server";
import { addDisputeEvidence, evaluateAndAdvance } from "@/lib/disputes/service";

export const runtime = "nodejs";

/** Attach a photo or written statement to an open dispute. */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    const body = (await request.json()) as {
      kind?: "photo" | "note";
      body?: string;
      fileData?: string;
      fileMime?: string;
    };

    const kind = body.kind === "photo" ? "photo" : "note";
    if (kind === "photo" && !body.fileData) {
      return Response.json({ error: "Photo data is required." }, { status: 400 });
    }
    if (kind === "note" && !body.body?.trim()) {
      return Response.json({ error: "Write a statement to submit." }, { status: 400 });
    }

    const result = await addDisputeEvidence({
      authUserId: String(user.id),
      disputeId: id,
      kind,
      body: body.body ?? null,
      fileData: body.fileData ?? null,
      fileMime: body.fileMime ?? null,
    });

    // New evidence can change the outcome (e.g. a respondent replying in time).
    const outcome = await evaluateAndAdvance(id);

    return Response.json({ ok: true, ...result, outcome });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to add evidence.";
    return Response.json({ error: message }, { status: 400 });
  }
}
