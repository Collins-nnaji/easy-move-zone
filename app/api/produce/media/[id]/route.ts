import { database, ensureProduceStore } from "@/lib/produce/store";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  if (!/^[a-f0-9-]{36}$/.test(id))
    return new Response("Not found", { status: 404 });
  try {
    await ensureProduceStore();
    const rows =
      await database()`SELECT content_type,data FROM emz_produce_media WHERE id=${id}::uuid`;
    if (!rows[0]) return new Response("Not found", { status: 404 });
    const bytes = Buffer.from(rows[0].data, "base64");
    return new Response(bytes, {
      headers: {
        "Content-Type": rows[0].content_type,
        "Cache-Control": "public, max-age=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return new Response("Unavailable", { status: 503 });
  }
}
