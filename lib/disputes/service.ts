import { driverSql } from "@/lib/driver/db";
import { commissionCents, netPayoutCents } from "@/lib/marketplace/taxonomy";
import { formatMoneyFromCents } from "@/lib/money";
import { recordEvidence } from "@/lib/escrow/service";
import {
  evaluateDispute,
  reliabilityPenalty,
  EVIDENCE_WINDOW_HOURS,
  type DisputeCategory,
  type DisputeFacts,
  type DisputeResolution,
  type DisputeStatus,
} from "./rules";

/**
 * Dispute lifecycle: open → evidence window → auto-rules → (resolve | human queue).
 *
 * Opening a dispute freezes the load's escrow so no further milestone can pay
 * out while the claim is live.
 */

function requireSql() {
  if (!driverSql) throw new Error("Database not configured.");
  return driverSql;
}

export interface DisputeRecord {
  id: string;
  shiftId: string;
  openedBy: string;
  openedRole: "driver" | "fleet" | "system";
  category: DisputeCategory;
  description: string | null;
  status: DisputeStatus;
  resolution: DisputeResolution | null;
  resolutionNote: string | null;
  driverAwardCents: number;
  fleetRefundCents: number;
  evidenceDeadline: string | null;
  autoResolved: boolean;
  createdAt: string;
}

async function logEvent(
  disputeId: string,
  event: string,
  actor: { userId?: string | null; role?: "driver" | "fleet" | "admin" | "system" } = {},
  detail: Record<string, unknown> = {},
) {
  const sql = requireSql();
  await sql.query(
    `insert into dispute_events (dispute_id, actor_user_id, actor_role, event, detail)
     values ($1, $2, $3, $4, $5::jsonb)`,
    [disputeId, actor.userId ?? null, actor.role ?? "system", event, JSON.stringify(detail)],
  );
}

/** Open a dispute against a load. Freezes escrow for the duration. */
export async function openDispute(params: {
  authUserId: string;
  shiftId: string;
  category: DisputeCategory;
  description?: string | null;
}): Promise<DisputeRecord> {
  const sql = requireSql();

  const shifts = (await sql.query(
    `select id, posted_by, claimed_by, escrow_state, payout_cents from driver_shifts where id = $1`,
    [params.shiftId],
  )) as Array<{
    id: string;
    posted_by: string | null;
    claimed_by: string | null;
    escrow_state: string;
    payout_cents: number;
  }>;

  const shift = shifts[0];
  if (!shift) throw new Error("Load not found.");

  const role: "driver" | "fleet" =
    shift.claimed_by === params.authUserId
      ? "driver"
      : shift.posted_by === params.authUserId
        ? "fleet"
        : (() => {
            throw new Error("You are not a party to this load.");
          })();

  const existing = (await sql.query(
    `select id from shift_disputes
     where shift_id = $1 and status in ('open', 'evidence', 'review', 'escalated')`,
    [params.shiftId],
  )) as Array<{ id: string }>;
  if (existing[0]) throw new Error("A dispute is already open on this load.");

  const rows = (await sql.query(
    `insert into shift_disputes
       (shift_id, opened_by, opened_role, category, description, status, evidence_deadline)
     values ($1, $2, $3, $4, $5, 'evidence', now() + ($6 || ' hours')::interval)
     returning id, shift_id, opened_by, opened_role, category, description, status,
               resolution, resolution_note, driver_award_cents, fleet_refund_cents,
               evidence_deadline, auto_resolved, created_at`,
    [
      params.shiftId,
      params.authUserId,
      role,
      params.category,
      params.description ?? null,
      String(EVIDENCE_WINDOW_HOURS),
    ],
  )) as Array<Record<string, unknown>>;

  const dispute = mapDispute(rows[0]);

  // Freeze escrow: no milestone pays out while a dispute is live.
  await sql.query(
    `update driver_shifts set escrow_state = 'disputed', updated_at = now() where id = $1`,
    [params.shiftId],
  );
  await sql.query(
    `update shift_milestones set status = 'withheld', updated_at = now()
     where shift_id = $1 and status in ('pending', 'ready')`,
    [params.shiftId],
  );

  await logEvent(dispute.id, "opened", { userId: params.authUserId, role }, {
    category: params.category,
  });

  return dispute;
}

/** Attach evidence (photo, note) to an open dispute. */
export async function addDisputeEvidence(params: {
  authUserId: string;
  disputeId: string;
  kind: "photo" | "note";
  body?: string | null;
  fileData?: string | null;
  fileMime?: string | null;
}) {
  const sql = requireSql();

  const rows = (await sql.query(
    `select d.id, d.shift_id, d.status, s.posted_by, s.claimed_by
     from shift_disputes d join driver_shifts s on s.id = d.shift_id
     where d.id = $1`,
    [params.disputeId],
  )) as Array<{
    id: string;
    shift_id: string;
    status: DisputeStatus;
    posted_by: string | null;
    claimed_by: string | null;
  }>;

  const dispute = rows[0];
  if (!dispute) throw new Error("Dispute not found.");
  if (dispute.status === "resolved" || dispute.status === "withdrawn") {
    throw new Error("This dispute is closed.");
  }

  const role =
    dispute.claimed_by === params.authUserId
      ? "driver"
      : dispute.posted_by === params.authUserId
        ? "fleet"
        : null;
  if (!role) throw new Error("You are not a party to this dispute.");

  const evidenceId = await recordEvidence({
    shiftId: dispute.shift_id,
    authUserId: params.authUserId,
    role,
    kind: params.kind === "photo" ? "photo" : "note",
    fileData: params.fileData ?? null,
    fileMime: params.fileMime ?? null,
    fileName: params.kind === "photo" ? `dispute-${Date.now()}.jpg` : null,
    body: params.body ?? null,
  });

  // A reply from the respondent matters to the auto-rules.
  await logEvent(params.disputeId, "evidence_added", { userId: params.authUserId, role }, {
    evidence_id: evidenceId,
    kind: params.kind,
  });

  return { evidenceId };
}

/** Gather the facts the rules engine needs for a dispute. */
async function collectFacts(disputeId: string): Promise<DisputeFacts & { shiftId: string }> {
  const sql = requireSql();

  const rows = (await sql.query(
    `select d.id, d.shift_id, d.category, d.opened_by, d.opened_role, d.evidence_deadline,
            s.payout_cents, s.posted_by, s.claimed_by
     from shift_disputes d join driver_shifts s on s.id = d.shift_id
     where d.id = $1`,
    [disputeId],
  )) as Array<{
    id: string;
    shift_id: string;
    category: DisputeCategory;
    opened_by: string;
    opened_role: string;
    evidence_deadline: string | null;
    payout_cents: number;
    posted_by: string | null;
    claimed_by: string | null;
  }>;

  const d = rows[0];
  if (!d) throw new Error("Dispute not found.");

  const milestones = (await sql.query(
    `select kind, status, confirmed_at from shift_milestones where shift_id = $1`,
    [d.shift_id],
  )) as Array<{ kind: string; status: string; confirmed_at: string | null }>;

  const confirmed = (kind: string) =>
    milestones.some((m) => m.kind === kind && m.confirmed_at != null);

  const photos = (await sql.query(
    `select e.kind, m.kind as milestone_kind
     from shift_evidence e
     left join shift_milestones m on m.id = e.milestone_id
     where e.shift_id = $1`,
    [d.shift_id],
  )) as Array<{ kind: string; milestone_kind: string | null }>;

  const hasPhotoAt = (milestoneKind: string) =>
    photos.some((p) => p.kind === "photo" && p.milestone_kind === milestoneKind);

  // Did the party the dispute is *against* respond during the window?
  const respondentId = d.opened_by === d.claimed_by ? d.posted_by : d.claimed_by;
  const replies = (await sql.query(
    `select 1 from dispute_events
     where dispute_id = $1 and event = 'evidence_added' and actor_user_id = $2 limit 1`,
    [disputeId, respondentId],
  )) as Array<unknown>;

  const priorUpheld = (await sql.query(
    `select count(*)::int as n from shift_disputes d2
     join driver_shifts s2 on s2.id = d2.shift_id
     where d2.status = 'resolved' and d2.id <> $1
       and (s2.claimed_by = $2 or s2.posted_by = $3)`,
    [disputeId, d.claimed_by, d.posted_by],
  )) as Array<{ n: number }>;

  return {
    shiftId: d.shift_id,
    category: d.category,
    payoutCents: d.payout_cents,
    pickupConfirmed: confirmed("pickup"),
    deliveryConfirmed: confirmed("delivery"),
    hasPickupPhoto: hasPhotoAt("pickup"),
    hasDeliveryPhoto: hasPhotoAt("delivery"),
    hasValidOtp: photos.some((p) => p.kind === "otp"),
    respondentReplied: replies.length > 0,
    windowClosed: d.evidence_deadline ? new Date(d.evidence_deadline) <= new Date() : false,
    repeatOffender: (priorUpheld[0]?.n ?? 0) >= 2,
  };
}

/**
 * Run the rules engine against a dispute. Auto-resolves where the facts decide
 * it; otherwise moves it into the ops queue.
 */
export async function evaluateAndAdvance(disputeId: string) {
  const sql = requireSql();
  const facts = await collectFacts(disputeId);
  const outcome = evaluateDispute(facts);

  if (outcome.status !== "resolved") {
    await sql.query(
      `update shift_disputes set status = $2, resolution_note = $3, updated_at = now()
       where id = $1 and status not in ('resolved', 'withdrawn')`,
      [disputeId, outcome.status, outcome.reason],
    );
    await logEvent(disputeId, `routed_${outcome.status}`, { role: "system" }, {
      reason: outcome.reason,
    });
    return { ...outcome, applied: false };
  }

  await applyResolution({
    disputeId,
    resolution: outcome.resolution ?? "no_action",
    driverShare: outcome.driverShare,
    note: outcome.reason,
    autoResolved: true,
  });

  return { ...outcome, applied: true };
}

/**
 * Settle a dispute and move the held money.
 *
 * `driverShare` is the fraction of the *still-held* escrow awarded to the
 * driver; the remainder is refunded to the fleet operator.
 */
export async function applyResolution(params: {
  disputeId: string;
  resolution: DisputeResolution;
  driverShare: number;
  note?: string | null;
  resolvedBy?: string | null;
  autoResolved?: boolean;
}) {
  const sql = requireSql();

  const rows = (await sql.query(
    `select d.id, d.shift_id, d.category, d.status,
            s.payout_cents, s.escrow_released_cents, s.commission_bps,
            s.posted_by, s.claimed_by, s.vehicle_label
     from shift_disputes d join driver_shifts s on s.id = d.shift_id
     where d.id = $1`,
    [params.disputeId],
  )) as Array<{
    id: string;
    shift_id: string;
    category: DisputeCategory;
    status: DisputeStatus;
    payout_cents: number;
    escrow_released_cents: number;
    commission_bps: number;
    posted_by: string | null;
    claimed_by: string | null;
    vehicle_label: string;
  }>;

  const d = rows[0];
  if (!d) throw new Error("Dispute not found.");
  if (d.status === "resolved") throw new Error("Dispute is already resolved.");

  const held = Math.max(0, d.payout_cents - d.escrow_released_cents);
  const share = Math.min(1, Math.max(0, params.driverShare));
  const driverAwardGross = Math.round(held * share);
  const fleetRefund = held - driverAwardGross;

  const fee = commissionCents(driverAwardGross, d.commission_bps);
  const driverNet = netPayoutCents(driverAwardGross, d.commission_bps);

  if (driverAwardGross > 0 && d.claimed_by) {
    await sql.query(
      `insert into driver_wallets (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
      [d.claimed_by],
    );
    await sql.query(
      `update driver_wallets
       set available_cents = available_cents + $2,
           lifetime_cents = lifetime_cents + $2,
           updated_at = now()
       where auth_user_id = $1`,
      [d.claimed_by, driverNet],
    );
    await sql.query(
      `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
       values ($1, $2, $3, 'credit', $4)`,
      [d.claimed_by, `Dispute award — ${d.vehicle_label}`, driverNet, d.shift_id],
    );
    if (fee > 0) {
      await sql.query(
        `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
         values ($1, 'Platform commission', $2, 'deduction', $3)`,
        [d.claimed_by, -fee, d.shift_id],
      );
    }
    await sql.query(
      `insert into marketplace_payments
         (kind, shift_id, payer_user_id, payee_user_id, amount_cents, status, metadata)
       values ('milestone_release', $1, $2, $3, $4, 'succeeded', $5::jsonb)`,
      [
        d.shift_id,
        d.posted_by,
        d.claimed_by,
        driverAwardGross,
        JSON.stringify({ source: "dispute", dispute_id: params.disputeId }),
      ],
    );
  }

  if (fleetRefund > 0) {
    // Recorded against the ledger; the actual card/bank refund is issued by the
    // payment provider from this record.
    await sql.query(
      `insert into marketplace_payments
         (kind, shift_id, payer_user_id, payee_user_id, amount_cents, status, metadata)
       values ('refund', $1, $2, $3, $4, 'pending', $5::jsonb)`,
      [
        d.shift_id,
        d.claimed_by,
        d.posted_by,
        fleetRefund,
        JSON.stringify({ source: "dispute", dispute_id: params.disputeId }),
      ],
    );
  }

  await sql.query(
    `update shift_milestones
     set status = case when $2 > 0 then 'released' else 'skipped' end,
         released_at = case when $2 > 0 then now() else released_at end,
         updated_at = now()
     where shift_id = $1 and status = 'withheld'`,
    [d.shift_id, driverAwardGross],
  );

  await sql.query(
    `update driver_shifts
     set escrow_released_cents = escrow_released_cents + $2,
         escrow_state = case when $3 > 0 then 'refunded' else 'released' end,
         status = 'completed',
         updated_at = now()
     where id = $1`,
    [d.shift_id, driverAwardGross, fleetRefund],
  );

  await sql.query(
    `update shift_disputes
     set status = 'resolved', resolution = $2, resolution_note = $3,
         resolved_by = $4, resolved_at = now(),
         driver_award_cents = $5, fleet_refund_cents = $6,
         auto_resolved = $7, updated_at = now()
     where id = $1`,
    [
      params.disputeId,
      params.resolution,
      params.note ?? null,
      params.resolvedBy ?? null,
      driverAwardGross,
      fleetRefund,
      params.autoResolved ?? false,
    ],
  );

  // Reliability hit lands on whichever side the outcome went against.
  const penalty = reliabilityPenalty(d.category);
  if (params.resolution === "refund_to_fleet" && d.claimed_by) {
    await sql.query(
      `update driver_profiles
       set reliability_score = greatest(0, reliability_score - $2), updated_at = now()
       where auth_user_id = $1`,
      [d.claimed_by, penalty],
    );
  } else if (params.resolution === "release_to_driver" && d.posted_by) {
    await sql.query(
      `update fleet_operator_profiles
       set reliability_score = greatest(0, reliability_score - $2), updated_at = now()
       where auth_user_id = $1`,
      [d.posted_by, penalty],
    );
  }

  await logEvent(
    params.disputeId,
    "resolved",
    { userId: params.resolvedBy, role: params.autoResolved ? "system" : "admin" },
    {
      resolution: params.resolution,
      driver_award_cents: driverAwardGross,
      fleet_refund_cents: fleetRefund,
    },
  );

  return {
    resolution: params.resolution,
    driverAwardCents: driverAwardGross,
    driverNetCents: driverNet,
    fleetRefundCents: fleetRefund,
    message: `Dispute resolved: ${formatMoneyFromCents(driverNet)} to driver, ${formatMoneyFromCents(fleetRefund)} refunded.`,
  };
}

/**
 * Auto-detect no-shows: a load claimed but never picked up well past its start.
 * Intended to run on a schedule.
 */
export async function flagNoShows(hoursGrace = 4): Promise<string[]> {
  const sql = requireSql();

  const stale = (await sql.query(
    `select s.id, s.posted_by
     from driver_shifts s
     where s.status = 'claimed'
       and s.claimed_at is not null
       and s.claimed_at < now() - ($1 || ' hours')::interval
       and s.escrow_state in ('funded', 'partially_released')
       and not exists (
         select 1 from shift_milestones m
         where m.shift_id = s.id and m.kind = 'pickup' and m.confirmed_at is not null
       )
       and not exists (
         select 1 from shift_disputes d
         where d.shift_id = s.id and d.status in ('open', 'evidence', 'review', 'escalated')
       )
     limit 50`,
    [String(hoursGrace)],
  )) as Array<{ id: string; posted_by: string | null }>;

  const opened: string[] = [];
  for (const shift of stale) {
    if (!shift.posted_by) continue;
    try {
      const dispute = await openDispute({
        authUserId: shift.posted_by,
        shiftId: shift.id,
        category: "no_show",
        description: `Auto-flagged: pickup not confirmed within ${hoursGrace}h of claim.`,
      });
      await evaluateAndAdvance(dispute.id);
      opened.push(dispute.id);
    } catch {
      // Another process already opened one.
    }
  }
  return opened;
}

/** Disputes waiting on a human, newest first. */
export async function listOpenDisputes(): Promise<DisputeRecord[]> {
  const sql = requireSql();
  const rows = (await sql.query(
    `select id, shift_id, opened_by, opened_role, category, description, status,
            resolution, resolution_note, driver_award_cents, fleet_refund_cents,
            evidence_deadline, auto_resolved, created_at
     from shift_disputes
     where status in ('open', 'evidence', 'review', 'escalated')
     order by created_at desc limit 100`,
  )) as Array<Record<string, unknown>>;
  return rows.map(mapDispute);
}

/** Every dispute on a load, plus its evidence trail. */
export async function getDisputesForShift(shiftId: string): Promise<DisputeRecord[]> {
  const sql = requireSql();
  const rows = (await sql.query(
    `select id, shift_id, opened_by, opened_role, category, description, status,
            resolution, resolution_note, driver_award_cents, fleet_refund_cents,
            evidence_deadline, auto_resolved, created_at
     from shift_disputes where shift_id = $1 order by created_at desc`,
    [shiftId],
  )) as Array<Record<string, unknown>>;
  return rows.map(mapDispute);
}

function mapDispute(r: Record<string, unknown>): DisputeRecord {
  return {
    id: String(r.id),
    shiftId: String(r.shift_id),
    openedBy: String(r.opened_by),
    openedRole: r.opened_role as DisputeRecord["openedRole"],
    category: r.category as DisputeCategory,
    description: (r.description as string | null) ?? null,
    status: r.status as DisputeStatus,
    resolution: (r.resolution as DisputeResolution | null) ?? null,
    resolutionNote: (r.resolution_note as string | null) ?? null,
    driverAwardCents: Number(r.driver_award_cents ?? 0),
    fleetRefundCents: Number(r.fleet_refund_cents ?? 0),
    evidenceDeadline: (r.evidence_deadline as string | null) ?? null,
    autoResolved: Boolean(r.auto_resolved),
    createdAt: String(r.created_at),
  };
}
