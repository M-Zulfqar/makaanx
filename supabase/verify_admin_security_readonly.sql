-- READ ONLY: pre-deployment verification. Returns no user PII.
select 'profile_grants' as section,
  grantee || ':' || privilege_type as item,
  coalesce(column_name,'(table-wide)') as detail
from information_schema.column_privileges
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated','PUBLIC')
  and privilege_type in ('UPDATE','INSERT')
union all
select 'profile_table_grants',grantee || ':' || privilege_type,'(table-wide)'
from information_schema.role_table_grants
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated','PUBLIC')
  and privilege_type in ('UPDATE','INSERT')
union all
select 'identity_review_functions',p.proname,
  pg_get_function_identity_arguments(p.oid)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('makaanx_is_admin','makaanx_review_identity')
union all
select 'status_constraint',c.conname,pg_get_constraintdef(c.oid)
from pg_constraint c where c.conrelid='public.profiles'::regclass
order by section,item,detail;
