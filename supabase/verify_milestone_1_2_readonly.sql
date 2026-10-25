-- Run AFTER reviewing/applying the migration; READ ONLY.
-- Expected: zero unsafe profile policies; only full_name/phone UPDATE grants.
select 'unsafe_profile_policies' as check_name, count(*)::text as observed
from pg_policies where schemaname='public' and tablename='profiles'
  and cmd in ('INSERT','DELETE')
union all
select 'profile_update_policy_count', count(*)::text
from pg_policies where schemaname='public' and tablename='profiles' and cmd='UPDATE'
union all
select 'public_profile_write_grants', count(*)::text
from information_schema.role_table_grants
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated','PUBLIC')
  and privilege_type in ('INSERT','UPDATE','DELETE','TRUNCATE','TRIGGER','REFERENCES')
union all
select 'unsafe_profile_column_grants', count(*)::text
from information_schema.column_privileges
where table_schema='public' and table_name='profiles'
  and grantee in ('anon','authenticated','PUBLIC')
  and privilege_type in ('INSERT','DELETE','UPDATE','REFERENCES')
  and not (grantee='authenticated' and privilege_type='UPDATE' and column_name in ('full_name','phone'))
union all
select 'auth_profile_trigger_count', count(*)::text
from information_schema.triggers
where event_object_schema='auth' and event_object_table='users'
  and action_timing='AFTER' and event_manipulation='INSERT'
union all
select 'cnic_bucket_public', coalesce((select public::text from storage.buckets where id='cnic-documents'),'MISSING');
