create extension if not exists pgcrypto;

-- Lightweight per-user rate limiting: one row per rate-limited action, pruned
-- by time window at check time. Keeps abusive posting (and runaway AI spend)
-- in check without an external store.
create table if not exists rate_limit_events (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  action text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_rate_limit_events_lookup
  on rate_limit_events (auth_user_id, action, created_at desc);

-- Community moderation: members can flag a topic or reply for review.
create table if not exists community_reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('topic', 'reply')),
  target_id uuid not null,
  reporter_user_id text not null,
  reason text not null default '',
  resolved boolean not null default false,
  created_at timestamptz not null default now(),
  unique (target_type, target_id, reporter_user_id)
);

create index if not exists idx_community_reports_open
  on community_reports (resolved, created_at desc);
