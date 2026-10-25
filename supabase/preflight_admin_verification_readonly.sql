-- READ ONLY. Inspect administrator verification prerequisites.
-- No CNIC documents, names, emails, or phone numbers are returned.
select 'profile_column' as category, column_name as name,
       data_type || ', nullable=' || is_nullable as details
from information_schema.columns
where table_schema='public' and table_name='profiles'
  and column_name in ('id','role','verification_status','verification_score',
    'cnic_path','trust_score','full_name')
union all
select 'profile_policy', policyname, cmd || ': ' || coalesce(qual,'')
from pg_policies where schemaname='public' and tablename='profiles'
union all
select 'storage_policy', policyname, cmd || ': ' || coalesce(qual,'')
from pg_policies where schemaname='storage' and tablename='objects'
union all
select 'profile_constraint', c.conname, pg_get_constraintdef(c.oid)
from pg_constraint c
where c.conrelid='public.profiles'::regclass
order by category,name;
