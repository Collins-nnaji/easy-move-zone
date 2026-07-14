create extension if not exists pgcrypto;

-- Community discussion board: topics + replies for people talking through
-- relocation, work, school, visa, and travel questions with each other.
create table if not exists community_topics (
  id uuid primary key default gen_random_uuid(),
  auth_user_id text not null,
  author_name text not null,
  category text not null default 'general' check (category in ('work', 'study', 'visa', 'travel', 'settling', 'general')),
  title text not null,
  body text not null,
  reply_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists community_replies (
  id uuid primary key default gen_random_uuid(),
  topic_id uuid not null references community_topics(id) on delete cascade,
  auth_user_id text not null,
  author_name text not null,
  body text not null,
  is_ai boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_community_topics_category on community_topics(category);
create index if not exists idx_community_topics_created on community_topics(created_at desc);
create index if not exists idx_community_replies_topic on community_replies(topic_id, created_at);
