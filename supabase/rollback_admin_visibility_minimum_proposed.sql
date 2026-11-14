-- EXACT PROPOSED ROLLBACK ONLY. Requires separate owner approval; no CASCADE.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL search_path = pg_catalog;
LOCK TABLE public.profiles IN SHARE ROW EXCLUSIVE MODE;
DO $guard$
DECLARE f oid := to_regprocedure('public.makaanx_is_admin()');
BEGIN
  IF current_user<>'postgres' OR f IS NULL OR (SELECT count(*) FROM pg_proc WHERE proname='makaanx_is_admin')<>1
    OR NOT EXISTS (SELECT 1 FROM pg_proc p JOIN pg_language l ON l.oid=p.prolang WHERE p.oid=f
      AND p.proowner='postgres'::regrole AND p.prosecdef AND p.provolatile='s' AND p.pronargs=0
      AND p.prorettype='boolean'::regtype AND NOT p.proretset AND l.lanname='sql'
      AND p.proconfig=ARRAY['search_path=""']
      AND p.prosrc=$body$SELECT EXISTS (SELECT 1 FROM public.profiles AS p WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin');$body$
      AND obj_description(p.oid,'pg_proc')='MakaanX minimum admin visibility repair 2026-11-15')
    OR EXISTS (SELECT 1 FROM pg_proc p CROSS JOIN LATERAL aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a
      WHERE p.oid=f AND (a.grantee NOT IN ('postgres'::regrole::oid,'authenticated'::regrole::oid)
        OR (a.grantee='authenticated'::regrole::oid AND a.is_grantable)))
    OR has_function_privilege('anon',f,'EXECUTE') OR NOT has_function_privilege('authenticated',f,'EXECUTE')
  THEN RAISE EXCEPTION 'Helper differs from this repair; stop rollback'; END IF;
  IF (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND cmd IN('SELECT','ALL'))<>2
    OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
      AND policyname='makaanx_admin_read_profiles' AND cmd='SELECT' AND permissive='PERMISSIVE'
      AND roles=ARRAY['authenticated']::name[] AND qual='public.makaanx_is_admin()' AND with_check IS NULL)
    OR NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles'
      AND policyname='profiles_select_own' AND cmd='SELECT' AND permissive='PERMISSIVE'
      AND roles=ARRAY['authenticated']::name[] AND with_check IS NULL
      AND regexp_replace(qual,'\s+','','g') IN ('((SELECTauth.uid()ASuid)=id)','((SELECTauth.uid())=id)'))
  THEN RAISE EXCEPTION 'SELECT policies differ; stop rollback'; END IF;
END $guard$;
DROP POLICY makaanx_admin_read_profiles ON public.profiles;
DROP FUNCTION public.makaanx_is_admin() RESTRICT;
COMMIT;
-- Any additional dependency makes DROP fail and rolls back the policy removal.
-- Existing own-read/write policies, ACLs and records remain; admin returns to own-only.
-- PGRST202 returns while application diagnostics expect the absent helper.
