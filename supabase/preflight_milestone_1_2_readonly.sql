-- MakaanX read-only preflight. Run in Supabase SQL Editor and export results.
-- 1. Profile columns, types, nullability and defaults
select 'profile_columns' as section, column_name as item, data_type as detail,
       is_nullable as extra
from information_schema.columns
where table_schema='public' and table_name='profiles'
union all
-- 2. Profile table grants (includes grants to PUBLIC)
select 'profile_table_grants', grantee || ':' || privilege_type,
       table_schema || '.' || table_name, ''
from information_schema.role_table_grants
where table_schema='public' and table_name='profiles'
union all
-- 3. Profile column-level grants
select 'profile_column_grants', grantee || ':' || privilege_type,
       column_name, ''
from information_schema.column_privileges
where table_schema='public' and table_name='profiles'
union all
-- 4. Auth user triggers (detect duplicate profile provisioning)
select 'auth_triggers', trigger_name, action_statement, ''
from information_schema.triggers
where event_object_schema='auth' and event_object_table='users'
union all
-- 5. RLS status
select 'rls_status', n.nspname || '.' || c.relname,
       case when c.relrowsecurity then 'enabled' else 'DISABLED' end,
       case when c.relforcerowsecurity then 'forced' else 'not forced' end
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname='profiles'
order by section, item;
