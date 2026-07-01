alter table relocation_plans
  add column if not exists budget_monthly_living_usd integer not null default 0;
