-- Object storage keys for Neon S3 buckets (vault + POD evidence).
-- Safe to re-run. Existing base64 file_data remains as a fallback.

alter table driver_compliance_docs add column if not exists storage_bucket text;
alter table driver_compliance_docs add column if not exists storage_key text;

alter table shift_evidence add column if not exists storage_bucket text;
alter table shift_evidence add column if not exists storage_key text;

create index if not exists idx_compliance_docs_storage
  on driver_compliance_docs(storage_bucket, storage_key)
  where storage_key is not null;
