import { neonAuth } from "@neondatabase/auth/next/server";
import { getComplianceFile } from "@/lib/driver/vault";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { id } = await params;
    const file = await getComplianceFile(String(user.id), id);
    if (!file?.file_data) return Response.json({ error: "File not found." }, { status: 404 });

    const buffer = Buffer.from(file.file_data, "base64");
    return new Response(buffer, {
      headers: {
        "Content-Type": file.file_mime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file.file_name || "document"}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load file.";
    return Response.json({ error: message }, { status: 400 });
  }
}
