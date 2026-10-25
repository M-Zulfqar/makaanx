-- READ ONLY: inspect conversation and message schema before implementing two-party chat.
select 'columns' as section, table_name, column_name as item,
  data_type || ' / nullable=' || is_nullable as details
from information_schema.columns
where table_schema='public' and table_name in ('conversations','messages')
union all
select 'policies', tablename, policyname, cmd || ': ' || coalesce(qual,'') || ' / ' || coalesce(with_check,'')
from pg_policies
where schemaname='public' and tablename in ('conversations','messages')
union all
select 'constraints', t.relname, c.conname, pg_get_constraintdef(c.oid)
from pg_constraint c join pg_class t on t.oid=c.conrelid
join pg_namespace n on n.oid=t.relnamespace
where n.nspname='public' and t.relname in ('conversations','messages')
order by section, table_name, item;
