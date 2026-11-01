-- MakaanX staging dependency inventory (READ ONLY).
-- Run against the ORIGINAL project. No application user rows returned.
select 'constraint' as category, n.nspname||'.'||cl.relname as object_name,
  c.conname as item, pg_get_constraintdef(c.oid) as details
from pg_constraint c join pg_class cl on cl.oid=c.conrelid
join pg_namespace n on n.oid=cl.relnamespace
where n.nspname='public'
union all
select 'index', schemaname||'.'||tablename, indexname, indexdef
from pg_indexes where schemaname='public'
union all
select 'policy', schemaname||'.'||tablename, policyname,
  cmd||' roles='||array_to_string(roles,',')||
  ' using='||coalesce(qual,'')||' check='||coalesce(with_check,'')
from pg_policies where schemaname='public'
union all
select 'trigger', n.nspname||'.'||cl.relname,t.tgname,pg_get_triggerdef(t.oid)
from pg_trigger t join pg_class cl on cl.oid=t.tgrelid
join pg_namespace n on n.oid=cl.relnamespace
where n.nspname in ('public','auth') and not t.tgisinternal
union all
select 'bucket','storage.buckets',id,
  'public='||public::text||', limit='||coalesce(file_size_limit::text,'none')
from storage.buckets
order by category,object_name,item;
