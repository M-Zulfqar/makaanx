-- READ ONLY: run in the makaanx-staging project SQL Editor.
-- Returns policy definitions and privilege metadata, not user records or CNIC bytes.
-- Do NOT run in a different Supabase project by mistake.
SELECT 'table_rls' AS category,
       n.nspname || '.' || c.relname AS object_name,
       'enabled=' || c.relrowsecurity::text ||
       ', forced=' || c.relforcerowsecurity::text AS details
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE (n.nspname = 'public' AND c.relname = 'profiles')
   OR (n.nspname = 'storage' AND c.relname = 'objects')
UNION ALL
SELECT 'policy', schemaname || '.' || tablename || '.' || policyname,
       'command=' || cmd || ', roles=' || array_to_string(roles, ',') ||
       ', using=' || coalesce(qual, '(none)') ||
       ', check=' || coalesce(with_check, '(none)')
FROM pg_policies
WHERE (schemaname = 'public' AND tablename = 'profiles')
   OR (schemaname = 'storage' AND tablename = 'objects')
UNION ALL
SELECT 'function', n.nspname || '.' || p.proname ||
       '(' || pg_get_function_identity_arguments(p.oid) || ')',
       'security_definer=' || p.prosecdef::text ||
       ', owner=' || pg_get_userbyid(p.proowner)
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('makaanx_is_admin','makaanx_submit_cnic')
UNION ALL
SELECT 'privilege', 'authenticated on public.profiles',
       'select=' || has_table_privilege('authenticated', 'public.profiles', 'SELECT')::text ||
       ', update_role=' || has_column_privilege('authenticated','public.profiles','role','UPDATE')::text ||
       ', update_verification_status=' || has_column_privilege('authenticated','public.profiles','verification_status','UPDATE')::text
ORDER BY category, object_name;
