-- PROPOSED ONLY. Intended project: ficudncgevvxsxbjscrk. NOT run live.
-- Additional fail-closed prerequisites are documented in ADMIN_ACCESS_REPAIR.md.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
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
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname='makaanx_is_admin')
  THEN RAISE EXCEPTION 'Unexpected helper or overload in some schema'; END IF;
  IF (SELECT count(*) FROM pg_attribute WHERE attrelid=t AND attname IN ('id','role','verification_status','verification_score','trust_score','cnic_path') AND NOT attisdropped)<>6
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='id'
    AND atttypid='uuid'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='role'
      AND atttypid='text'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_constraint k JOIN pg_attribute a
      ON a.attrelid=t AND a.attname='id' WHERE k.conrelid=t AND k.contype='p' AND k.conkey=ARRAY[a.attnum])
  THEN RAISE EXCEPTION 'Unexpected id/role schema or primary key'; END IF;
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
      FROM pg_policies p WHERE schemaname='public' AND tablename='profiles' AND cmd<>'SELECT'),true);
END $guard$;
CREATE FUNCTION public.makaanx_is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = ''
AS $body$SELECT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin');$body$;
ALTER FUNCTION public.makaanx_is_admin() OWNER TO postgres;
REVOKE ALL ON FUNCTION public.makaanx_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_is_admin() TO authenticated;
COMMENT ON FUNCTION public.makaanx_is_admin() IS 'MakaanX minimum admin visibility repair 2026-11-15';
CREATE POLICY makaanx_admin_read_profiles ON public.profiles
FOR SELECT TO authenticated USING (public.makaanx_is_admin());
DO $verify$
DECLARE t oid := 'public.profiles'::regclass; f oid := 'public.makaanx_is_admin()'::regprocedure;
BEGIN
  IF (SELECT count(*) FROM pg_proc WHERE proname='makaanx_is_admin')<>1
    OR EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE p.oid=f AND (a.grantee NOT IN ('postgres'::regrole::oid,'authenticated'::regrole::oid)
        OR (a.grantee='authenticated'::regrole::oid AND a.is_grantable)))
    OR has_function_privilege('anon',f,'EXECUTE') OR NOT has_function_privilege('authenticated',f,'EXECUTE')
  THEN RAISE EXCEPTION 'Unexpected helper defaults/inherited EXECUTE grants'; END IF;
  IF current_setting('makaanx.admin_repair_acl') IS DISTINCT FROM
      (SELECT md5(coalesce(relacl::text,'')) FROM pg_class WHERE oid=t)
    OR current_setting('makaanx.admin_repair_columns') IS DISTINCT FROM
      (SELECT md5(string_agg(attnum::text||':'||coalesce(attacl::text,''),'|' ORDER BY attnum)) FROM pg_attribute WHERE attrelid=t AND attnum>0 AND NOT attisdropped)
    OR current_setting('makaanx.admin_repair_writes') IS DISTINCT FROM
      (SELECT md5(coalesce(string_agg(row_to_json(p)::text,'|' ORDER BY policyname),'')) FROM pg_policies p WHERE schemaname='public' AND tablename='profiles' AND cmd<>'SELECT')
  THEN RAISE EXCEPTION 'Profile ACL or write policy changed'; END IF;
END $verify$;
COMMIT;
-- No account/row, profile INSERT/UPDATE/DELETE grant, existing policy or Storage change.
