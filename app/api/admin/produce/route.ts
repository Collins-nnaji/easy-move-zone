import { NextResponse } from "next/server";
import { guardAdmin, adminError } from "@/lib/produce/admin-api";
import { readCatalog, writeCatalog } from "@/lib/produce/store";
import {
  COLLECTIONS,
  type Collection,
  type ProduceCatalog,
} from "@/lib/produce/model";
import {
  validateEntry,
  validateSettings,
  assertCanDelete,
  ValidationError,
} from "@/lib/produce/validation";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    await guardAdmin();
    return NextResponse.json(await readCatalog());
  } catch (error) {
    return adminError(error);
  }
}
export async function POST(request: Request) {
  try {
    await guardAdmin(request);
    const text = await request.text();
    if (text.length > 50000)
      throw new ValidationError("This record is too large.");
    let body;
    try {
      body = JSON.parse(text);
    } catch {
      throw new ValidationError("Invalid request.");
    }
    if (
      !body ||
      typeof body !== "object" ||
      !["create", "update", "delete"].includes(body.action)
    )
      throw new ValidationError("Choose a valid action.");
    const current = await readCatalog();
    if (!Number.isInteger(body.revision) || body.revision !== current.revision)
      return NextResponse.json(
        {
          error:
            "Another admin saved changes. Reload the latest data before saving your edit.",
        },
        { status: 409 },
      );
    const catalog: ProduceCatalog = structuredClone(current.catalog);
    if (body.collection === "settings")
      catalog.settings = validateSettings(body.data);
    else {
      const collection = body.collection as Collection;
      if (!COLLECTIONS.includes(collection))
        throw new ValidationError("Unknown collection.");
      const entries = catalog[collection] as unknown as Record<
        string,
        unknown
      >[];
      if (body.action === "delete") {
        if (typeof body.id !== "string")
          throw new ValidationError("Invalid ID.");
        assertCanDelete(collection, body.id, catalog);
        (catalog[collection] as unknown) = entries.filter(
          (item) => item.id !== body.id,
        );
      } else {
        const entry = validateEntry(collection, body.data, catalog);
        const index = entries.findIndex((item) => item.id === entry.id);
        if (body.action === "create" && index !== -1)
          throw new ValidationError(
            "This ID already exists. Choose a different ID.",
          );
        if (body.action === "update" && index === -1)
          throw new ValidationError(
            "This record no longer exists. Reload the latest data.",
          );
        if (index === -1) entries.push(entry);
        else entries[index] = entry;
      }
    }
    const revision = await writeCatalog(catalog, current.revision);
    if (!revision)
      return NextResponse.json(
        { error: "Another admin saved changes. Reload before saving." },
        { status: 409 },
      );
    return NextResponse.json({ catalog, revision });
  } catch (error) {
    return adminError(error);
  }
}
