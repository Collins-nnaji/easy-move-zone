import { driverSql } from "@/lib/driver/db";
import { refreshDriverVerifiedBadge } from "@/lib/driver/vault";

export interface KycQueueItem {
  id: string;
  docKey: string;
  name: string;
  status: string;
  fileName: string | null;
  fileMime: string | null;
  updatedAt: string;
  driverUserId: string;
  driverName: string;
  zone: string;
  vehicleType: string;
  driverVerified: boolean;
}

export interface CashoutRow {
  id: string;
  payeeUserId: string;
  driverName: string;
  amountCents: number;
  status: string;
  stripeTransferId: string | null;
  error: string | null;
  payoutsEnabled: boolean;
  stripeAccountId: string | null;
  createdAt: string;
}

export interface DisputeFlag {
  ratingId: string;
  shiftId: string;
  stars: number;
  comment: string | null;
  fromRole: string;
  fromUserId: string;
  toUserId: string;
  shiftTitle: string;
  payout: number;
  zone: string;
  counterpartyName: string;
  createdAt: string;
}

export async function listKycQueue(status: "pending" | "all" = "pending"): Promise<KycQueueItem[]> {
  if (!driverSql) return [];

  const statusClause = status === "pending" ? "and d.status = 'pending'" : "";
  const rows = (await driverSql.query(
    `select d.id, d.doc_key, d.name, d.status, d.file_name, d.file_mime, d.updated_at,
            d.auth_user_id as driver_user_id,
            coalesce(p.display_name, 'Driver') as driver_name,
            coalesce(p.zone, '') as zone,
            coalesce(p.vehicle_type, '') as vehicle_type,
            coalesce(p.verified, false) as driver_verified
     from driver_compliance_docs d
     join driver_profiles p on p.auth_user_id = d.auth_user_id
     where d.file_name is not null ${statusClause}
     order by d.updated_at desc
     limit 200`,
  )) as Array<{
    id: string;
    doc_key: string;
    name: string;
    status: string;
    file_name: string | null;
    file_mime: string | null;
    updated_at: string;
    driver_user_id: string;
    driver_name: string;
    zone: string;
    vehicle_type: string;
    driver_verified: boolean;
  }>;

  return rows.map((r) => ({
    id: r.id,
    docKey: r.doc_key,
    name: r.name,
    status: r.status,
    fileName: r.file_name,
    fileMime: r.file_mime,
    updatedAt: r.updated_at,
    driverUserId: r.driver_user_id,
    driverName: r.driver_name,
    zone: r.zone,
    vehicleType: r.vehicle_type,
    driverVerified: r.driver_verified,
  }));
}

export async function reviewKycDocument(input: {
  docId: string;
  action: "approve" | "reject";
  reviewerEmail: string;
  notes?: string;
}) {
  if (!driverSql) throw new Error("Database not configured.");

  const nextStatus = input.action === "approve" ? "verified" : "rejected";
  const rows = (await driverSql.query(
    `update driver_compliance_docs
     set status = $2,
         reviewed_at = now(),
         reviewed_by = $3,
         reviewer_notes = $4,
         updated_at = now()
     where id = $1
     returning id, auth_user_id, status`,
    [input.docId, nextStatus, input.reviewerEmail, input.notes ?? null],
  )) as Array<{ id: string; auth_user_id: string; status: string }>;

  const row = rows[0];
  if (!row) throw new Error("Document not found.");

  const verified = await refreshDriverVerifiedBadge(row.auth_user_id);
  return { id: row.id, status: row.status, driverVerified: verified };
}

export async function getComplianceFileForAdmin(docId: string) {
  if (!driverSql) return null;
  const rows = (await driverSql.query(
    `select d.id, d.file_name, d.file_mime, d.file_data, d.auth_user_id,
            coalesce(p.display_name, 'Driver') as driver_name
     from driver_compliance_docs d
     left join driver_profiles p on p.auth_user_id = d.auth_user_id
     where d.id = $1`,
    [docId],
  )) as Array<{
    id: string;
    file_name: string | null;
    file_mime: string | null;
    file_data: string | null;
    auth_user_id: string;
    driver_name: string;
  }>;

  const row = rows[0];
  if (!row?.file_data) return null;
  return row;
}

export async function listCashouts(status?: "failed" | "succeeded" | "all"): Promise<CashoutRow[]> {
  if (!driverSql) return [];

  const params: string[] = [];
  let statusClause = "";
  if (status && status !== "all") {
    params.push(status);
    statusClause = `and mp.status = $${params.length}`;
  }

  const rows = (await driverSql.query(
    `select mp.id, mp.payee_user_id, mp.amount_cents, mp.status,
            mp.stripe_transfer_id, mp.metadata, mp.created_at,
            coalesce(dp.display_name, 'Driver') as driver_name,
            coalesce(dp.payouts_enabled, false) as payouts_enabled,
            dp.stripe_account_id
     from marketplace_payments mp
     left join driver_profiles dp on dp.auth_user_id = mp.payee_user_id
     where mp.kind = 'cashout' ${statusClause}
     order by mp.created_at desc
     limit 200`,
    params,
  )) as Array<{
    id: string;
    payee_user_id: string | null;
    amount_cents: number;
    status: string;
    stripe_transfer_id: string | null;
    metadata: { error?: string } | null;
    created_at: string;
    driver_name: string;
    payouts_enabled: boolean;
    stripe_account_id: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    payeeUserId: r.payee_user_id ?? "",
    driverName: r.driver_name,
    amountCents: r.amount_cents,
    status: r.status,
    stripeTransferId: r.stripe_transfer_id,
    error: r.metadata?.error ?? null,
    payoutsEnabled: r.payouts_enabled,
    stripeAccountId: r.stripe_account_id,
    createdAt: r.created_at,
  }));
}

export async function listDisputeFlags(): Promise<DisputeFlag[]> {
  if (!driverSql) return [];

  const rows = (await driverSql.query(
    `select r.id as rating_id, r.shift_id, r.stars, r.comment, r.from_role,
            r.from_user_id, r.to_user_id, r.created_at,
            coalesce(sh.title, sh.vehicle_label, 'Load') as shift_title,
            sh.payout_cents, sh.zone,
            case
              when r.from_role = 'driver' then coalesce(fo.company_name, 'Fleet operator')
              else coalesce(dp.display_name, 'Driver')
            end as counterparty_name
     from marketplace_ratings r
     join driver_shifts sh on sh.id = r.shift_id
     left join fleet_operator_profiles fo on fo.auth_user_id = sh.posted_by
     left join driver_profiles dp on dp.auth_user_id = sh.claimed_by
     where r.stars <= 2
     order by r.created_at desc
     limit 100`,
  )) as Array<{
    rating_id: string;
    shift_id: string;
    stars: number;
    comment: string | null;
    from_role: string;
    from_user_id: string;
    to_user_id: string;
    created_at: string;
    shift_title: string;
    payout_cents: number;
    zone: string;
    counterparty_name: string;
  }>;

  return rows.map((r) => ({
    ratingId: r.rating_id,
    shiftId: r.shift_id,
    stars: r.stars,
    comment: r.comment,
    fromRole: r.from_role,
    fromUserId: r.from_user_id,
    toUserId: r.to_user_id,
    shiftTitle: r.shift_title,
    payout: r.payout_cents / 100,
    zone: r.zone,
    counterpartyName: r.counterparty_name,
    createdAt: r.created_at,
  }));
}

export async function getOpsDashboardStats() {
  if (!driverSql) {
    return { pendingKyc: 0, failedCashouts: 0, disputeFlags: 0 };
  }

  const rows = (await driverSql.query(
    `select
       (select count(*)::int from driver_compliance_docs where status = 'pending' and file_name is not null) as pending_kyc,
       (select count(*)::int from marketplace_payments where kind = 'cashout' and status = 'failed') as failed_cashouts,
       (select count(*)::int from marketplace_ratings where stars <= 2) as dispute_flags`,
  )) as Array<{ pending_kyc: number; failed_cashouts: number; dispute_flags: number }>;

  const s = rows[0] ?? { pending_kyc: 0, failed_cashouts: 0, dispute_flags: 0 };
  return {
    pendingKyc: s.pending_kyc,
    failedCashouts: s.failed_cashouts,
    disputeFlags: s.dispute_flags,
  };
}
