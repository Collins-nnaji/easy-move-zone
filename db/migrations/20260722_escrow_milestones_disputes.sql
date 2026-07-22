-- Milestone escrow + evidence-backed disputes
--
-- Replaces the all-or-nothing "complete the shift, release everything" payout
-- with staged releases unlocked by verifiable events (geofenced pickup,
-- geofenced delivery + OTP, then a holdback that auto-releases once the
-- dispute window closes).

-- ---------------------------------------------------------------------------
-- Geofence anchors on the load itself
-- ---------------------------------------------------------------------------

alter table driver_shifts add column if not exists pickup_lat double precision;
alter table driver_shifts add column if not exists pickup_lng double precision;
alter table driver_shifts add column if not exists dropoff_lat double precision;
alter table driver_shifts add column if not exists dropoff_lng double precision;
-- Radius (metres) a driver must be within to confirm a milestone at that point.
alter table driver_shifts add column if not exists geofence_radius_m integer not null default 200;

-- Escrow roll-up, kept on the shift so list views need no joins.
alter table driver_shifts add column if not exists escrow_released_cents integer not null default 0;
alter table driver_shifts add column if not exists escrow_state text not null default 'unfunded'
  check (escrow_state in ('unfunded', 'funded', 'partially_released', 'released', 'refunded', 'disputed'));
-- One-time code the receiver reads out to the driver at drop-off.
alter table driver_shifts add column if not exists delivery_otp text;
-- When the 10% holdback becomes auto-releasable (set at delivery confirmation).
alter table driver_shifts add column if not exists holdback_release_at timestamptz;

-- ---------------------------------------------------------------------------
-- Milestones: the escrow schedule for a load
-- ---------------------------------------------------------------------------

create table if not exists shift_milestones (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  kind text not null check (kind in ('pickup', 'checkpoint', 'delivery', 'holdback')),
  sequence integer not null,
  -- Share of gross payout this milestone unlocks, in basis points (2000 = 20%).
  release_bps integer not null check (release_bps >= 0 and release_bps <= 10000),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'ready', 'released', 'skipped', 'withheld')),
  requires_geofence boolean not null default false,
  requires_photo boolean not null default false,
  requires_otp boolean not null default false,
  confirmed_by text,
  confirmed_at timestamptz,
  confirmed_lat double precision,
  confirmed_lng double precision,
  released_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (shift_id, kind, sequence)
);

create index if not exists idx_shift_milestones_shift on shift_milestones(shift_id, sequence);
create index if not exists idx_shift_milestones_status on shift_milestones(status) where status in ('pending', 'ready');

-- ---------------------------------------------------------------------------
-- Evidence: what makes a dispute resolvable instead of he-said/she-said
-- ---------------------------------------------------------------------------

create table if not exists shift_evidence (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  milestone_id uuid references shift_milestones(id) on delete set null,
  auth_user_id text not null,
  role text not null check (role in ('driver', 'fleet', 'system')),
  kind text not null check (kind in ('photo', 'signature', 'otp', 'gps_ping', 'note')),
  -- Base64 payload for photo/signature; short text for otp/note. Mirrors how
  -- driver_compliance_docs already stores uploaded files.
  file_name text,
  file_mime text,
  file_data text,
  body text,
  lat double precision,
  lng double precision,
  -- SHA-256 of file_data/body at capture time, so later edits are detectable.
  content_hash text,
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_shift_evidence_shift on shift_evidence(shift_id, captured_at);
create index if not exists idx_shift_evidence_milestone on shift_evidence(milestone_id) where milestone_id is not null;

-- GPS breadcrumb trail, written while a session is active.
create table if not exists shift_location_pings (
  id bigserial primary key,
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  auth_user_id text not null,
  lat double precision not null,
  lng double precision not null,
  accuracy_m double precision,
  recorded_at timestamptz not null default now()
);

create index if not exists idx_shift_pings_shift on shift_location_pings(shift_id, recorded_at desc);

-- ---------------------------------------------------------------------------
-- Disputes
-- ---------------------------------------------------------------------------

create table if not exists shift_disputes (
  id uuid primary key default gen_random_uuid(),
  shift_id uuid not null references driver_shifts(id) on delete cascade,
  opened_by text not null,
  opened_role text not null check (opened_role in ('driver', 'fleet', 'system')),
  category text not null check (category in (
    'no_show', 'cargo_damage', 'shortage', 'non_payment',
    'route_deviation', 'safety_incident', 'other'
  )),
  description text,
  status text not null default 'open'
    check (status in ('open', 'evidence', 'review', 'escalated', 'resolved', 'withdrawn')),
  -- How the outcome was reached, once it has been.
  resolution text check (resolution in (
    'release_to_driver', 'refund_to_fleet', 'split', 'no_action'
  )),
  resolution_note text,
  resolved_by text,
  resolved_at timestamptz,
  -- Amounts moved by the resolution, for reconciliation against the ledger.
  driver_award_cents integer not null default 0 check (driver_award_cents >= 0),
  fleet_refund_cents integer not null default 0 check (fleet_refund_cents >= 0),
  -- Evidence window close; auto-resolution rules fire after this.
  evidence_deadline timestamptz,
  auto_resolved boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_shift_disputes_status on shift_disputes(status, created_at desc);
create index if not exists idx_shift_disputes_shift on shift_disputes(shift_id, created_at desc);
-- At most one live dispute per load; resolved/withdrawn ones may accumulate.
create unique index if not exists idx_shift_disputes_one_active
  on shift_disputes(shift_id)
  where status in ('open', 'evidence', 'review', 'escalated');

-- Append-only audit of every dispute state change (who, what, when).
create table if not exists dispute_events (
  id bigserial primary key,
  dispute_id uuid not null references shift_disputes(id) on delete cascade,
  actor_user_id text,
  actor_role text not null default 'system' check (actor_role in ('driver', 'fleet', 'admin', 'system')),
  event text not null,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_dispute_events_dispute on dispute_events(dispute_id, created_at);

-- ---------------------------------------------------------------------------
-- Reliability score: dispute outcomes feed back into who gets premium work
-- ---------------------------------------------------------------------------

alter table driver_profiles add column if not exists reliability_score integer not null default 100
  check (reliability_score >= 0 and reliability_score <= 100);
alter table fleet_operator_profiles add column if not exists reliability_score integer not null default 100
  check (reliability_score >= 0 and reliability_score <= 100);

-- ---------------------------------------------------------------------------
-- Payment kinds for staged releases and refunds
-- ---------------------------------------------------------------------------

alter table marketplace_payments drop constraint if exists marketplace_payments_kind_check;
alter table marketplace_payments add constraint marketplace_payments_kind_check
  check (kind in ('load_fund', 'driver_payout', 'cashout', 'milestone_release', 'refund'));

alter table marketplace_payments add column if not exists milestone_id uuid
  references shift_milestones(id) on delete set null;

-- Loads already funded under the old all-or-nothing flow start in 'funded'.
update driver_shifts
set escrow_state = 'funded'
where funded = true and escrow_state = 'unfunded' and status <> 'completed';

update driver_shifts
set escrow_state = 'released', escrow_released_cents = payout_cents
where status = 'completed' and escrow_state = 'unfunded';
