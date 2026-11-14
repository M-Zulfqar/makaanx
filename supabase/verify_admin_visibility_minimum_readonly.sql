-- READ ONLY post-approval metadata verification; NOT executed on staging.
-- Metadata/hashes/shape flags and aggregate counts only; no function bodies,
-- policy literals, trigger arguments, user identities or private document data.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path = pg_catalog;
SET LOCAL statement_timeout = '15s';
SELECT current_database() AS database_name,current_user AS inspecting_role,
 current_setting('server_version') AS postgres_version,current_user='postgres' AS migration_owner_matches;
SELECT nspname,pg_get_userbyid(nspowner) AS schema_owner FROM pg_namespace WHERE nspname IN('public','auth') ORDER BY nspname;
SELECT c.relkind,pg_get_userbyid(c.relowner) AS owner,c.relrowsecurity,c.relforcerowsecurity,c.relispartition,
 EXISTS(SELECT 1 FROM pg_inherits i WHERE i.inhrelid=c.oid OR i.inhparent=c.oid) AS has_inheritance
FROM pg_class c WHERE c.oid='public.profiles'::regclass;
SELECT a.attnum,a.attname AS column_name,format_type(a.atttypid,a.atttypmod) AS column_type,a.attnotnull,
 a.attgenerated,has_column_privilege('authenticated',a.attrelid,a.attnum,'SELECT') AS own_profile_select_granted,
 a.attname IN('id','full_name','role','verification_status') AS admin_ui_returns_column
FROM pg_attribute a WHERE a.attrelid='public.profiles'::regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum;
SELECT conname,pg_get_constraintdef(oid) AS primary_key FROM pg_constraint
WHERE conrelid='public.profiles'::regclass AND contype='p';
SELECT policyname,permissive,roles,cmd,md5(coalesce(qual,'')) AS using_hash,md5(coalesce(with_check,'')) AS check_hash,
 (((policyname='profiles_select_own' AND cmd='SELECT' AND with_check IS NULL
   AND regexp_replace(qual,'\s+','','g') IN('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)'))
  OR (policyname='profiles_update_own' AND cmd='UPDATE'
   AND regexp_replace(qual,'\s+','','g') IN('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)')
   AND regexp_replace(with_check,'\s+','','g') IN('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)')))
  AND permissive='PERMISSIVE' AND roles=ARRAY['authenticated']::name[]) IS TRUE AS expected_policy_shape
FROM pg_policies WHERE schemaname='public' AND tablename='profiles' ORDER BY policyname;
SELECT r.rolname,r.rolsuper,r.rolbypassrls,r.rolcreaterole,r.rolinherit,
 has_schema_privilege(r.oid,'public','USAGE') AS public_usage,has_schema_privilege(r.oid,'public','CREATE') AS public_create,
 has_schema_privilege(r.oid,'auth','CREATE') AS auth_create,has_schema_privilege(r.oid,'auth','USAGE') AS auth_usage,
 has_table_privilege(r.oid,'public.profiles','SELECT') AS profile_select,
 has_table_privilege(r.oid,'public.profiles',CASE WHEN current_setting('server_version_num')::integer>=170000 THEN 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN' ELSE 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER' END) AS dangerous_table_grant
FROM pg_roles r WHERE r.rolname IN('anon','authenticated') ORDER BY r.rolname;
SELECT r.rolname AS actor,a.attname AS column_name,
 has_column_privilege(r.oid,a.attrelid,a.attnum,'SELECT') AS can_select,
 has_column_privilege(r.oid,a.attrelid,a.attnum,'INSERT') AS can_insert,
 has_column_privilege(r.oid,a.attrelid,a.attnum,'UPDATE') AS can_update,
 has_column_privilege(r.oid,a.attrelid,a.attnum,'REFERENCES') AS can_reference
FROM pg_roles r CROSS JOIN pg_attribute a WHERE r.rolname IN('anon','authenticated')
 AND a.attrelid='public.profiles'::regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY r.rolname,a.attnum;
SELECT c.rolname AS client_role,p.rolname AS reachable_role,p.rolsuper,p.rolbypassrls,p.rolcreaterole,
 pg_has_role(c.oid,p.oid,'USAGE') AS privileges_currently_inherited
FROM pg_roles c CROSS JOIN pg_roles p WHERE c.rolname IN('anon','authenticated')
 AND pg_has_role(c.oid,p.oid,'MEMBER') ORDER BY c.rolname,p.rolname;
SELECT pg_get_userbyid(m.member) AS member,pg_get_userbyid(m.roleid) AS granted_role,m.admin_option,
 to_jsonb(m)->>'inherit_option' AS inherit_option_pg16,to_jsonb(m)->>'set_option' AS set_option_pg16
FROM pg_auth_members m WHERE m.member IN(SELECT oid FROM pg_roles WHERE rolname IN('anon','authenticated'));
WITH o AS (SELECT oid FROM pg_roles WHERE rolname='postgres'), defaults AS (
 SELECT 'global_or_builtin' AS scope,x.* FROM o CROSS JOIN LATERAL aclexplode(coalesce(
  (SELECT d.defaclacl FROM pg_default_acl d WHERE d.defaclrole=o.oid AND d.defaclnamespace=0 AND d.defaclobjtype='f'),acldefault('f',o.oid))) x
 UNION ALL
 SELECT 'public_addition',x.* FROM o JOIN pg_default_acl d ON d.defaclrole=o.oid
  CROSS JOIN LATERAL aclexplode(d.defaclacl) x WHERE d.defaclnamespace='public'::regnamespace AND d.defaclobjtype='f'
) SELECT scope,CASE WHEN grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(grantee) END AS grantee,privilege_type,is_grantable,
 grantee NOT IN(0,'postgres'::regrole::oid,'anon'::regrole::oid,'authenticated'::regrole::oid) AND pg_get_userbyid(grantee)<>'service_role' AS unknown_default_recipient_would_abort
FROM defaults ORDER BY scope,grantee;
SELECT n.nspname,p.oid::regprocedure AS signature,p.prokind,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.provolatile,
 ARRAY(SELECT setting FROM unnest(p.proconfig) setting WHERE setting LIKE 'search_path=%' OR setting LIKE 'row_security=%') AS relevant_settings,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
 has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
 md5(p.prosrc) AS source_hash,(p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profiles%' OR p.prosrc LIKE '%makaanx_admin_profile_counts%') AS mentions_admin_interface,
 p.prosrc ILIKE '%profiles%' AS mentions_profiles,p.prosrc ~* '\mEXECUTE\M' AS possible_dynamic_sql
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE p.proname IN('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts')
 OR (n.nspname='auth' AND p.proname='uid')
 OR (n.nspname NOT IN('pg_catalog','information_schema') AND (p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profiles%' OR p.prosrc LIKE '%makaanx_admin_profile_counts%'))
 OR (n.nspname='public' AND p.prosecdef AND (has_function_privilege('authenticated',p.oid,'EXECUTE') OR has_function_privilege('anon',p.oid,'EXECUTE')))
ORDER BY n.nspname,p.oid::regprocedure::text;
SELECT n.nspname,p.oid::regprocedure AS signature,
 CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
 pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
WHERE p.proname IN('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts')
ORDER BY n.nspname,p.oid::regprocedure::text,grantee;
SELECT p.oid::regprocedure AS signature,executor.oid IS NOT NULL AS service_role_exists,
 CASE WHEN executor.oid IS NULL THEN false ELSE has_function_privilege(executor.oid,p.oid,'EXECUTE') END AS service_role_effective_execute,
 CASE WHEN executor.oid IS NULL THEN false ELSE pg_has_role(executor.oid,'authenticated'::regrole,'MEMBER') OR pg_has_role(executor.oid,'postgres'::regrole,'MEMBER') END AS service_role_can_reach_executor
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace LEFT JOIN pg_roles executor ON executor.rolname='service_role'
WHERE n.nspname='public' AND p.proname IN('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts') ORDER BY p.proname;
SELECT c.oid::regclass AS relation,t.tgname,t.tgfoid::regprocedure AS routine,t.tgenabled,t.tgtype,t.tgnargs,
 pg_get_userbyid(f.proowner) AS function_owner,f.prosecdef,md5(f.prosrc) AS function_source_hash
FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_proc f ON f.oid=t.tgfoid WHERE NOT t.tgisinternal
 AND t.tgrelid IN('public.profiles'::regclass,'auth.users'::regclass) ORDER BY c.oid::regclass::text,t.tgname;
SELECT count(*) AS total,count(*) FILTER(WHERE role='admin') AS admins,count(*) FILTER(WHERE role='landlord') AS landlords,
 count(*) FILTER(WHERE role='tenant') AS tenants,count(*) FILTER(WHERE role IS NULL OR role NOT IN('admin','landlord','tenant')) AS unexpected_roles
FROM public.profiles;
SELECT count(*)=1 AND bool_and(policyname='profiles_select_own') AS own_only_select_policies
FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd IN('SELECT','ALL');
SELECT p.oid::regprocedure AS signature,pg_get_function_result(p.oid) AS result_contract
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public'
 AND p.proname IN('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts') ORDER BY p.proname;
COMMIT;
-- Match the exact guards in 20261115_admin_visibility_minimum_proposed.sql.
-- Unknown routine/policy/trigger semantics require private owner review; text
-- scans cannot discover every dynamic reference or role-writing path.
-- No "GO" is inferred from counts or metadata alone; review sensitive columns,
-- alternate writers/dynamic references, backup/lock window and actual Auth sessions.

-- Postflight expected: exactly 3 reviewed interfaces, stored owner postgres,
-- empty search_path, STABLE/SECURITY DEFINER; no PUBLIC/anon/extra EXECUTE grants.
-- Compare source hashes against the exact reviewed rollback body_hash constants.
-- Existing admin: helper=true; count scope admin-projection; total=6. Direct
-- profiles count stays 1. Ordinary users: helper=false, own-rls count=1; RPCs denied.
-- Do not forge JWT claims or infer runtime permissions from an owner session.
