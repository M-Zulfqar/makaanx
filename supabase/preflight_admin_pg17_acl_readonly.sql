-- Supplemental 8F metadata only; NOT executed live. Intended project selected
-- privately: ficudncgevvxsxbjscrk. Run alongside the current full 8E/8F preflight.
-- No function invocation, user identities, row values, bodies or trigger arguments.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path=pg_catalog;
SET LOCAL statement_timeout='15s';
SELECT current_user AS inspecting_role,current_setting('server_version') AS version,
 current_setting('server_version_num')::integer/10000=17 AS is_pg17;
-- Built-in defaults do not name service_role. Global ACL replaces this baseline;
-- schema ACL adds grants to it. Only defaults FOR THE CREATOR postgres apply here.
WITH sources AS (
 SELECT 'builtin_reference'::text AS source,0::oid AS namespace,x.*
 FROM aclexplode(acldefault('f','postgres'::regrole)) x
 UNION ALL
 SELECT CASE WHEN d.defaclnamespace=0 THEN 'global_override' ELSE 'schema_addition' END,d.defaclnamespace,x.*
 FROM pg_default_acl d CROSS JOIN LATERAL aclexplode(d.defaclacl) x
 WHERE d.defaclrole='postgres'::regrole AND d.defaclobjtype='f'
 AND d.defaclnamespace IN(0,'public'::regnamespace::oid)
) SELECT source,CASE WHEN namespace=0 THEN NULL ELSE namespace::regnamespace::text END AS schema_name,
 CASE WHEN grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(grantee) END AS grantee,
 pg_get_userbyid(grantor) AS grantor,privilege_type,is_grantable
FROM sources ORDER BY source,grantee;
-- Actual object ACLs are separate from defaults: new RPCs should be absent before
-- repair; after repair only postgres/authenticated remain, never service_role.
SELECT n.nspname,p.oid::regprocedure AS signature,pg_get_userbyid(p.proowner) AS owner,
 CASE WHEN a.grantee=0 THEN 'PUBLIC' ELSE pg_get_userbyid(a.grantee) END AS grantee,
 pg_get_userbyid(a.grantor) AS grantor,a.privilege_type,a.is_grantable,
 md5(p.prosrc) AS body_hash,p.prosecdef,
 ARRAY(SELECT setting FROM unnest(p.proconfig) setting WHERE setting LIKE 'search_path=%' OR setting LIKE 'row_security=%') AS relevant_settings
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
WHERE (n.nspname='public' AND p.proname IN('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts','makaanx_submit_cnic','handle_new_user'))
 OR (n.nspname='auth' AND p.proname='uid') ORDER BY n.nspname,p.oid::regprocedure::text,grantee;
SELECT actor.rolname,actor.rolsuper,actor.rolbypassrls,actor.rolcreaterole,
 parent.rolname AS reachable_role,pg_has_role(actor.oid,parent.oid,'USAGE') AS inherited_now,
 pg_has_role(actor.oid,parent.oid,'SET') AS can_set_role,
 has_schema_privilege(actor.oid,'public','CREATE') AS public_create,
 has_schema_privilege(actor.oid,'auth','CREATE') AS auth_create
FROM pg_roles actor JOIN pg_roles parent ON pg_has_role(actor.oid,parent.oid,'MEMBER')
WHERE actor.rolname IN('anon','authenticated','service_role') ORDER BY actor.rolname,parent.rolname;
-- MAINTAIN was added in PG17; CASE retains syntax/runtime compatibility with PG16.
SELECT r.rolname,CASE WHEN current_setting('server_version_num')::integer>=170000
 THEN has_table_privilege(r.oid,'public.profiles','MAINTAIN') ELSE false END AS can_maintain_profiles
FROM pg_roles r WHERE r.rolname IN('anon','authenticated');
-- Only metadata and hashes: owner privately reviews unclear definitions separately.
SELECT e.evtname,e.evtevent,e.evtenabled,e.evtfoid::regprocedure AS routine,
 pg_get_userbyid(p.proowner) AS owner,p.prosecdef,md5(p.prosrc) AS body_hash
FROM pg_event_trigger e JOIN pg_proc p ON p.oid=e.evtfoid ORDER BY e.evtname;
SELECT n.nspname,p.oid::regprocedure AS routine,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,
 md5(p.prosrc) AS body_hash,p.prosrc ~* '\mEXECUTE\M' AS possible_dynamic_sql,
 p.prosrc ILIKE '%profiles%' AS mentions_profiles,
 p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profiles%' OR p.prosrc LIKE '%makaanx_admin_profile_counts%' AS mentions_admin_interface
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE n.nspname NOT IN('pg_catalog','information_schema') AND (p.prosrc ILIKE '%profiles%'
 OR p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profile%')
ORDER BY n.nspname,p.oid::regprocedure::text;
COMMIT;
-- Metadata cannot prove absence of constructed SQL or external consumers.
