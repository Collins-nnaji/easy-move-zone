import { careerSql } from "@/lib/career/db"

export type ImmigrationNews = {
  id: number
  title: string
  slug: string
  summary: string | null
  body: string
  source: string | null
  sourceUrl: string | null
  imageUrl: string | null
  category: string
  tags: string[]
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
}

type NewsRow = {
  id: number
  title: string
  slug: string
  summary: string | null
  body: string
  source: string | null
  source_url: string | null
  image_url: string | null
  category: string
  tags: string[] | null
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

function mapNews(row: NewsRow): ImmigrationNews {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    source: row.source,
    sourceUrl: row.source_url,
    imageUrl: row.image_url,
    category: row.category,
    tags: row.tags ?? [],
    published: row.published,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdBy: row.created_by,
  }
}

export function slugifyNewsTitle(title: string) {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
}

export async function listPublishedNews(limit = 40): Promise<ImmigrationNews[]> {
  if (!careerSql) return []
  const rows = (await careerSql`
    SELECT *
    FROM career.immigration_news
    WHERE published = true
    ORDER BY published_at DESC NULLS LAST, id DESC
    LIMIT ${Math.min(Math.max(limit, 1), 100)}
  `) as NewsRow[]
  return rows.map(mapNews)
}

export async function listAllNews(): Promise<ImmigrationNews[]> {
  if (!careerSql) return []
  const rows = (await careerSql`
    SELECT *
    FROM career.immigration_news
    ORDER BY created_at DESC, id DESC
    LIMIT 200
  `) as NewsRow[]
  return rows.map(mapNews)
}

export async function getNewsBySlug(slug: string): Promise<ImmigrationNews | null> {
  if (!careerSql) return null
  const rows = (await careerSql`
    SELECT * FROM career.immigration_news WHERE slug = ${slug} LIMIT 1
  `) as NewsRow[]
  return rows[0] ? mapNews(rows[0]) : null
}

export async function createNews(input: {
  title: string
  summary?: string | null
  body: string
  source?: string | null
  sourceUrl?: string | null
  imageUrl?: string | null
  category?: string
  tags?: string[]
  published?: boolean
  createdBy?: string | null
}): Promise<ImmigrationNews> {
  if (!careerSql) throw new Error("Database is not configured")
  const title = input.title.trim()
  const body = input.body.trim()
  if (!title || !body) throw new Error("Title and body are required")

  let slug = slugifyNewsTitle(title) || `news-${Date.now()}`
  const existing = await careerSql`SELECT id FROM career.immigration_news WHERE slug = ${slug} LIMIT 1`
  if (existing.length) slug = `${slug}-${Date.now().toString(36)}`

  const published = Boolean(input.published)
  const rows = (await careerSql`
    INSERT INTO career.immigration_news (
      title, slug, summary, body, source, source_url, image_url, category, tags,
      published, published_at, created_by
    ) VALUES (
      ${title},
      ${slug},
      ${input.summary?.trim() || null},
      ${body},
      ${input.source?.trim() || null},
      ${input.sourceUrl?.trim() || null},
      ${input.imageUrl?.trim() || null},
      ${input.category?.trim() || "Immigration"},
      ${input.tags ?? []}::text[],
      ${published},
      ${published ? new Date().toISOString() : null},
      ${input.createdBy ?? null}
    )
    RETURNING *
  `) as NewsRow[]
  return mapNews(rows[0]!)
}

export async function updateNews(
  id: number,
  input: Partial<{
    title: string
    summary: string | null
    body: string
    source: string | null
    sourceUrl: string | null
    imageUrl: string | null
    category: string
    tags: string[]
    published: boolean
  }>,
): Promise<ImmigrationNews | null> {
  if (!careerSql) throw new Error("Database is not configured")
  const current = (await careerSql`
    SELECT * FROM career.immigration_news WHERE id = ${id} LIMIT 1
  `) as NewsRow[]
  if (!current[0]) return null

  const title = input.title?.trim() ?? current[0].title
  const body = input.body?.trim() ?? current[0].body
  const summary = input.summary !== undefined ? input.summary?.trim() || null : current[0].summary
  const source = input.source !== undefined ? input.source?.trim() || null : current[0].source
  const sourceUrl = input.sourceUrl !== undefined ? input.sourceUrl?.trim() || null : current[0].source_url
  const imageUrl = input.imageUrl !== undefined ? input.imageUrl?.trim() || null : current[0].image_url
  const category = input.category?.trim() || current[0].category
  const tags = input.tags ?? current[0].tags ?? []
  const published = input.published ?? current[0].published
  const publishedAt =
    published
      ? current[0].published_at || new Date().toISOString()
      : null

  const rows = (await careerSql`
    UPDATE career.immigration_news
    SET title = ${title},
        summary = ${summary},
        body = ${body},
        source = ${source},
        source_url = ${sourceUrl},
        image_url = ${imageUrl},
        category = ${category},
        tags = ${tags}::text[],
        published = ${published},
        published_at = ${publishedAt},
        updated_at = now()
    WHERE id = ${id}
    RETURNING *
  `) as NewsRow[]
  return rows[0] ? mapNews(rows[0]) : null
}

export async function deleteNews(id: number): Promise<boolean> {
  if (!careerSql) throw new Error("Database is not configured")
  const rows = await careerSql`
    DELETE FROM career.immigration_news WHERE id = ${id} RETURNING id
  `
  return rows.length > 0
}
