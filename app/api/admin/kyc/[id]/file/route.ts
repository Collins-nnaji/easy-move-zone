import { assertAdminApi, AdminForbiddenError } from "@/lib/auth/assert-admin-api";
import { getComplianceFileForAdmin } from "@/lib/admin/marketplace-ops";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await assertAdminApi();
    const { id } = await params;
    const file = await getComplianceFileForAdmin(id);
    if (!file?.bytes) {
      return Response.json({ error: "File not found." }, { status: 404 });
    }

    return new Response(file.bytes, {
      headers: {
        "Content-Type": file.file_mime || "application/octet-stream",
        "Content-Disposition": `inline; filename="${file.file_name || "document"}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (err) {
    if (err instanceof AdminForbiddenError) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = err instanceof Error ? err.message : "Unable to load file.";
    return Response.json({ error: message }, { status: 400 });
  }
}
