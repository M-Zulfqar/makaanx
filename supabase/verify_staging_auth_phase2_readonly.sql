-- MakaanX staging Phase 2 verification (READ ONLY).
-- Run only after installing 20261101_staging_auth_phase2.sql.
select 'trigger' as category, t.tgname as item,
  pg_get_triggerdef(t.oid) as details
from pg_trigger t where t.tgrelid='auth.users'::regclass
  and t.tgname='on_auth_user_created'
union all
select 'function', p.proname,
  'security_definer=' || p.prosecdef::text ||
  ', owner=' || pg_get_userbyid(p.proowner)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='handle_new_user'
union all
select 'policy', policyname,
  cmd || ', using=' || coalesce(qual,'none') ||
  ', check=' || coalesce(with_check,'none')
from pg_policies where schemaname='public' and tablename='profiles'
union all
select 'grant', 'anon',
  'insert=' || has_table_privilege('anon','public.profiles','INSERT')::text ||
  ', role_update=' || has_column_privilege('anon','public.profiles','role','UPDATE')::text
union all
select 'grant', 'authenticated',
  'insert=' || has_table_privilege('authenticated','public.profiles','INSERT')::text ||
  ', role_update=' || has_column_privilege('authenticated','public.profiles','role','UPDATE')::text ||
  ', status_update=' || has_column_privilege('authenticated','public.profiles','verification_status','UPDATE')::text ||
  ', name_update=' || has_column_privilege('authenticated','public.profiles','full_name','UPDATE')::text
order by category,item;
