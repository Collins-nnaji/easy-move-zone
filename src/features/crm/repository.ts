import type { Client, DashboardMetrics, Prospect, ThreadMessage, ThreadSummary } from "./types";

export interface QueryResult<T> {
  rows: T[];
}

export interface DbExecutor {
  query<T>(sql: string, params?: unknown[]): Promise<QueryResult<T>>;
}

interface ProspectRow {
  id: string;
  first_name: string;
  last_name: string;
  company_name: string | null;
  email: string;
  phone: string | null;
  source: string | null;
  lifecycle: Prospect["lifecycle"];
  score: number;
  owner_user_id: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientRow {
  id: string;
  prospect_id: string | null;
  company_name: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string | null;
  lifecycle: Client["lifecycle"];
  owner_user_id: string | null;
  arr_usd: number;
  renewal_date: string | null;
  notes: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
}

interface ThreadRow {
  id: string;
  subject: string;
  channel: ThreadSummary["channel"];
  status: ThreadSummary["status"];
  prospect_id: string | null;
  client_id: string | null;
  last_message_at: string | null;
  unread_count: number;
}

interface MessageRow {
  id: string;
  thread_id: string;
  sender_participant_id: string | null;
  direction: ThreadMessage["direction"];
  body: string;
  metadata: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

interface MetricsRow {
  open_prospects: number;
  proposals_out: number;
  active_clients: number;
  total_arr_usd: number;
  open_tasks: number;
  unread_messages: number;
}

export class CrmRepository {
  constructor(private readonly db: DbExecutor) {}

  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const result = await this.db.query<MetricsRow>("select * from crm_dashboard_metrics");
    const row = result.rows[0];
    return {
      openProspects: row?.open_prospects ?? 0,
      proposalsOut: row?.proposals_out ?? 0,
      activeClients: row?.active_clients ?? 0,
      totalArrUsd: row?.total_arr_usd ?? 0,
      openTasks: row?.open_tasks ?? 0,
      unreadMessages: row?.unread_messages ?? 0,
    };
  }

  async listProspects(limit = 25, offset = 0): Promise<Prospect[]> {
    const result = await this.db.query<ProspectRow>(
      `select *
         from prospects
        order by updated_at desc
        limit $1 offset $2`,
      [limit, offset],
    );
    return result.rows.map(this.mapProspect);
  }

  async listClients(limit = 25, offset = 0): Promise<Client[]> {
    const result = await this.db.query<ClientRow>(
      `select *
         from clients
        order by updated_at desc
        limit $1 offset $2`,
      [limit, offset],
    );
    return result.rows.map(this.mapClient);
  }

  async listInboxThreads(limit = 50): Promise<ThreadSummary[]> {
    const result = await this.db.query<ThreadRow>(
      `select *
         from crm_inbox_threads
        limit $1`,
      [limit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      subject: row.subject,
      channel: row.channel,
      status: row.status,
      prospectId: row.prospect_id,
      clientId: row.client_id,
      lastMessageAt: row.last_message_at,
      unreadCount: row.unread_count,
    }));
  }

  async getThreadMessages(threadId: string, limit = 50): Promise<ThreadMessage[]> {
    const result = await this.db.query<MessageRow>(
      `select *
         from communication_messages
        where thread_id = $1
        order by created_at desc
        limit $2`,
      [threadId, limit],
    );
    return result.rows.map((row) => ({
      id: row.id,
      threadId: row.thread_id,
      senderParticipantId: row.sender_participant_id,
      direction: row.direction,
      body: row.body,
      metadata: row.metadata ?? {},
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }

  private mapProspect(row: ProspectRow): Prospect {
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      companyName: row.company_name,
      email: row.email,
      phone: row.phone,
      source: row.source,
      lifecycle: row.lifecycle,
      score: row.score,
      ownerUserId: row.owner_user_id,
      notes: row.notes,
      lastContactedAt: row.last_contacted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private mapClient(row: ClientRow): Client {
    return {
      id: row.id,
      prospectId: row.prospect_id,
      companyName: row.company_name,
      primaryContactName: row.primary_contact_name,
      primaryContactEmail: row.primary_contact_email,
      primaryContactPhone: row.primary_contact_phone,
      lifecycle: row.lifecycle,
      ownerUserId: row.owner_user_id,
      arrUsd: row.arr_usd,
      renewalDate: row.renewal_date,
      notes: row.notes,
      lastContactedAt: row.last_contacted_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
