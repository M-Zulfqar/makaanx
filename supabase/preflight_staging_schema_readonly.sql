-- MakaanX staging bootstrap inventory, READ ONLY.
-- Run in ORIGINAL project, export CSV; no user data or credentials.
select 'column' as category, c.table_schema || '.' || c.table_name as object_name,
  c.column_name as item,
  c.data_type || ', nullable=' || c.is_nullable ||
    ', default=' || coalesce(c.column_default,'(none)') as details
from information_schema.columns c
where c.table_schema='public'
union all
select 'constraint', n.nspname || '.' || cls.relname, con.conname,
  pg_get_constraintdef(con.oid)
from pg_constraint con
join pg_class cls on cls.oid=con.conrelid
join pg_namespace n on n.oid=cls.relnamespace
where n.nspname='public'
union all
select 'policy', p.schemaname || '.' || p.tablename, p.policyname,
  p.cmd || ' using ' || coalesce(p.qual,'(none)') ||
  ' check ' || coalesce(p.with_check,'(none)')
from pg_policies p where p.schemaname='public'
union all
select 'trigger', n.nspname || '.' || cls.relname, t.tgname,
  pg_get_triggerdef(t.oid)
from pg_trigger t
join pg_class cls on cls.oid=t.tgrelid
join pg_namespace n on n.oid=cls.relnamespace
where n.nspname='public' and not t.tgisinternal
union all
select 'bucket', 'storage.buckets', b.id,
  'public=' || b.public::text || ', size_limit=' ||
  coalesce(b.file_size_limit::text,'(none)')
from storage.buckets b
order by category,object_name,item;
