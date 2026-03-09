-- Dashboard and listing helper views for CRM pages.

create or replace view crm_dashboard_metrics as
select
  (select count(*) from prospects where lifecycle in ('new', 'qualified', 'proposal')) as open_prospects,
  (select count(*) from prospects where lifecycle = 'proposal') as proposals_out,
  (select count(*) from clients where lifecycle = 'won') as active_clients,
  (select coalesce(sum(arr_usd), 0) from clients where lifecycle = 'won') as total_arr_usd,
  (select count(*) from tasks where status in ('todo', 'in_progress')) as open_tasks,
  (select count(*) from communication_messages where is_read = false) as unread_messages;

create or replace view crm_recent_activity as
select
  a.id,
  a.title,
  a.description,
  a.activity_type,
  a.happened_at,
  a.prospect_id,
  a.client_id,
  u.full_name as owner_name
from activities a
left join crm_users u on u.id = a.user_id
order by a.happened_at desc;

create or replace view crm_inbox_threads as
select
  t.id,
  t.subject,
  t.channel,
  t.status,
  t.prospect_id,
  t.client_id,
  t.last_message_at,
  coalesce(unread.unread_count, 0) as unread_count
from communication_threads t
left join (
  select thread_id, count(*) as unread_count
  from communication_messages
  where is_read = false
  group by thread_id
) unread on unread.thread_id = t.id
order by t.last_message_at desc nulls last, t.created_at desc;
