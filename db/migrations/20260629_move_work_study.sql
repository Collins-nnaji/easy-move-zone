-- Work & Study: school admissions and visa-sponsoring job listings, per destination.
create table if not exists move_schools (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  institution text not null,
  program text not null,
  level text not null,
  tag text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_schools_destination
  on move_schools (destination_id, sort_order);

create table if not exists move_jobs (
  id text primary key,
  destination_id text not null references move_destinations(id) on delete cascade,
  company text not null,
  role text not null,
  industry text not null,
  tag text not null,
  price text not null,
  sort_order integer not null default 0,
  active boolean not null default true
);

create index if not exists idx_move_jobs_destination
  on move_jobs (destination_id, sort_order);

-- Applications for schools/jobs reuse move_bookings — widen the allowed types.
alter table move_bookings drop constraint if exists move_bookings_booking_type_check;
alter table move_bookings add constraint move_bookings_booking_type_check
  check (booking_type in ('trip', 'stay', 'visa', 'school', 'job'));
