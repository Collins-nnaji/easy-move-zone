import { neon } from "@neondatabase/serverless";
import type {
  CrmClient,
  CrmDashboardMetrics,
  CrmMessage,
  CrmParticipant,
  CrmProspect,
  CrmThread,
  CrmThreadDetail,
} from "@/lib/crm/types";

const DATABASE_URL = process.env.DATABASE_URL ?? process.env.NEON_DATABASE_URL;
const sql = DATABASE_URL ? neon(DATABASE_URL) : null;

export const isCrmDatabaseConfigured = Boolean(sql);

function iso(value: unknown): string | null {
  if (!value) return null;
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function escapeLike(value: string): string {
  return value.replace(/[%_]/g, "\\$&");
}

export async function getCrmDashboardMetrics(): Promise<CrmDashboardMetrics> {
  if (!sql) {
    return {
      openProspects: 0,
      proposalsOut: 0,
      activeClients: 0,
      totalArrUsd: 0,
      openTasks: 0,
      unreadMessages: 0,
    };
  }

  try {
    const rows = (await sql.query("select * from crm_dashboard_metrics")) as Array<{
      open_prospects: number;
      proposals_out: number;
      active_clients: number;
      total_arr_usd: number;
      open_tasks: number;
      unread_messages: number;
    }>;
    const row = rows[0];
    return {
      openProspects: Number(row?.open_prospects ?? 0),
      proposalsOut: Number(row?.proposals_out ?? 0),
      activeClients: Number(row?.active_clients ?? 0),
      totalArrUsd: Number(row?.total_arr_usd ?? 0),
      openTasks: Number(row?.open_tasks ?? 0),
      unreadMessages: Number(row?.unread_messages ?? 0),
    };
  } catch {
    return {
      openProspects: 0,
      proposalsOut: 0,
      activeClients: 0,
      totalArrUsd: 0,
      openTasks: 0,
      unreadMessages: 0,
    };
  }
}

export async function getCrmProspects(filters?: {
  query?: string;
  lifecycle?: string;
  limit?: number;
}): Promise<CrmProspect[]> {
  if (!sql) return [];

  const params: unknown[] = [];
  const where: string[] = [];
  const query = filters?.query?.trim();
  if (query) {
    params.push(`%${escapeLike(query)}%`);
    where.push(`(concat(first_name, ' ', last_name) ilike $${params.length} escape '\\' or company_name ilike $${params.length} escape '\\')`);
  }
  if (filters?.lifecycle) {
    params.push(filters.lifecycle);
    where.push(`lifecycle = $${params.length}`);
  }
  params.push(Math.min(filters?.limit ?? 100, 200));

  const queryText = `
    select
      id, first_name, last_name, company_name, email, phone, source, lifecycle, score, notes, last_contacted_at, created_at, updated_at
    from prospects
    ${where.length ? `where ${where.join(" and ")}` : ""}
    order by updated_at desc
    limit $${params.length}
  `;

  try {
    const rows = (await sql.query(queryText, params)) as Array<{
      id: string;
      first_name: string;
      last_name: string;
      company_name: string | null;
      email: string;
      phone: string | null;
      source: string | null;
      lifecycle: CrmProspect["lifecycle"];
      score: number;
      notes: string | null;
      last_contacted_at: string | null;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      companyName: row.company_name,
      email: row.email,
      phone: row.phone,
      source: row.source,
      lifecycle: row.lifecycle,
      score: Number(row.score),
      notes: row.notes,
      lastContactedAt: iso(row.last_contacted_at),
      createdAt: iso(row.created_at) ?? new Date().toISOString(),
      updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getCrmClients(filters?: {
  query?: string;
  lifecycle?: string;
  limit?: number;
}): Promise<CrmClient[]> {
  if (!sql) return [];

  const params: unknown[] = [];
  const where: string[] = [];
  const query = filters?.query?.trim();
  if (query) {
    params.push(`%${escapeLike(query)}%`);
    where.push(`(company_name ilike $${params.length} escape '\\' or primary_contact_name ilike $${params.length} escape '\\')`);
  }
  if (filters?.lifecycle) {
    params.push(filters.lifecycle);
    where.push(`lifecycle = $${params.length}`);
  }
  params.push(Math.min(filters?.limit ?? 100, 200));

  const queryText = `
    select
      id, company_name, primary_contact_name, primary_contact_email, primary_contact_phone, lifecycle, arr_usd, renewal_date, notes, last_contacted_at, created_at, updated_at
    from clients
    ${where.length ? `where ${where.join(" and ")}` : ""}
    order by updated_at desc
    limit $${params.length}
  `;

  try {
    const rows = (await sql.query(queryText, params)) as Array<{
      id: string;
      company_name: string;
      primary_contact_name: string;
      primary_contact_email: string;
      primary_contact_phone: string | null;
      lifecycle: CrmClient["lifecycle"];
      arr_usd: number;
      renewal_date: string | null;
      notes: string | null;
      last_contacted_at: string | null;
      created_at: string;
      updated_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      companyName: row.company_name,
      primaryContactName: row.primary_contact_name,
      primaryContactEmail: row.primary_contact_email,
      primaryContactPhone: row.primary_contact_phone,
      lifecycle: row.lifecycle,
      arrUsd: Number(row.arr_usd),
      renewalDate: row.renewal_date ? String(row.renewal_date) : null,
      notes: row.notes,
      lastContactedAt: iso(row.last_contacted_at),
      createdAt: iso(row.created_at) ?? new Date().toISOString(),
      updatedAt: iso(row.updated_at) ?? new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export async function getCrmThreads(filters?: {
  channel?: string;
  status?: string;
  limit?: number;
}): Promise<CrmThread[]> {
  if (!sql) return [];

  const params: unknown[] = [];
  const where: string[] = [];
  if (filters?.channel) {
    params.push(filters.channel);
    where.push(`t.channel = $${params.length}`);
  }
  if (filters?.status) {
    params.push(filters.status);
    where.push(`t.status = $${params.length}`);
  }
  params.push(Math.min(filters?.limit ?? 100, 200));

  const queryText = `
    select
      t.id, t.subject, t.channel, t.status, t.prospect_id, t.client_id, t.last_message_at,
      coalesce(u.unread_count, 0) as unread_count,
      coalesce(
        concat(p.first_name, ' ', p.last_name),
        c.company_name,
        'Unknown contact'
      ) as related_name
    from communication_threads t
    left join (
      select thread_id, count(*) as unread_count
      from communication_messages
      where is_read = false
      group by thread_id
    ) u on u.thread_id = t.id
    left join prospects p on p.id = t.prospect_id
    left join clients c on c.id = t.client_id
    ${where.length ? `where ${where.join(" and ")}` : ""}
    order by t.last_message_at desc nulls last, t.created_at desc
    limit $${params.length}
  `;

  try {
    const rows = (await sql.query(queryText, params)) as Array<{
      id: string;
      subject: string;
      channel: CrmThread["channel"];
      status: CrmThread["status"];
      prospect_id: string | null;
      client_id: string | null;
      last_message_at: string | null;
      unread_count: number;
      related_name: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      channel: row.channel,
      status: row.status,
      prospectId: row.prospect_id,
      clientId: row.client_id,
      relatedName: row.related_name,
      lastMessageAt: iso(row.last_message_at),
      unreadCount: Number(row.unread_count),
    }));
  } catch {
    return [];
  }
}

export async function getCrmThreadDetail(threadId: string): Promise<CrmThreadDetail | null> {
  if (!sql) return null;

  try {
    const [threadRaw, participantRaw, messageRaw] = await Promise.all([
      sql.query(
        `
          select
            t.id, t.subject, t.channel, t.status, t.prospect_id, t.client_id, t.last_message_at,
            coalesce(u.unread_count, 0) as unread_count,
            coalesce(
              concat(p.first_name, ' ', p.last_name),
              c.company_name,
              'Unknown contact'
            ) as related_name
          from communication_threads t
          left join (
            select thread_id, count(*) as unread_count
            from communication_messages
            where is_read = false
            group by thread_id
          ) u on u.thread_id = t.id
          left join prospects p on p.id = t.prospect_id
          left join clients c on c.id = t.client_id
          where t.id = $1
          limit 1
        `,
        [threadId],
      ),
      sql.query(
        `
          select
            cp.id,
            cp.role,
            cp.user_id,
            cp.external_name,
            cp.external_email,
            cp.external_phone,
            u.full_name,
            u.email,
            u.phone
          from communication_participants cp
          left join crm_users u on u.id = cp.user_id
          where cp.thread_id = $1
          order by cp.created_at asc
        `,
        [threadId],
      ),
      sql.query(
        `
          select
            m.id,
            m.thread_id,
            m.direction,
            m.body,
            m.metadata,
            m.is_read,
            m.created_at,
            coalesce(u.full_name, cp.external_name, 'Unknown sender') as sender_name
          from communication_messages m
          left join communication_participants cp on cp.id = m.sender_participant_id
          left join crm_users u on u.id = cp.user_id
          where m.thread_id = $1
          order by m.created_at asc
        `,
        [threadId],
      ),
    ]);

    const threadRows = threadRaw as Array<{
      id: string;
      subject: string;
      channel: CrmThread["channel"];
      status: CrmThread["status"];
      prospect_id: string | null;
      client_id: string | null;
      last_message_at: string | null;
      unread_count: number;
      related_name: string;
    }>;

    const participantRows = participantRaw as Array<{
      id: string;
      role: CrmParticipant["role"];
      user_id: string | null;
      external_name: string | null;
      external_email: string | null;
      external_phone: string | null;
      full_name: string | null;
      email: string | null;
      phone: string | null;
    }>;

    const messageRows = messageRaw as Array<{
      id: string;
      thread_id: string;
      direction: CrmMessage["direction"];
      body: string;
      metadata: Record<string, unknown> | null;
      is_read: boolean;
      created_at: string;
      sender_name: string | null;
    }>;

    const threadRow = threadRows[0];
    if (!threadRow) return null;

    const thread: CrmThread = {
      id: threadRow.id,
      subject: threadRow.subject,
      channel: threadRow.channel,
      status: threadRow.status,
      prospectId: threadRow.prospect_id,
      clientId: threadRow.client_id,
      relatedName: threadRow.related_name,
      lastMessageAt: iso(threadRow.last_message_at),
      unreadCount: Number(threadRow.unread_count),
    };

    const participants: CrmParticipant[] = participantRows.map((row) => ({
      id: row.id,
      role: row.role,
      userId: row.user_id,
      displayName: row.full_name ?? row.external_name ?? "Unknown participant",
      email: row.email ?? row.external_email,
      phone: row.phone ?? row.external_phone,
    }));

    const messages: CrmMessage[] = messageRows.map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      direction: row.direction,
      body: row.body,
      metadata: row.metadata ?? {},
      isRead: row.is_read,
      createdAt: iso(row.created_at) ?? new Date().toISOString(),
      senderDisplayName: row.sender_name ?? "Unknown sender",
    }));

    return { thread, participants, messages };
  } catch {
    return null;
  }
}
