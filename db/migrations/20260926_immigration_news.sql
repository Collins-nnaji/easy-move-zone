-- Immigration news published from EasyMoveZone admin.

CREATE SCHEMA IF NOT EXISTS career;

CREATE TABLE IF NOT EXISTS career.immigration_news (
  id serial PRIMARY KEY,
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  summary text,
  body text NOT NULL,
  source text,
  source_url text,
  image_url text,
  category text NOT NULL DEFAULT 'Immigration',
  tags text[] NOT NULL DEFAULT '{}',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by text
);

CREATE INDEX IF NOT EXISTS idx_career_immigration_news_published
  ON career.immigration_news (published, published_at DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_career_immigration_news_slug
  ON career.immigration_news (slug);
