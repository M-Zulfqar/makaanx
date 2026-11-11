-- MakaanX: administrator profile read access, STAGING PROPOSAL ONLY.
-- NOT APPLIED. Review with a database owner and test on staging before running.
-- Prerequisites: authenticated users cannot update profiles.role (including
-- column-level grants); admin role assigned only by trusted administrator.
-- This intentionally grants no UPDATE, INSERT, DELETE or CNIC storage access.
--
-- SECURITY DEFINER function must be owned by a trusted role that can read
-- public.profiles without being restricted by its RLS policy. Confirm owner
-- and RLS FORCE settings before use. Never expose a service-role key in client.
BEGIN;

CREATE OR REPLACE FUNCTION public.makaanx_is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.makaanx_is_admin() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_is_admin() TO authenticated;

DROP POLICY IF EXISTS makaanx_admin_read_profiles ON public.profiles;
CREATE POLICY makaanx_admin_read_profiles
ON public.profiles FOR SELECT TO authenticated
USING (public.makaanx_is_admin());

COMMIT;

-- POST-DEPLOY TESTS (separate admin/tenant/landlord browser sessions):
-- admin sees all staging profiles, tenants and landlords see only themselves;
-- anonymous sees no profiles; no client can update role, trust_score,
-- verification_status or cnic_path; no CNIC storage access is introduced.
-- Do not deploy the older full review migration as part of this step.
