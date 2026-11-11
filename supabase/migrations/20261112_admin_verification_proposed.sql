-- PROPOSED ONLY: DO NOT RUN without staging review and backup.
-- Administrator read access to profiles and private CNIC objects.
-- This migration intentionally DOES NOT approve/reject identities.
-- Reviewed against staging metadata preflight: profiles RLS and storage.objects RLS enabled;\n-- profiles_select_own and profiles_update_own remain; storage has cnic_owner_insert only.\n-- Existing RPC makaanx_submit_cnic(document_path text) is SECURITY DEFINER owned by postgres.\n-- This review is NOT an execution or authorization test.\n-- Apply only after backup and isolated staging role tests.
BEGIN;

CREATE OR REPLACE FUNCTION public.makaanx_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  );
$$;

REVOKE ALL ON FUNCTION public.makaanx_is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.makaanx_is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.makaanx_is_admin() TO authenticated;

-- Existing owner-only SELECT policy remains in place.
DROP POLICY IF EXISTS profiles_select_admin ON public.profiles;
CREATE POLICY profiles_select_admin
ON public.profiles
FOR SELECT
TO authenticated
USING ((SELECT public.makaanx_is_admin()));

-- Read only documents in the private CNIC bucket for admins.
-- No public URLs, write access or deletion rights are granted.
DROP POLICY IF EXISTS cnic_admin_select ON storage.objects;
CREATE POLICY cnic_admin_select
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'cnic-documents'
  AND (SELECT public.makaanx_is_admin())
);

COMMIT;
