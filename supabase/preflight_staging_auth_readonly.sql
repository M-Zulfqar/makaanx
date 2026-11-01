-- MakaanX staging Phase 2 prerequisite check (READ ONLY).
-- Run only in makaanx-staging. No user data returned.
select 'profile_column' as category, column_name as item,
       data_type || ', nullable=' || is_nullable ||
       ', default=' || coalesce(column_default,'none') as details
from information_schema.columns
where table_schema='public' and table_name='profiles'
union all
select 'profile_constraint', conname, pg_get_constraintdef(oid)
from pg_constraint where conrelid='public.profiles'::regclass
union all
select 'profile_policy', policyname,
       cmd || ', roles=' || array_to_string(roles,',') ||
       ', using=' || coalesce(qual,'none') ||
       ', check=' || coalesce(with_check,'none')
from pg_policies where schemaname='public' and tablename='profiles'
union all
select 'signup_trigger', tgname, pg_get_triggerdef(oid)
from pg_trigger where tgrelid='auth.users'::regclass and not tgisinternal
union all
select 'signup_function', p.proname,
       'security_definer=' || p.prosecdef::text ||
       ', owner=' || pg_get_userbyid(p.proowner)
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname='handle_new_user'
order by category,item;
