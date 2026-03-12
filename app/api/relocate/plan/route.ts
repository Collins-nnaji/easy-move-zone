import { neon } from "@neondatabase/serverless"
import { neonAuth } from "@neondatabase/auth/next/server"
import type { RelocationContact, RelocationPlan, RelocationTask, RelocationStatus, WorkMode } from "@/lib/relocate/types"

export const runtime = "nodejs"

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL
const sql = DATABASE_URL ? neon(DATABASE_URL) : null

const ALLOWED_STATUSES = new Set<RelocationStatus>(["planning", "in_progress", "ready_to_move", "settled"])
const ALLOWED_WORK_MODES = new Set<WorkMode>(["onsite", "hybrid", "remote", "business_owner", "student"])

function safeNumber(value: unknown): number {
  const cast = Number(value)
  if (!Number.isFinite(cast) || cast < 0) return 0
  return Math.round(cast)
}

function safeDate(value: unknown): string | null {
  if (!value) return null
  const cast = String(value)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cast)) return null
  return cast
}

async function ensurePlanForUser(authUserId: string) {
  const rowsRaw = await sql!.query(
    `insert into relocation_plans (
      auth_user_id,
      plan_name,
      status
    ) values ($1, 'My relocation plan', 'planning')
    on conflict (auth_user_id) do update set
      updated_at = now()
    returning id`,
    [authUserId],
  )
  const rows = rowsRaw as Array<{ id: string }>
  return rows[0]?.id ?? null
}

export async function GET() {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)

    const planRaw = await sql.query(
      `select
        id,
        auth_user_id,
        plan_name,
        origin_city,
        origin_country,
        destination_city,
        destination_country,
        move_date,
        move_reason,
        household_size,
        work_mode,
        visa_pathway,
        status,
        budget_housing_usd,
        budget_travel_usd,
        budget_setup_usd,
        budget_buffer_usd,
        notes,
        created_at,
        updated_at
      from relocation_plans
      where auth_user_id = $1
      limit 1`,
      [authUserId],
    )
    const planRows = planRaw as Array<{
      id: string
      auth_user_id: string
      plan_name: string
      origin_city: string | null
      origin_country: string | null
      destination_city: string | null
      destination_country: string | null
      move_date: string | null
      move_reason: string | null
      household_size: number | null
      work_mode: WorkMode
      visa_pathway: string | null
      status: RelocationStatus
      budget_housing_usd: number | null
      budget_travel_usd: number | null
      budget_setup_usd: number | null
      budget_buffer_usd: number | null
      notes: string | null
      created_at: string
      updated_at: string
    }>

    const row = planRows[0]
    if (!row) {
      return Response.json({ plan: null, tasks: [], contacts: [] }, { status: 200 })
    }

    const [tasksRaw, contactsRaw] = await Promise.all([
      sql.query(
        `select
          id, plan_id, auth_user_id, title, category, due_date, status, priority, notes, created_at, updated_at
         from relocation_tasks
         where auth_user_id = $1 and plan_id = $2
         order by
           case status when 'in_progress' then 1 when 'todo' then 2 else 3 end,
           due_date asc nulls last,
           created_at desc`,
        [authUserId, row.id],
      ),
      sql.query(
        `select
          id, plan_id, auth_user_id, name, service_type, email, phone, website, notes, created_at, updated_at
         from relocation_contacts
         where auth_user_id = $1 and plan_id = $2
         order by created_at desc`,
        [authUserId, row.id],
      ),
    ])

    const tasks = (tasksRaw as Array<{
      id: string
      plan_id: string
      auth_user_id: string
      title: string
      category: RelocationTask["category"]
      due_date: string | null
      status: RelocationTask["status"]
      priority: RelocationTask["priority"]
      notes: string | null
      created_at: string
      updated_at: string
    }>).map((item): RelocationTask => ({
      id: item.id,
      planId: item.plan_id,
      authUserId: item.auth_user_id,
      title: item.title,
      category: item.category,
      dueDate: item.due_date,
      status: item.status,
      priority: item.priority,
      notes: item.notes ?? "",
      createdAt: new Date(item.created_at).toISOString(),
      updatedAt: new Date(item.updated_at).toISOString(),
    }))

    const contacts = (contactsRaw as Array<{
      id: string
      plan_id: string
      auth_user_id: string
      name: string
      service_type: string
      email: string | null
      phone: string | null
      website: string | null
      notes: string | null
      created_at: string
      updated_at: string
    }>).map((item): RelocationContact => ({
      id: item.id,
      planId: item.plan_id,
      authUserId: item.auth_user_id,
      name: item.name,
      serviceType: item.service_type,
      email: item.email ?? "",
      phone: item.phone ?? "",
      website: item.website ?? "",
      notes: item.notes ?? "",
      createdAt: new Date(item.created_at).toISOString(),
      updatedAt: new Date(item.updated_at).toISOString(),
    }))

    const plan: RelocationPlan = {
      id: row.id,
      authUserId: row.auth_user_id,
      planName: row.plan_name,
      originCity: row.origin_city ?? "",
      originCountry: row.origin_country ?? "",
      destinationCity: row.destination_city ?? "",
      destinationCountry: row.destination_country ?? "",
      moveDate: row.move_date,
      moveReason: row.move_reason ?? "",
      householdSize: row.household_size ?? 1,
      workMode: row.work_mode,
      visaPathway: row.visa_pathway ?? "",
      status: row.status,
      budgetHousingUsd: row.budget_housing_usd ?? 0,
      budgetTravelUsd: row.budget_travel_usd ?? 0,
      budgetSetupUsd: row.budget_setup_usd ?? 0,
      budgetBufferUsd: row.budget_buffer_usd ?? 0,
      notes: row.notes ?? "",
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }

    return Response.json({ plan, tasks, contacts }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to load relocation workspace." }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const { session, user } = await neonAuth()
    if (!session || !user) return Response.json({ error: "Unauthorized" }, { status: 401 })
    if (!sql) return Response.json({ error: "Database not configured." }, { status: 500 })
    const authUserId = String(user.id)
    const body = (await request.json()) as {
      plan?: Partial<RelocationPlan>
    }
    const input = body.plan ?? {}

    const planName = String(input.planName ?? "My relocation plan").trim() || "My relocation plan"
    const originCity = String(input.originCity ?? "").trim()
    const originCountry = String(input.originCountry ?? "").trim()
    const destinationCity = String(input.destinationCity ?? "").trim()
    const destinationCountry = String(input.destinationCountry ?? "").trim()
    const moveDate = safeDate(input.moveDate)
    const moveReason = String(input.moveReason ?? "").trim()
    const householdSize = Math.max(1, safeNumber(input.householdSize || 1))
    const workMode = ALLOWED_WORK_MODES.has(input.workMode as WorkMode) ? (input.workMode as WorkMode) : "hybrid"
    const visaPathway = String(input.visaPathway ?? "").trim()
    const status = ALLOWED_STATUSES.has(input.status as RelocationStatus) ? (input.status as RelocationStatus) : "planning"
    const budgetHousingUsd = safeNumber(input.budgetHousingUsd)
    const budgetTravelUsd = safeNumber(input.budgetTravelUsd)
    const budgetSetupUsd = safeNumber(input.budgetSetupUsd)
    const budgetBufferUsd = safeNumber(input.budgetBufferUsd)
    const notes = String(input.notes ?? "").trim()

    const planId = await ensurePlanForUser(authUserId)
    if (!planId) return Response.json({ error: "Unable to initialize relocation plan." }, { status: 500 })

    const rowsRaw = await sql.query(
      `update relocation_plans
       set
         plan_name = $1,
         origin_city = $2,
         origin_country = $3,
         destination_city = $4,
         destination_country = $5,
         move_date = $6,
         move_reason = $7,
         household_size = $8,
         work_mode = $9,
         visa_pathway = $10,
         status = $11,
         budget_housing_usd = $12,
         budget_travel_usd = $13,
         budget_setup_usd = $14,
         budget_buffer_usd = $15,
         notes = $16,
         updated_at = now()
       where id = $17 and auth_user_id = $18
       returning
         id,
         auth_user_id,
         plan_name,
         origin_city,
         origin_country,
         destination_city,
         destination_country,
         move_date,
         move_reason,
         household_size,
         work_mode,
         visa_pathway,
         status,
         budget_housing_usd,
         budget_travel_usd,
         budget_setup_usd,
         budget_buffer_usd,
         notes,
         created_at,
         updated_at`,
      [
        planName,
        originCity || null,
        originCountry || null,
        destinationCity || null,
        destinationCountry || null,
        moveDate,
        moveReason || null,
        householdSize,
        workMode,
        visaPathway || null,
        status,
        budgetHousingUsd,
        budgetTravelUsd,
        budgetSetupUsd,
        budgetBufferUsd,
        notes || null,
        planId,
        authUserId,
      ],
    )

    const rows = rowsRaw as Array<{
      id: string
      auth_user_id: string
      plan_name: string
      origin_city: string | null
      origin_country: string | null
      destination_city: string | null
      destination_country: string | null
      move_date: string | null
      move_reason: string | null
      household_size: number | null
      work_mode: WorkMode
      visa_pathway: string | null
      status: RelocationStatus
      budget_housing_usd: number | null
      budget_travel_usd: number | null
      budget_setup_usd: number | null
      budget_buffer_usd: number | null
      notes: string | null
      created_at: string
      updated_at: string
    }>
    const row = rows[0]
    if (!row) return Response.json({ error: "Unable to save relocation plan." }, { status: 500 })

    const plan: RelocationPlan = {
      id: row.id,
      authUserId: row.auth_user_id,
      planName: row.plan_name,
      originCity: row.origin_city ?? "",
      originCountry: row.origin_country ?? "",
      destinationCity: row.destination_city ?? "",
      destinationCountry: row.destination_country ?? "",
      moveDate: row.move_date,
      moveReason: row.move_reason ?? "",
      householdSize: row.household_size ?? 1,
      workMode: row.work_mode,
      visaPathway: row.visa_pathway ?? "",
      status: row.status,
      budgetHousingUsd: row.budget_housing_usd ?? 0,
      budgetTravelUsd: row.budget_travel_usd ?? 0,
      budgetSetupUsd: row.budget_setup_usd ?? 0,
      budgetBufferUsd: row.budget_buffer_usd ?? 0,
      notes: row.notes ?? "",
      createdAt: new Date(row.created_at).toISOString(),
      updatedAt: new Date(row.updated_at).toISOString(),
    }

    return Response.json({ plan }, { status: 200 })
  } catch {
    return Response.json({ error: "Unable to save relocation plan." }, { status: 500 })
  }
}
