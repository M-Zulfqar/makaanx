-- READ ONLY. Post-approval owner metadata/aggregate verification, not an app JWT test.
BEGIN TRANSACTION READ ONLY;
SET LOCAL search_path = pg_catalog;
SELECT c.relkind,c.relrowsecurity,c.relforcerowsecurity,pg_get_userbyid(c.relowner) AS owner
FROM pg_class c WHERE c.oid='public.profiles'::regclass;
SELECT policyname,permissive,roles,cmd,qual,with_check FROM pg_policies
WHERE schemaname='public' AND tablename='profiles' ORDER BY policyname;
SELECT n.nspname,p.proname,p.pronargs,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.provolatile,p.proconfig,
  has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
  has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.proname='makaanx_is_admin';
SELECT role,count(*) AS profiles FROM public.profiles GROUP BY role ORDER BY role;
SELECT r.actor,c.column_name,
  has_column_privilege(r.actor,'public.profiles',c.column_name,'SELECT') AS can_select,
  has_column_privilege(r.actor,'public.profiles',c.column_name,'INSERT') AS can_insert,
  has_column_privilege(r.actor,'public.profiles',c.column_name,'UPDATE') AS can_update
FROM information_schema.columns c CROSS JOIN (VALUES('anon'),('authenticated')) r(actor)
WHERE c.table_schema='public' AND c.table_name='profiles' ORDER BY r.actor,c.ordinal_position;
COMMIT;
-- Actual existing admin session: /auth/diagnostics expected project ficudncgevvxsxbjscrk,
-- API role authenticated, adminRpcResult=true, accessibleProfileCount=6, errorCodes={}.
-- Existing tenant/landlord sessions: helper=false, count=1. Anonymous denied.
-- Never SET/forge JWT claims in the owner SQL editor to claim runtime authorization.
