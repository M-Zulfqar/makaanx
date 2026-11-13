-- READ ONLY, metadata + aggregate diagnostics; no identities or document paths.
-- Run only on the intended project after owner review. Not executed by this PR.
BEGIN TRANSACTION READ ONLY;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('properties','applications','favorites')
ORDER BY table_name, ordinal_position;
SELECT c.relname, c.relkind, c.relrowsecurity, c.relforcerowsecurity,
       con.conname, pg_get_constraintdef(con.oid) AS definition
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
LEFT JOIN pg_constraint con ON con.conrelid = c.oid
WHERE n.nspname = 'public' AND c.relname IN ('properties','applications','favorites');
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('properties','applications','favorites');
SELECT tablename, indexname, indexdef FROM pg_indexes
WHERE schemaname = 'public' AND tablename IN ('properties','applications','favorites');
SELECT table_name, grantee, privilege_type FROM information_schema.role_table_grants
WHERE table_schema = 'public' AND table_name IN ('properties','applications','favorites');
SELECT table_name, column_name, grantee, privilege_type FROM information_schema.column_privileges
WHERE table_schema = 'public' AND table_name IN ('properties','applications','favorites');
-- Effective inherited privileges, including PUBLIC grants.
SELECT role_name, table_name,
  has_table_privilege(role_name, 'public.' || table_name, 'SELECT') AS can_select,
  has_table_privilege(role_name, 'public.' || table_name, 'INSERT') AS can_insert,
  has_table_privilege(role_name, 'public.' || table_name, 'UPDATE') AS can_update_table,
  has_table_privilege(role_name, 'public.' || table_name, 'DELETE') AS can_delete
FROM (VALUES ('anon'), ('authenticated')) r(role_name)
CROSS JOIN (VALUES ('properties'), ('applications'), ('favorites')) t(table_name);
SELECT role_name, c.table_name, c.column_name,
  has_column_privilege(role_name, 'public.' || c.table_name, c.column_name, 'INSERT') AS can_insert_column,
  has_column_privilege(role_name, 'public.' || c.table_name, c.column_name, 'UPDATE') AS can_update_column
FROM information_schema.columns c CROSS JOIN (VALUES ('anon'), ('authenticated')) r(role_name)
WHERE c.table_schema = 'public' AND c.table_name IN ('properties','applications','favorites');
-- Run these aggregate checks with a trusted metadata owner. A restricted API role
-- can hide duplicates and is not sufficient to validate uniqueness preconditions.
SELECT 'application_duplicate_groups' AS check_name, count(*) AS total
FROM (SELECT 1 FROM public.applications GROUP BY property_id, tenant_id HAVING count(*) > 1) duplicates
UNION ALL
SELECT 'favorite_duplicate_groups', count(*)
FROM (SELECT 1 FROM public.favorites GROUP BY user_id, property_id HAVING count(*) > 1) duplicates;
SELECT 'applications_null_keys' AS check_name, count(*) AS total FROM public.applications WHERE property_id IS NULL OR tenant_id IS NULL
UNION ALL
SELECT 'favorites_null_keys', count(*) FROM public.favorites WHERE property_id IS NULL OR user_id IS NULL;
COMMIT;
