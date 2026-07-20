import { neonAuth } from "@neondatabase/auth/next/server";
import { submitComplianceDoc } from "@/lib/driver/service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to upload documents." }, { status: 401 });

    const body = (await request.json()) as {
      docKey?: string;
      fileName?: string;
      fileMime?: string;
      fileBase64?: string;
    };
    const docKey = String(body.docKey ?? "").trim();
    if (!docKey) return Response.json({ error: "Document type required." }, { status: 400 });

    const result = await submitComplianceDoc(String(user.id), docKey, {
      fileName: body.fileName,
      fileMime: body.fileMime,
      fileBase64: body.fileBase64,
    });
    return Response.json({ ok: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to submit document.";
    return Response.json({ error: message }, { status: 400 });
  }
}
