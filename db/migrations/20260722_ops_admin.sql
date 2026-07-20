-- Phase 4: marketplace ops admin (KYC review queue)

alter table driver_compliance_docs drop constraint if exists driver_compliance_docs_status_check;
alter table driver_compliance_docs add constraint driver_compliance_docs_status_check
  check (status in ('verified', 'pending', 'expiring', 'missing', 'rejected'));

alter table driver_compliance_docs add column if not exists reviewed_at timestamptz;
alter table driver_compliance_docs add column if not exists reviewed_by text;
alter table driver_compliance_docs add column if not exists reviewer_notes text;

create index if not exists idx_driver_compliance_pending
  on driver_compliance_docs(status, updated_at desc)
  where status = 'pending';
