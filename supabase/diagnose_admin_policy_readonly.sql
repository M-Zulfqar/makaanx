-- READ ONLY. Run in the SQL editor of the intended staging project:
-- ficudncgevvxsxbjscrk. This inspects definitions, not app-session behavior.
-- No user identities, JWTs, profile values or CNIC references are selected.
BEGIN TRANSACTION READ ONLY;

SELECT n.nspname AS schema_name, c.relname AS table_name, c.relkind AS relation_kind,
       c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS rls_forced,
       pg_get_userbyid(c.relowner) AS table_owner
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'profiles';

-- Permissive policies OR together; restrictive policies AND with that result.
-- Check exact TO roles, command and expression, not just the policy name.
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- Overloads, search_path and FORCE RLS can change the helper's behavior.
SELECT p.oid::regprocedure AS signature, p.prokind, p.prosecdef AS security_definer,
       pg_get_userbyid(p.proowner) AS owner, r.rolsuper, r.rolbypassrls,
       p.provolatile, p.proconfig AS function_settings,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute,
       pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_roles r ON r.oid = p.proowner
WHERE n.nspname = 'public' AND p.proname = 'makaanx_is_admin'
ORDER BY p.oid::regprocedure::text;

SELECT role_name,
       has_schema_privilege(role_name, 'public', 'USAGE') AS schema_usage,
       has_table_privilege(role_name, 'public.profiles', 'SELECT') AS table_select,
       has_column_privilege(role_name, 'public.profiles', 'role', 'UPDATE') AS role_update,
       has_column_privilege(role_name, 'public.profiles', 'verification_status', 'UPDATE') AS verification_update,
       has_column_privilege(role_name, 'public.profiles', 'cnic_path', 'UPDATE') AS document_path_update
FROM (VALUES ('authenticated'), ('anon')) AS roles(role_name);

SELECT member_role.rolname AS member_role, inherited_role.rolname AS inherited_role
FROM pg_auth_members m JOIN pg_roles member_role ON member_role.oid = m.member
JOIN pg_roles inherited_role ON inherited_role.oid = m.roleid
WHERE member_role.rolname IN ('authenticated', 'anon');

COMMIT;
-- Do not apply another admin migration based solely on these definitions.
-- Compare actual browser/server diagnostics under the failing session first.
