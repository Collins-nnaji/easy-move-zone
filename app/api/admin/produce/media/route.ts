import { NextResponse } from "next/server";
import sharp from "sharp";
import { guardAdmin, adminError } from "@/lib/produce/admin-api";
import { database, ensureProduceStore, readCatalog } from "@/lib/produce/store";
import { ValidationError } from "@/lib/produce/validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await guardAdmin();
    await ensureProduceStore();
    const media =
      await database()`SELECT id,name,content_type,created_at FROM emz_produce_media ORDER BY created_at DESC LIMIT 200`;
    return NextResponse.json({
      media: media.map((item) => ({
        ...item,
        url: `/api/produce/media/${item.id}`,
      })),
    });
  } catch (e) {
    return adminError(e);
  }
}
export async function POST(request: Request) {
  try {
    await guardAdmin(request);
    if (Number(request.headers.get("content-length")) > 3 * 1024 * 1024 + 20000)
      throw new ValidationError("Pictures must be 3 MB or smaller.");
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      file.size > 3 * 1024 * 1024 ||
      file.size === 0
    )
      throw new ValidationError("Choose a picture up to 3 MB.");
    const bytes = Buffer.from(await file.arrayBuffer());
    let type = "";
    if (
      bytes
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    )
      type = "image/png";
    else if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255)
      type = "image/jpeg";
    else if (
      bytes.toString("ascii", 0, 4) === "RIFF" &&
      bytes.toString("ascii", 8, 12) === "WEBP"
    )
      type = "image/webp";
    if (!type) throw new ValidationError("Use a JPEG, PNG or WebP picture.");
    let processed: Buffer;
    try {
      processed = await sharp(bytes, { limitInputPixels: 40_000_000 })
        .rotate()
        .resize({
          width: 1800,
          height: 1800,
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 85 })
        .toBuffer();
      type = "image/webp";
    } catch {
      throw new ValidationError(
        "This picture could not be read. Choose a valid JPEG, PNG or WebP.",
      );
    }
    const id = crypto.randomUUID();
    await ensureProduceStore();
    await database()`INSERT INTO emz_produce_media (id,name,content_type,data) VALUES (${id},${file.name.slice(0, 200)},${type},${processed.toString("base64")})`;
    return NextResponse.json(
      { id, name: file.name.slice(0, 200), url: `/api/produce/media/${id}` },
      { status: 201 },
    );
  } catch (e) {
    return adminError(e);
  }
}
export async function DELETE(request: Request) {
  try {
    await guardAdmin(request);
    const { id } = await request.json();
    if (typeof id !== "string" || !/^[a-f0-9-]{36}$/.test(id))
      throw new ValidationError("Invalid picture.");
    const { catalog } = await readCatalog();
    if (JSON.stringify(catalog).includes(`/api/produce/media/${id}`))
      throw new ValidationError(
        "This picture is in use. Replace it on the page or listing before deleting it.",
      );
    await database()`DELETE FROM emz_produce_media WHERE id=${id}::uuid`;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return adminError(e);
  }
}
