-- PROPOSED ONLY. Intended project: ficudncgevvxsxbjscrk. NOT run live.
-- 8E replaces the unexecuted broad row-policy proposal. Review ADMIN_ACCESS_FINAL_APPROVAL.md.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';
SET LOCAL search_path = pg_catalog;
LOCK TABLE public.profiles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$
DECLARE t oid := 'public.profiles'::regclass; r record; c record;
BEGIN
  IF current_user <> 'postgres' THEN RAISE EXCEPTION 'Use the reviewed postgres migration owner'; END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE oid=t AND relkind='r'
    AND relowner='postgres'::regrole AND relrowsecurity AND NOT relforcerowsecurity AND NOT relispartition)
    OR EXISTS (SELECT 1 FROM pg_inherits WHERE inhrelid=t OR inhparent=t)
  THEN RAISE EXCEPTION 'Unexpected profiles ownership/relation/RLS baseline'; END IF;
  IF EXISTS (SELECT 1 FROM pg_roles client_role CROSS JOIN pg_roles parent_role
    WHERE client_role.rolname IN ('anon','authenticated')
      AND (parent_role.rolsuper OR parent_role.rolbypassrls OR parent_role.rolcreaterole OR parent_role.rolname='postgres')
      AND pg_has_role(client_role.oid,parent_role.oid,'MEMBER'))
  THEN RAISE EXCEPTION 'Unexpected client role attributes or owner membership'; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema') AND p.proname NOT IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts') AND (p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profiles%' OR p.prosrc LIKE '%makaanx_admin_profile_counts%'))
  THEN RAISE EXCEPTION 'Other routines reference helper; review unintended activation first'; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts'))
  THEN RAISE EXCEPTION 'Unexpected helper or overload in some schema'; END IF;
  IF (SELECT count(*) FROM pg_attribute WHERE attrelid=t AND attname IN ('id','role','verification_status','verification_score','trust_score','cnic_path') AND NOT attisdropped)<>6
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='id'
    AND atttypid='uuid'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='role'
      AND atttypid='text'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_constraint k JOIN pg_attribute a
      ON a.attrelid=t AND a.attname='id' WHERE k.conrelid=t AND k.contype='p' AND k.conkey=ARRAY[a.attnum])
  THEN RAISE EXCEPTION 'Unexpected id/role schema or primary key'; END IF;
  IF EXISTS (SELECT 1 FROM (VALUES ('full_name','text'::regtype),('verification_status','text'::regtype),('cnic_path','text'::regtype)) expected(name,typ)
    LEFT JOIN pg_attribute a ON a.attrelid=t AND a.attname=expected.name AND NOT a.attisdropped
    WHERE a.attnum IS NULL OR a.atttypid<>expected.typ OR a.attgenerated<>'')
  THEN RAISE EXCEPTION 'Unexpected projection column types'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd IN ('SELECT','ALL')) <> 1
    OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
      AND policyname='profiles_select_own' AND cmd='SELECT' AND permissive='PERMISSIVE'
      AND roles=ARRAY['authenticated']::name[] AND with_check IS NULL
      AND regexp_replace(qual,'\s+','','g') IN ('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)'))
    OR EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd<>'SELECT'
      AND (policyname='profiles_update_own' AND cmd='UPDATE' AND permissive='PERMISSIVE'
        AND roles=ARRAY['authenticated']::name[]
        AND regexp_replace(qual,'\s+','','g') IN ('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)')
        AND regexp_replace(with_check,'\s+','','g') IN ('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)')) IS NOT TRUE)
  THEN RAISE EXCEPTION 'Unexpected profiles policies'; END IF;
  IF NOT has_schema_privilege('authenticated','public','USAGE')
    OR NOT has_table_privilege('authenticated',t,'SELECT')
    OR pg_has_role('anon','authenticated','MEMBER')
  THEN RAISE EXCEPTION 'Unexpected authenticated/anonymous membership or read grants'; END IF;
  FOR r IN SELECT x::text AS actor FROM unnest(ARRAY['anon','authenticated']) x LOOP
    IF has_schema_privilege(r.actor,'public','CREATE') OR has_schema_privilege(r.actor,'auth','CREATE')
      OR has_table_privilege(r.actor,t,'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER')
    THEN RAISE EXCEPTION 'Unexpected schema or table write privilege'; END IF;
    FOR c IN SELECT attname FROM pg_attribute WHERE attrelid=t AND attnum>0 AND NOT attisdropped LOOP
      IF has_column_privilege(r.actor,t,c.attname,'INSERT,REFERENCES')
        OR (has_column_privilege(r.actor,t,c.attname,'UPDATE') AND NOT (r.actor='authenticated' AND c.attname IN ('full_name','phone')))
        OR (r.actor='anon' AND has_column_privilege(r.actor,t,c.attname,'SELECT'))
      THEN RAISE EXCEPTION 'Unexpected column privilege'; END IF;
    END LOOP;
  END LOOP;
  IF (SELECT count(*) FROM public.profiles)<>6
    OR (SELECT count(*) FROM public.profiles WHERE role='admin')<>1
    OR (SELECT count(*) FROM public.profiles WHERE role='landlord')<>1
    OR (SELECT count(*) FROM public.profiles WHERE role='tenant')<>4
  THEN RAISE EXCEPTION 'Profile aggregate baseline changed'; END IF;
  PERFORM set_config('makaanx.admin_repair_acl',
    (SELECT md5(coalesce(relacl::text,'')) FROM pg_class WHERE oid=t),true);
  PERFORM set_config('makaanx.admin_repair_columns',
    (SELECT md5(string_agg(attnum::text||':'||coalesce(attacl::text,''),'|' ORDER BY attnum))
      FROM pg_attribute WHERE attrelid=t AND attnum>0 AND NOT attisdropped),true);
  PERFORM set_config('makaanx.admin_repair_writes',
    (SELECT md5(coalesce(string_agg(row_to_json(p)::text,'|' ORDER BY policyname),''))
      FROM pg_policies p WHERE schemaname='public' AND tablename='profiles'),true);
END $guard$;
CREATE FUNCTION public.makaanx_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $body$SELECT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin');$body$;
ALTER FUNCTION public.makaanx_is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.makaanx_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_is_admin() TO authenticated;
COMMENT ON FUNCTION public.makaanx_is_admin() IS 'MakaanX least privilege admin access 2026-11-15';
CREATE FUNCTION public.makaanx_admin_profiles(p_search text DEFAULT '', p_role text DEFAULT '', p_status text DEFAULT '',
 p_submission text DEFAULT 'all', p_eligible boolean DEFAULT false, p_ids uuid[] DEFAULT NULL, p_limit integer DEFAULT 100, p_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, full_name text, role text, verification_status text, has_document boolean) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $body$BEGIN
  IF NOT public.makaanx_is_admin() THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Administrator access required';
  END IF;
  IF p_search IS NULL OR length(p_search)>100 OR p_role IS NULL OR p_role NOT IN ('','admin','tenant','landlord')
    OR p_status IS NULL OR p_status NOT IN ('','pending','verified','rejected')
    OR p_submission IS NULL OR p_submission NOT IN ('all','submitted','incomplete') OR p_eligible IS NULL
    OR (p_ids IS NOT NULL AND (cardinality(p_ids)>100 OR array_ndims(p_ids)<>1 OR array_position(p_ids,NULL) IS NOT NULL))
  THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid directory filters'; END IF;
  IF p_limit IS NULL OR p_limit<1 OR p_limit>100 OR p_offset IS NULL OR p_offset<0 OR p_offset>1000000
  THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid directory page'; END IF;
  RETURN QUERY SELECT p.id,p.full_name,p.role,p.verification_status,(p.cnic_path IS NOT NULL)
  FROM public.profiles AS p
  WHERE (p_search='' OR p.full_name ILIKE '%' || replace(replace(replace(p_search, E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%' ESCAPE E'\\')
    AND (p_role='' OR p.role=p_role)
    AND (p_status='' OR p.verification_status=p_status)
    AND (NOT p_eligible OR p.role IN ('tenant','landlord'))
    AND (p_submission='all' OR (p_submission='submitted' AND p.cnic_path IS NOT NULL) OR (p_submission='incomplete' AND p.cnic_path IS NULL))
    AND (p_ids IS NULL OR p.id=ANY(p_ids))
  ORDER BY p.id ASC LIMIT p_limit OFFSET p_offset;
END$body$;
ALTER FUNCTION public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer) TO authenticated;
COMMENT ON FUNCTION public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer) IS 'MakaanX least privilege admin access 2026-11-15';
CREATE FUNCTION public.makaanx_admin_profile_counts(p_search text DEFAULT '', p_role text DEFAULT '', p_status text DEFAULT '',
 p_submission text DEFAULT 'all', p_eligible boolean DEFAULT false, p_ids uuid[] DEFAULT NULL)
RETURNS TABLE(total bigint, admins bigint, landlords bigint, tenants bigint, pending bigint, submitted bigint) LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = ''
AS $body$BEGIN
  IF NOT public.makaanx_is_admin() THEN
    RAISE EXCEPTION USING ERRCODE='42501', MESSAGE='Administrator access required';
  END IF;
  IF p_search IS NULL OR length(p_search)>100 OR p_role IS NULL OR p_role NOT IN ('','admin','tenant','landlord')
    OR p_status IS NULL OR p_status NOT IN ('','pending','verified','rejected')
    OR p_submission IS NULL OR p_submission NOT IN ('all','submitted','incomplete') OR p_eligible IS NULL
    OR (p_ids IS NOT NULL AND (cardinality(p_ids)>100 OR array_ndims(p_ids)<>1 OR array_position(p_ids,NULL) IS NOT NULL))
  THEN RAISE EXCEPTION USING ERRCODE='22023', MESSAGE='Invalid directory filters'; END IF;
  RETURN QUERY SELECT count(*),count(*) FILTER (WHERE p.role='admin'),
    count(*) FILTER (WHERE p.role='landlord'),count(*) FILTER (WHERE p.role='tenant'),
    count(*) FILTER (WHERE p.role IN ('tenant','landlord') AND p.verification_status='pending'),
    count(*) FILTER (WHERE p.role IN ('tenant','landlord') AND p.verification_status='pending' AND p.cnic_path IS NOT NULL)
  FROM public.profiles AS p
  WHERE (p_search='' OR p.full_name ILIKE '%' || replace(replace(replace(p_search, E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%' ESCAPE E'\\')
    AND (p_role='' OR p.role=p_role)
    AND (p_status='' OR p.verification_status=p_status)
    AND (NOT p_eligible OR p.role IN ('tenant','landlord'))
    AND (p_submission='all' OR (p_submission='submitted' AND p.cnic_path IS NOT NULL) OR (p_submission='incomplete' AND p.cnic_path IS NULL))
    AND (p_ids IS NULL OR p.id=ANY(p_ids));
END$body$;
ALTER FUNCTION public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[]) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[]) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[]) TO authenticated;
COMMENT ON FUNCTION public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[]) IS 'MakaanX least privilege admin access 2026-11-15';
DO $verify$
DECLARE t oid := 'public.profiles'::regclass; f oid := 'public.makaanx_is_admin()'::regprocedure;
BEGIN
  IF (SELECT count(*) FROM pg_proc WHERE proname IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts'))<>3
  THEN RAISE EXCEPTION 'Unexpected administrator overload'; END IF;
  FOR f IN SELECT p.oid FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts') LOOP
    IF EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE p.oid=f AND (a.grantee NOT IN ('postgres'::regrole::oid,'authenticated'::regrole::oid)
        OR (a.grantee='authenticated'::regrole::oid AND a.is_grantable)))
      OR has_function_privilege('anon',f,'EXECUTE') OR NOT has_function_privilege('authenticated',f,'EXECUTE')
    THEN RAISE EXCEPTION 'Unexpected function defaults/inherited EXECUTE grants'; END IF;
  END LOOP;
  IF current_setting('makaanx.admin_repair_acl') IS DISTINCT FROM
      (SELECT md5(coalesce(relacl::text,'')) FROM pg_class WHERE oid=t)
    OR current_setting('makaanx.admin_repair_columns') IS DISTINCT FROM
      (SELECT md5(string_agg(attnum::text||':'||coalesce(attacl::text,''),'|' ORDER BY attnum)) FROM pg_attribute WHERE attrelid=t AND attnum>0 AND NOT attisdropped)
    OR current_setting('makaanx.admin_repair_writes') IS DISTINCT FROM
      (SELECT md5(coalesce(string_agg(row_to_json(p)::text,'|' ORDER BY policyname),'')) FROM pg_policies p WHERE schemaname='public' AND tablename='profiles')
  THEN RAISE EXCEPTION 'Profile ACL or write policy changed'; END IF;
END $verify$;
COMMIT;
-- No profile policy, row, table/column grant or Storage change.
