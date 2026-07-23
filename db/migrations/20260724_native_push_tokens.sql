-- Native push tokens (APNs / FCM) for the iOS + Android apps.
-- Separate from driver_push_subscriptions (which stores web-push endpoints)
-- because native delivery uses opaque device tokens, not VAPID keys.

create table if not exists driver_native_push_tokens (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (token)
);

create index if not exists idx_native_push_user on driver_native_push_tokens(auth_user_id);
