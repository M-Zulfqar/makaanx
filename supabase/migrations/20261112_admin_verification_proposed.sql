-- PROPOSED ONLY: DO NOT RUN without staging review and backup.
-- Administrator read access to profiles and private CNIC objects.
-- This migration intentionally DOES NOT approve/reject identities.
-- Review against current policies and test with tenant, landlord, admin sessions.
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
