import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth/admin"
import { createNews, deleteNews, listAllNews, updateNews } from "@/lib/career/news"

export const runtime = "nodejs"

async function guard() {
  const admin = await requireAdmin()
  if (!admin) return { denied: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), admin: null }
  return { denied: null, admin }
}

export async function GET() {
  const { denied } = await guard()
  if (denied) return denied
  try {
    const articles = await listAllNews()
    return NextResponse.json({ articles })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load news" },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  const { denied, admin } = await guard()
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  try {
    const article = await createNews({
      title: String(body?.title ?? ""),
      summary: body?.summary != null ? String(body.summary) : null,
      body: String(body?.body ?? ""),
      source: body?.source != null ? String(body.source) : null,
      sourceUrl: body?.sourceUrl != null ? String(body.sourceUrl) : null,
      imageUrl: body?.imageUrl != null ? String(body.imageUrl) : null,
      category: body?.category ? String(body.category) : "Immigration",
      tags: Array.isArray(body?.tags) ? body.tags.map(String) : [],
      published: body?.published !== false,
      createdBy: admin?.email ?? null,
    })
    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to publish" },
      { status: 400 },
    )
  }
}

export async function PATCH(request: Request) {
  const { denied } = await guard()
  if (denied) return denied
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const id = Number(body?.id)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    const article = await updateNews(id, {
      title: body?.title != null ? String(body.title) : undefined,
      summary: body?.summary !== undefined ? (body.summary == null ? null : String(body.summary)) : undefined,
      body: body?.body != null ? String(body.body) : undefined,
      source: body?.source !== undefined ? (body.source == null ? null : String(body.source)) : undefined,
      sourceUrl: body?.sourceUrl !== undefined ? (body.sourceUrl == null ? null : String(body.sourceUrl)) : undefined,
      imageUrl: body?.imageUrl !== undefined ? (body.imageUrl == null ? null : String(body.imageUrl)) : undefined,
      category: body?.category != null ? String(body.category) : undefined,
      tags: Array.isArray(body?.tags) ? body.tags.map(String) : undefined,
      published: typeof body?.published === "boolean" ? body.published : undefined,
    })
    if (!article) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ article })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update" },
      { status: 400 },
    )
  }
}

export async function DELETE(request: Request) {
  const { denied } = await guard()
  if (denied) return denied
  const url = new URL(request.url)
  const id = Number(url.searchParams.get("id") || (await request.json().catch(() => null))?.id)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Missing id" }, { status: 400 })
  try {
    const ok = await deleteNews(id)
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete" },
      { status: 500 },
    )
  }
}
