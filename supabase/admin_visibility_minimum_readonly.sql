-- Minimum additional metadata/aggregate evidence for the known one-of-six issue.
-- READ ONLY; NOT EXECUTED. Select intended project ficudncgevvxsxbjscrk first.
-- Pair with the five-field browser AND server /auth/diagnostics reports from the
-- same failing sign-in/build. Never attach JWTs, cookies, keys or profile identities.
BEGIN TRANSACTION READ ONLY;
SELECT c.relkind, c.relrowsecurity, c.relforcerowsecurity,
       pg_get_userbyid(c.relowner) AS owner
FROM pg_class c WHERE c.oid = 'public.profiles'::regclass;
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  AND cmd IN ('SELECT','ALL') ORDER BY policyname;
SELECT p.oid::regprocedure AS signature, p.prosecdef, p.proconfig,
       pg_get_userbyid(p.proowner) AS owner,
       r.rolsuper, r.rolbypassrls,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_roles r ON r.oid = p.proowner
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'makaanx_is_admin';
-- Trusted-owner aggregate baseline only. A SQL-editor count does not reproduce
-- the browser's authenticated RLS context; no names, IDs or documents are read out.
SELECT role, count(*) AS profile_count FROM public.profiles GROUP BY role ORDER BY role;
COMMIT;
