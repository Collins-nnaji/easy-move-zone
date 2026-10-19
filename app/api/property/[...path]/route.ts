import { after, type NextRequest } from "next/server"
import serverless from "serverless-http"
import { neonAuth } from "@neondatabase/auth/next/server"
import { isAdminEmail } from "@/lib/auth/admin"

// The property API is an Express app (property/server). Each request is handed
// to it as an API Gateway-style event, with /api/property/* mapped to /api/*.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

type ServerlessResult = {
  statusCode: number
  headers?: Record<string, string | number | boolean>
  multiValueHeaders?: Record<string, (string | number | boolean)[]>
  body?: string
  isBase64Encoded?: boolean
}
type Handler = (event: unknown, context: unknown) => Promise<ServerlessResult>

type Loaded = {
  handler: Handler
  adminKey: string
  flush: () => Promise<void>
}

let handlerPromise: Promise<Loaded> | null = null

function load() {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      const server = await import("@/property/server/index.js")
      const { app, ensureDb } = (server.default ?? server) as { app: unknown; ensureDb: () => Promise<void> }
      const keys = await import("@/property/server/adminKey.js")
      const { ADMIN_KEY } = (keys.default ?? keys) as { ADMIN_KEY: string }
      const background = await import("@/property/server/background.js")
      const { flush } = (background.default ?? background) as Pick<Loaded, "flush">
      await ensureDb()
      return {
        handler: serverless(app as Parameters<typeof serverless>[0], { binary: true }) as unknown as Handler,
        adminKey: ADMIN_KEY,
        flush,
      }
    })().catch((err) => {
      handlerPromise = null
      throw err
    })
  }
  return handlerPromise
}

/* The admin_users check is a database read; cache it briefly per email. */
const ADMIN_CACHE_MS = 60_000
const adminCache = new Map<string, { admin: boolean; at: number }>()

async function isStaff(email: string) {
  const hit = adminCache.get(email)
  if (hit && hit.at > Date.now() - ADMIN_CACHE_MS) return hit.admin
  const admin = await isAdminEmail(email).catch(() => false)
  if (adminCache.size > 1000) adminCache.clear()
  adminCache.set(email, { admin, at: Date.now() })
  return admin
}

/** Headers only this route may set; anything a browser sends under them is dropped. */
const TRUSTED = ["x-admin-key", "x-emz-admin-email", "x-emz-user-id", "x-emz-user-email", "x-emz-user-name", "x-dev-user"]

async function handle(request: NextRequest) {
  let loaded
  try {
    loaded = await load()
  } catch (err) {
    console.error("Property API failed to start:", err)
    return Response.json({ error: "The property service is unavailable." }, { status: 503 })
  }

  const url = new URL(request.url)
  const path = url.pathname.replace(/^\/api\/property/, "/api") || "/api"

  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    if (!TRUSTED.includes(key)) headers[key] = value
  })

  // The signed-in user, verified by EasyMoveZone's Neon Auth. Staff are
  // signed-in users on the admin_users allowlist; for them the internal admin
  // key is added (property/server/auth.js checks it).
  if (/neon-auth/i.test(request.headers.get("cookie") || "")) {
    const session = await neonAuth().catch(() => null)
    const email = session?.session ? session.user?.email?.trim().toLowerCase() : ""
    if (email) {
      headers["x-emz-user-email"] = email
      if (session?.user?.id) headers["x-emz-user-id"] = String(session.user.id)
      if (session?.user?.name) headers["x-emz-user-name"] = String(session.user.name).slice(0, 200)
      if (await isStaff(email)) {
        headers["x-admin-key"] = loaded.adminKey
        headers["x-emz-admin-email"] = email
      }
    }
  }
  const multiValueHeaders = Object.fromEntries(Object.entries(headers).map(([k, v]) => [k, [v]]))

  const query: Record<string, string> = {}
  const multiQuery: Record<string, string[]> = {}
  url.searchParams.forEach((value, key) => {
    query[key] = value
    ;(multiQuery[key] ||= []).push(value)
  })

  const hasBody = request.method !== "GET" && request.method !== "HEAD"
  const body = hasBody ? Buffer.from(await request.arrayBuffer()) : null

  const event = {
    httpMethod: request.method,
    path,
    resource: path,
    headers,
    multiValueHeaders,
    queryStringParameters: Object.keys(query).length ? query : null,
    multiValueQueryStringParameters: Object.keys(multiQuery).length ? multiQuery : null,
    body: body && body.length ? body.toString("base64") : null,
    isBase64Encoded: Boolean(body && body.length),
    requestContext: {
      identity: { sourceIp: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "" },
    },
  }

  const result = await loaded.handler(event, { callbackWaitsForEmptyEventLoop: false })
  // Notices and the staff audit row are written after the reply is built
  // (property/server/background.js); finish them once the response is sent.
  after(() => loaded.flush())

  const out = new Headers()
  for (const [key, values] of Object.entries(result.multiValueHeaders || {})) {
    for (const v of values) out.append(key, String(v))
  }
  for (const [key, value] of Object.entries(result.headers || {})) {
    if (!out.has(key)) out.set(key, String(value))
  }
  out.delete("content-length")
  out.delete("transfer-encoding")

  const payload = result.body
    ? result.isBase64Encoded
      ? Buffer.from(result.body, "base64")
      : Buffer.from(result.body)
    : null
  const status = result.statusCode || 200
  const noBody = status === 204 || status === 304 || request.method === "HEAD"
  return new Response(noBody ? null : payload, { status, headers: out })
}

export const GET = handle
export const POST = handle
export const PUT = handle
export const PATCH = handle
export const DELETE = handle
export const HEAD = handle
export const OPTIONS = handle
