-- Move-first profile fields (Day 4)
alter table user_profiles
  add column if not exists nationality text,
  add column if not exists move_preferred_destinations text[] not null default '{}',
  add column if not exists move_work_mode text,
  add column if not exists move_stay_preference text,
  add column if not exists move_notes text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_move_work_mode_check'
  ) then
    alter table user_profiles
      add constraint user_profiles_move_work_mode_check
      check (move_work_mode is null or move_work_mode in ('onsite', 'hybrid', 'remote', 'business_owner', 'student'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'user_profiles_move_stay_preference_check'
  ) then
    alter table user_profiles
      add constraint user_profiles_move_stay_preference_check
      check (move_stay_preference is null or move_stay_preference in ('trip', 'nomad', 'move'));
  end if;
end $$;
