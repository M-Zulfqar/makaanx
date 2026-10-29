-- READ ONLY: inspect prerequisites for the bundled profile security patch.
-- No user rows or private documents are returned.
select 'signup_trigger' as category, t.tgname as item,
  pg_get_triggerdef(t.oid) as detail
from pg_trigger t
where t.tgrelid='auth.users'::regclass and not t.tgisinternal
union all
select 'function_security', p.proname,
  'owner=' || pg_get_userbyid(p.proowner) ||
  ', security_definer=' || p.prosecdef::text ||
  ', search_path=' || coalesce(array_to_string(p.proconfig, ','),'default')
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='handle_new_user'
union all
select 'profile_constraint', c.conname, pg_get_constraintdef(c.oid)
from pg_constraint c where c.conrelid='public.profiles'::regclass
union all
select 'profile_update_policy', policyname,
  'using=' || coalesce(qual,'') || '; check=' || coalesce(with_check,'')
from pg_policies where schemaname='public' and tablename='profiles'
  and cmd in ('UPDATE','ALL')
order by category,item;
