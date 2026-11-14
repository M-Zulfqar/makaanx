-- EXACT PROPOSED ROLLBACK ONLY. Requires separate owner approval; no CASCADE.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';
SET LOCAL search_path = pg_catalog;
LOCK TABLE public.profiles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$
DECLARE f oid; expected record; t oid := 'public.profiles'::regclass; r record; c record;
BEGIN
  IF current_user<>'postgres' OR NOT EXISTS (SELECT 1 FROM pg_class WHERE oid='public.profiles'::regclass AND relkind='r'
    AND relowner='postgres'::regrole AND relrowsecurity AND NOT relforcerowsecurity AND NOT relispartition)
    OR EXISTS (SELECT 1 FROM pg_inherits WHERE inhrelid='public.profiles'::regclass OR inhparent='public.profiles'::regclass)
  THEN RAISE EXCEPTION 'Profiles relation/RLS baseline changed; stop rollback'; END IF;
  IF (SELECT count(*) FROM pg_attribute WHERE attrelid=t AND attname IN ('id','role','verification_status','verification_score','trust_score','cnic_path') AND NOT attisdropped)<>6
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='id'
    AND atttypid='uuid'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_attribute WHERE attrelid=t AND attname='role'
      AND atttypid='text'::regtype AND attnotnull AND NOT attisdropped)
    OR NOT EXISTS (SELECT 1 FROM pg_constraint k JOIN pg_attribute a
      ON a.attrelid=t AND a.attname='id' WHERE k.conrelid=t AND k.contype='p' AND k.conkey=ARRAY[a.attnum])
  THEN RAISE EXCEPTION 'Unexpected id/role schema or primary key'; END IF;
  IF EXISTS (SELECT 1 FROM (VALUES ('full_name','text'::regtype),('verification_status','text'::regtype),('cnic_path','text'::regtype)) column_spec(name,typ)
    LEFT JOIN pg_attribute a ON a.attrelid=t AND a.attname=column_spec.name AND NOT a.attisdropped
    WHERE a.attnum IS NULL OR a.atttypid<>column_spec.typ OR a.attgenerated<>'')
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
  IF (SELECT count(*) FROM pg_proc WHERE proname IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts'))<>3
  THEN RAISE EXCEPTION 'Unexpected missing function or overload'; END IF;
  IF EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname NOT IN ('pg_catalog','information_schema')
      AND p.proname NOT IN ('makaanx_is_admin','makaanx_admin_profiles','makaanx_admin_profile_counts')
      AND (p.prosrc LIKE '%makaanx_is_admin%' OR p.prosrc LIKE '%makaanx_admin_profiles%' OR p.prosrc LIKE '%makaanx_admin_profile_counts%'))
  THEN RAISE EXCEPTION 'External routine text references administrator RPC; stop rollback'; END IF;
  FOR expected IN SELECT * FROM (VALUES
    ('public.makaanx_is_admin()','2daec1c9b777ef0a3fc01f4f49db7207','sql','boolean'),
    ('public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer)','337f2cc0e77e106f875a22743e1dab71','plpgsql','TABLE(id uuid, full_name text, role text, verification_status text, has_document boolean)'),
    ('public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[])','f7e9423c95e58be1e309d547aa11d889','plpgsql','TABLE(total bigint, admins bigint, landlords bigint, tenants bigint, pending bigint, submitted bigint)')) AS x(signature,body_hash,language,result_type) LOOP
    f:=to_regprocedure(expected.signature);
    IF f IS NULL OR NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid=f
      AND p.proowner='postgres'::regrole AND p.prosecdef AND p.provolatile='s' AND p.prokind='f'
      AND NOT p.proleakproof AND p.proparallel='u' AND l.lanname=expected.language
      AND p.proconfig=ARRAY['search_path=""'] AND md5(p.prosrc)=expected.body_hash
      AND pg_get_function_result(p.oid)=expected.result_type
      AND obj_description(p.oid,'pg_proc')='MakaanX least privilege admin access 2026-11-15')
      OR EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
        WHERE p.oid=f AND (a.grantee NOT IN ('postgres'::regrole::oid,'authenticated'::regrole::oid)
          OR (a.grantee='authenticated'::regrole::oid AND a.is_grantable)))
      OR has_function_privilege('anon',f,'EXECUTE') OR NOT has_function_privilege('authenticated',f,'EXECUTE')
    THEN RAISE EXCEPTION 'Administrator function drift; stop rollback'; END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd IN('SELECT','ALL'))<>1
    OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
      AND policyname='profiles_select_own' AND cmd='SELECT' AND permissive='PERMISSIVE'
      AND roles=ARRAY['authenticated']::name[] AND with_check IS NULL
      AND regexp_replace(qual,'\s+','','g') IN ('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)'))
  THEN RAISE EXCEPTION 'Own SELECT policy drift; stop rollback'; END IF;
END $guard$;
DROP FUNCTION public.makaanx_admin_profiles(text,text,text,text,boolean,uuid[],integer,integer) RESTRICT;
DROP FUNCTION public.makaanx_admin_profile_counts(text,text,text,text,boolean,uuid[]) RESTRICT;
DROP FUNCTION public.makaanx_is_admin() RESTRICT;
COMMIT;
-- No table policy/grant/data change. RPCs become absent; revert app revision in a
-- separately approved coordinated release. Do not use CASCADE or replay bundles.
