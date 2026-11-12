-- MakaanX admin read-access preflight (READ ONLY).
-- Run against the intended Supabase staging project before any admin migration.
-- No identities, document paths, or private data are selected.
-- This is metadata inspection, not a substitute for real-session authorization tests.
SELECT 'project' AS check_group, current_database() AS object_name,
       current_user AS observed_value
UNION ALL
SELECT 'profiles_rls', 'public.profiles',
       'enabled=' || c.relrowsecurity || '; forced=' || c.relforcerowsecurity
FROM pg_class c WHERE c.oid = 'public.profiles'::regclass
UNION ALL
SELECT 'profile_role_update', 'authenticated',
       has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE')::text
UNION ALL
SELECT 'profile_status_update', 'authenticated',
       has_column_privilege('authenticated', 'public.profiles', 'verification_status', 'UPDATE')::text
UNION ALL
SELECT 'profile_cnic_path_update', 'authenticated',
       has_column_privilege('authenticated', 'public.profiles', 'cnic_path', 'UPDATE')::text
UNION ALL
SELECT 'profile_policy', policyname,
       cmd || '; roles=' || array_to_string(roles, ',') || '; using=' || coalesce(qual, '<none>')
FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
UNION ALL
SELECT 'storage_policy', policyname,
       cmd || '; roles=' || array_to_string(roles, ',') || '; using=' || coalesce(qual, '<none>')
FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
UNION ALL
SELECT 'existing_admin_function', p.proname,
       'owner=' || pg_get_userbyid(p.proowner) ||
       '; security_definer=' || p.prosecdef ||
       '; anon_execute=' || has_function_privilege('anon',p.oid,'EXECUTE') ||
       '; authenticated_execute=' || has_function_privilege('authenticated',p.oid,'EXECUTE')
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname='public' AND p.proname IN ('makaanx_is_admin','makaanx_review_identity')
ORDER BY check_group,object_name;
