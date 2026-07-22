import crypto from "crypto";
import { driverSql } from "@/lib/driver/db";
import { commissionCents, netPayoutCents } from "@/lib/marketplace/taxonomy";
import { formatMoneyFromCents } from "@/lib/money";
import {
  buildMilestoneSchedule,
  checkGeofence,
  generateDeliveryOtp,
  splitMilestoneAmounts,
  HOLDBACK_WINDOW_HOURS,
  type MilestoneKind,
  type MilestoneStatus,
} from "./schedule";

/**
 * Milestone escrow, DB side.
 *
 * Funding still happens through the existing Paystack/Stripe rails; this module
 * governs *when* escrowed money moves into the driver's wallet, one milestone
 * at a time, each gated on evidence.
 */

export interface MilestoneRow {
  id: string;
  shiftId: string;
  kind: MilestoneKind;
  sequence: number;
  releaseBps: number;
  amountCents: number;
  status: MilestoneStatus;
  requiresGeofence: boolean;
  requiresPhoto: boolean;
  requiresOtp: boolean;
  confirmedAt: string | null;
  releasedAt: string | null;
  label: string;
}

const LABELS: Record<MilestoneKind, string> = {
  pickup: "Pickup confirmed",
  checkpoint: "Mid-route checkpoint",
  delivery: "Delivery confirmed",
  holdback: "Quality holdback",
};

function requireSql() {
  if (!driverSql) throw new Error("Database not configured.");
  return driverSql;
}

function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

/**
 * Create the milestone schedule for a funded load. Idempotent — funding
 * webhooks can fire more than once, so a load that already has milestones is
 * left untouched.
 */
export async function ensureMilestones(shiftId: string): Promise<MilestoneRow[]> {
  const sql = requireSql();

  const existing = await listMilestones(shiftId);
  if (existing.length > 0) return existing;

  const shifts = (await sql.query(
    `select id, payout_cents, distance_mi from driver_shifts where id = $1`,
    [shiftId],
  )) as Array<{ id: string; payout_cents: number; distance_mi: number }>;

  const shift = shifts[0];
  if (!shift) throw new Error("Load not found.");

  const specs = buildMilestoneSchedule({ distanceMi: shift.distance_mi });
  const amounts = splitMilestoneAmounts(shift.payout_cents, specs);

  for (const [i, spec] of specs.entries()) {
    await sql.query(
      `insert into shift_milestones
         (shift_id, kind, sequence, release_bps, amount_cents, status,
          requires_geofence, requires_photo, requires_otp)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       on conflict (shift_id, kind, sequence) do nothing`,
      [
        shiftId,
        spec.kind,
        spec.sequence,
        spec.releaseBps,
        amounts[i],
        // The first milestone is immediately actionable; the rest unlock in order.
        i === 0 ? "ready" : "pending",
        spec.requiresGeofence,
        spec.requiresPhoto,
        spec.requiresOtp,
      ],
    );
  }

  await sql.query(
    `update driver_shifts
     set escrow_state = case when escrow_state = 'unfunded' then 'funded' else escrow_state end,
         delivery_otp = coalesce(delivery_otp, $2),
         updated_at = now()
     where id = $1`,
    [shiftId, generateDeliveryOtp()],
  );

  return listMilestones(shiftId);
}

export async function listMilestones(shiftId: string): Promise<MilestoneRow[]> {
  const sql = requireSql();
  const rows = (await sql.query(
    `select id, shift_id, kind, sequence, release_bps, amount_cents, status,
            requires_geofence, requires_photo, requires_otp,
            confirmed_at, released_at
     from shift_milestones where shift_id = $1 order by sequence`,
    [shiftId],
  )) as Array<{
    id: string;
    shift_id: string;
    kind: MilestoneKind;
    sequence: number;
    release_bps: number;
    amount_cents: number;
    status: MilestoneStatus;
    requires_geofence: boolean;
    requires_photo: boolean;
    requires_otp: boolean;
    confirmed_at: string | null;
    released_at: string | null;
  }>;

  return rows.map((r) => ({
    id: r.id,
    shiftId: r.shift_id,
    kind: r.kind,
    sequence: r.sequence,
    releaseBps: r.release_bps,
    amountCents: r.amount_cents,
    status: r.status,
    requiresGeofence: r.requires_geofence,
    requiresPhoto: r.requires_photo,
    requiresOtp: r.requires_otp,
    confirmedAt: r.confirmed_at,
    releasedAt: r.released_at,
    label: LABELS[r.kind],
  }));
}

/** Record a piece of evidence against a load (and optionally a milestone). */
export async function recordEvidence(params: {
  shiftId: string;
  milestoneId?: string | null;
  authUserId: string;
  role: "driver" | "fleet" | "system";
  kind: "photo" | "signature" | "otp" | "gps_ping" | "note";
  fileName?: string | null;
  fileMime?: string | null;
  fileData?: string | null;
  body?: string | null;
  lat?: number | null;
  lng?: number | null;
}): Promise<string> {
  const sql = requireSql();
  const payload = params.fileData ?? params.body ?? "";
  const rows = (await sql.query(
    `insert into shift_evidence
       (shift_id, milestone_id, auth_user_id, role, kind,
        file_name, file_mime, file_data, body, lat, lng, content_hash)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     returning id`,
    [
      params.shiftId,
      params.milestoneId ?? null,
      params.authUserId,
      params.role,
      params.kind,
      params.fileName ?? null,
      params.fileMime ?? null,
      params.fileData ?? null,
      params.body ?? null,
      params.lat ?? null,
      params.lng ?? null,
      payload ? sha256(payload) : null,
    ],
  )) as Array<{ id: string }>;

  return rows[0].id;
}

/** Append a GPS breadcrumb for the active load. */
export async function recordLocationPing(params: {
  shiftId: string;
  authUserId: string;
  lat: number;
  lng: number;
  accuracyM?: number | null;
}) {
  const sql = requireSql();
  await sql.query(
    `insert into shift_location_pings (shift_id, auth_user_id, lat, lng, accuracy_m)
     values ($1, $2, $3, $4, $5)`,
    [params.shiftId, params.authUserId, params.lat, params.lng, params.accuracyM ?? null],
  );
}

export interface ReleaseResult {
  milestone: MilestoneKind;
  releasedCents: number;
  driverNetCents: number;
  commissionCents: number;
  totalReleasedCents: number;
  escrowState: string;
  message: string;
}

/**
 * Move one milestone's money into the driver's wallet.
 *
 * Commission is taken proportionally at each release rather than all at the
 * end, so the ledger stays consistent if a later milestone is withheld by a
 * dispute.
 */
async function releaseMilestone(
  milestoneId: string,
  opts: { note?: string } = {},
): Promise<ReleaseResult> {
  const sql = requireSql();

  // Claim the milestone atomically so a double-submit can't pay twice.
  const claimed = (await sql.query(
    `update shift_milestones
     set status = 'released', released_at = now(), updated_at = now(),
         notes = coalesce($2, notes)
     where id = $1 and status <> 'released'
     returning shift_id, kind, amount_cents`,
    [milestoneId, opts.note ?? null],
  )) as Array<{ shift_id: string; kind: MilestoneKind; amount_cents: number }>;

  const row = claimed[0];
  if (!row) throw new Error("Milestone already released.");

  const shifts = (await sql.query(
    `select id, claimed_by, posted_by, commission_bps, payout_cents, vehicle_label
     from driver_shifts where id = $1`,
    [row.shift_id],
  )) as Array<{
    id: string;
    claimed_by: string | null;
    posted_by: string | null;
    commission_bps: number;
    payout_cents: number;
    vehicle_label: string;
  }>;

  const shift = shifts[0];
  if (!shift?.claimed_by) throw new Error("Load has no assigned driver.");

  const gross = row.amount_cents;
  const fee = commissionCents(gross, shift.commission_bps);
  const net = netPayoutCents(gross, shift.commission_bps);

  if (gross > 0) {
    await sql.query(
      `insert into driver_wallets (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
      [shift.claimed_by],
    );
    await sql.query(
      `update driver_wallets
       set available_cents = available_cents + $2,
           lifetime_cents = lifetime_cents + $2,
           updated_at = now()
       where auth_user_id = $1`,
      [shift.claimed_by, net],
    );
    await sql.query(
      `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
       values ($1, $2, $3, 'credit', $4)`,
      [shift.claimed_by, `${LABELS[row.kind]} — ${shift.vehicle_label}`, net, shift.id],
    );
    if (fee > 0) {
      await sql.query(
        `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
         values ($1, $2, $3, 'deduction', $4)`,
        [shift.claimed_by, `Platform commission (${shift.commission_bps / 100}%)`, -fee, shift.id],
      );
      await sql.query(
        `insert into marketplace_payments
           (kind, shift_id, milestone_id, payer_user_id, payee_user_id, amount_cents, status, metadata)
         values ('milestone_release', $1, $2, $3, $4, $5, 'succeeded', $6::jsonb)`,
        [
          shift.id,
          milestoneId,
          shift.posted_by,
          shift.claimed_by,
          gross,
          JSON.stringify({ milestone: row.kind, commission_cents: fee, net_cents: net }),
        ],
      );
    }
  }

  // Roll the shift-level escrow totals forward.
  const totals = (await sql.query(
    `update driver_shifts
     set escrow_released_cents = (
           select coalesce(sum(amount_cents), 0) from shift_milestones
           where shift_id = $1 and status = 'released'
         ),
         updated_at = now()
     where id = $1
     returning escrow_released_cents, payout_cents`,
    [shift.id],
  )) as Array<{ escrow_released_cents: number; payout_cents: number }>;

  const releasedTotal = totals[0]?.escrow_released_cents ?? gross;
  const fullyReleased = releasedTotal >= (totals[0]?.payout_cents ?? shift.payout_cents);

  await sql.query(
    `update driver_shifts
     set escrow_state = $2, updated_at = now()
     where id = $1 and escrow_state <> 'disputed'`,
    [shift.id, fullyReleased ? "released" : "partially_released"],
  );

  // Unlock the next milestone in sequence.
  await sql.query(
    `update shift_milestones
     set status = 'ready', updated_at = now()
     where shift_id = $1 and status = 'pending'
       and sequence = (
         select min(sequence) from shift_milestones where shift_id = $1 and status = 'pending'
       )`,
    [shift.id],
  );

  return {
    milestone: row.kind,
    releasedCents: gross,
    driverNetCents: net,
    commissionCents: fee,
    totalReleasedCents: releasedTotal,
    escrowState: fullyReleased ? "released" : "partially_released",
    message: `${LABELS[row.kind]} — ${formatMoneyFromCents(net)} released to driver.`,
  };
}

export interface ConfirmParams {
  authUserId: string;
  shiftId: string;
  lat?: number | null;
  lng?: number | null;
  photoData?: string | null;
  photoMime?: string | null;
  otp?: string | null;
  note?: string | null;
}

/**
 * Driver confirms a milestone. Runs the gate checks (geofence / photo / OTP)
 * that milestone declares, records evidence, then releases its share.
 */
export async function confirmMilestone(
  kind: MilestoneKind,
  params: ConfirmParams,
): Promise<ReleaseResult> {
  const sql = requireSql();

  const shifts = (await sql.query(
    `select id, claimed_by, status, funded, escrow_state,
            pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
            geofence_radius_m, delivery_otp
     from driver_shifts where id = $1`,
    [params.shiftId],
  )) as Array<{
    id: string;
    claimed_by: string | null;
    status: string;
    funded: boolean;
    escrow_state: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    dropoff_lat: number | null;
    dropoff_lng: number | null;
    geofence_radius_m: number;
    delivery_otp: string | null;
  }>;

  const shift = shifts[0];
  if (!shift) throw new Error("Load not found.");
  if (shift.claimed_by !== params.authUserId) {
    throw new Error("You can only confirm milestones on loads you claimed.");
  }
  if (!shift.funded) throw new Error("This load is not funded.");
  if (shift.escrow_state === "disputed") {
    throw new Error("This load is under dispute. Milestones are frozen until it resolves.");
  }

  await ensureMilestones(params.shiftId);

  const milestones = await listMilestones(params.shiftId);
  const target = milestones.find((m) => m.kind === kind);
  if (!target) throw new Error(`No ${kind} milestone on this load.`);
  if (target.status === "released") throw new Error(`${LABELS[kind]} is already confirmed.`);
  if (target.status === "withheld") {
    throw new Error(`${LABELS[kind]} is withheld pending dispute resolution.`);
  }
  if (target.status === "pending") {
    throw new Error(`Complete the earlier milestones before ${LABELS[kind].toLowerCase()}.`);
  }

  // Geofence gate.
  if (target.requiresGeofence) {
    const anchor =
      kind === "delivery"
        ? { lat: shift.dropoff_lat, lng: shift.dropoff_lng }
        : { lat: shift.pickup_lat, lng: shift.pickup_lng };

    const fence = checkGeofence(
      { lat: params.lat, lng: params.lng },
      anchor,
      shift.geofence_radius_m,
    );
    if (!fence.inside) {
      throw new Error(
        Number.isFinite(fence.distanceM)
          ? `You are ${Math.round(fence.distanceM)}m from the ${kind} point. Get within ${shift.geofence_radius_m}m to confirm.`
          : "Location required. Enable GPS to confirm this milestone.",
      );
    }
  }

  // Photo gate.
  if (target.requiresPhoto && !params.photoData) {
    throw new Error("A photo of the cargo is required to confirm this milestone.");
  }

  // OTP gate — the receiver's code proves someone at the drop-off signed off.
  if (target.requiresOtp) {
    if (!params.otp) throw new Error("Enter the delivery code from the receiver.");
    if (shift.delivery_otp && params.otp.trim() !== shift.delivery_otp) {
      throw new Error("Delivery code does not match.");
    }
  }

  await sql.query(
    `update shift_milestones
     set confirmed_by = $2, confirmed_at = now(),
         confirmed_lat = $3, confirmed_lng = $4, updated_at = now()
     where id = $1`,
    [target.id, params.authUserId, params.lat ?? null, params.lng ?? null],
  );

  if (params.photoData) {
    await recordEvidence({
      shiftId: params.shiftId,
      milestoneId: target.id,
      authUserId: params.authUserId,
      role: "driver",
      kind: "photo",
      fileName: `${kind}-${Date.now()}.jpg`,
      fileMime: params.photoMime ?? "image/jpeg",
      fileData: params.photoData,
      lat: params.lat ?? null,
      lng: params.lng ?? null,
    });
  }

  if (params.otp) {
    await recordEvidence({
      shiftId: params.shiftId,
      milestoneId: target.id,
      authUserId: params.authUserId,
      role: "driver",
      kind: "otp",
      body: params.otp.trim(),
      lat: params.lat ?? null,
      lng: params.lng ?? null,
    });
  }

  if (params.lat != null && params.lng != null) {
    await recordLocationPing({
      shiftId: params.shiftId,
      authUserId: params.authUserId,
      lat: params.lat,
      lng: params.lng,
    });
  }

  if (kind === "pickup") {
    await sql.query(
      `update driver_shifts set status = 'active', updated_at = now()
       where id = $1 and status in ('claimed', 'open')`,
      [params.shiftId],
    );
  }

  const result = await releaseMilestone(target.id, { note: params.note ?? undefined });

  // Delivery starts the holdback clock rather than paying it out immediately.
  if (kind === "delivery") {
    await sql.query(
      `update driver_shifts
       set holdback_release_at = now() + ($2 || ' hours')::interval, updated_at = now()
       where id = $1`,
      [params.shiftId, String(HOLDBACK_WINDOW_HOURS)],
    );
  }

  return result;
}

/**
 * Release holdbacks whose dispute window has closed with no dispute filed.
 * Safe to call from a cron, a webhook, or opportunistically on read.
 */
export async function releaseMaturedHoldbacks(): Promise<ReleaseResult[]> {
  const sql = requireSql();

  const due = (await sql.query(
    `select m.id
     from shift_milestones m
     join driver_shifts s on s.id = m.shift_id
     where m.kind = 'holdback'
       and m.status = 'ready'
       and s.holdback_release_at is not null
       and s.holdback_release_at <= now()
       and s.escrow_state <> 'disputed'
       and not exists (
         select 1 from shift_disputes d
         where d.shift_id = s.id and d.status in ('open', 'evidence', 'review', 'escalated')
       )
     limit 100`,
  )) as Array<{ id: string }>;

  const results: ReleaseResult[] = [];
  for (const row of due) {
    try {
      results.push(await releaseMilestone(row.id, { note: "Auto-released: dispute window closed" }));
    } catch {
      // A concurrent release already claimed it; nothing to do.
    }
  }
  return results;
}

/** Escrow summary for a load, for driver and fleet UIs. */
export async function getEscrowSummary(shiftId: string) {
  const sql = requireSql();
  const rows = (await sql.query(
    `select payout_cents, escrow_released_cents, escrow_state, holdback_release_at, delivery_otp
     from driver_shifts where id = $1`,
    [shiftId],
  )) as Array<{
    payout_cents: number;
    escrow_released_cents: number;
    escrow_state: string;
    holdback_release_at: string | null;
    delivery_otp: string | null;
  }>;

  const shift = rows[0];
  if (!shift) throw new Error("Load not found.");

  const milestones = await listMilestones(shiftId);

  return {
    totalCents: shift.payout_cents,
    releasedCents: shift.escrow_released_cents,
    heldCents: Math.max(0, shift.payout_cents - shift.escrow_released_cents),
    state: shift.escrow_state,
    holdbackReleaseAt: shift.holdback_release_at,
    milestones,
  };
}

/** The delivery code, shown only to the fleet operator who posted the load. */
export async function getDeliveryOtpForFleet(authUserId: string, shiftId: string): Promise<string | null> {
  const sql = requireSql();
  const rows = (await sql.query(
    `select delivery_otp, posted_by from driver_shifts where id = $1`,
    [shiftId],
  )) as Array<{ delivery_otp: string | null; posted_by: string | null }>;

  const shift = rows[0];
  if (!shift) throw new Error("Load not found.");
  if (shift.posted_by !== authUserId) throw new Error("Not your load.");
  return shift.delivery_otp;
}
