-- Phase 3: vault file storage + verified badges

alter table driver_compliance_docs add column if not exists file_name text;
alter table driver_compliance_docs add column if not exists file_mime text;
alter table driver_compliance_docs add column if not exists file_data text;

alter table driver_profiles add column if not exists verified boolean not null default false;
alter table fleet_operator_profiles add column if not exists verified boolean not null default false;

-- Demo drivers already seeded get a verified badge for marketplace trust
update driver_profiles
set verified = true, updated_at = now()
where auth_user_id like 'driver-demo-%';

update fleet_operator_profiles
set verified = true, updated_at = now()
where auth_user_id like 'fleet-demo-%';
