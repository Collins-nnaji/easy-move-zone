-- Payment rails: Stripe Connect + funded loads

alter table driver_profiles add column if not exists stripe_account_id text;
alter table driver_profiles add column if not exists payouts_enabled boolean not null default false;

alter table fleet_operator_profiles add column if not exists stripe_customer_id text;

create table if not exists marketplace_payments (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('load_fund', 'driver_payout', 'cashout')),
  shift_id uuid references driver_shifts(id) on delete set null,
  payer_user_id text,
  payee_user_id text,
  amount_cents integer not null check (amount_cents > 0),
  currency text not null default 'usd',
  stripe_session_id text,
  stripe_payment_intent_id text,
  stripe_transfer_id text,
  status text not null default 'pending'
    check (status in ('pending', 'requires_action', 'succeeded', 'failed', 'cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_marketplace_payments_payee on marketplace_payments(payee_user_id, created_at desc);
create index if not exists idx_marketplace_payments_shift on marketplace_payments(shift_id) where shift_id is not null;
create unique index if not exists idx_marketplace_payments_session
  on marketplace_payments(stripe_session_id) where stripe_session_id is not null;

alter table driver_shifts add column if not exists funded boolean not null default false;
alter table driver_shifts add column if not exists funded_at timestamptz;
