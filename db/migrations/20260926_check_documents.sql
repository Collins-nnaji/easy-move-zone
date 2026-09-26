create table if not exists mobility_check_documents (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  auth_user_id text,
  kind text not null default 'other',
  file_name text not null,
  file_mime text,
  storage_bucket text,
  storage_key text,
  extracted_text text,
  excerpt text,
  bytes integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_mobility_check_docs_session
  on mobility_check_documents (session_id, created_at desc);

create table if not exists mobility_check_runs (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  auth_user_id text,
  input jsonb not null,
  result jsonb not null,
  sources jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_mobility_check_runs_session
  on mobility_check_runs (session_id, created_at desc);
