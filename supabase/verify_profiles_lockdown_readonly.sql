-- READ ONLY verification after staging profile privilege lockdown.
-- Outputs effective table/column grants, not private user records.
select 'anon' as db_role,
  has_table_privilege('anon','public.profiles','INSERT') as table_insert,
  has_table_privilege('anon','public.profiles','UPDATE') as table_update,
  has_column_privilege('anon','public.profiles','role','UPDATE') as role_update,
  has_column_privilege('anon','public.profiles','verification_status','UPDATE') as status_update,
  has_column_privilege('anon','public.profiles','trust_score','UPDATE') as trust_update,
  has_column_privilege('anon','public.profiles','full_name','UPDATE') as name_update
union all
select 'authenticated',
  has_table_privilege('authenticated','public.profiles','INSERT'),
  has_table_privilege('authenticated','public.profiles','UPDATE'),
  has_column_privilege('authenticated','public.profiles','role','UPDATE'),
  has_column_privilege('authenticated','public.profiles','verification_status','UPDATE'),
  has_column_privilege('authenticated','public.profiles','trust_score','UPDATE'),
  has_column_privilege('authenticated','public.profiles','full_name','UPDATE');
