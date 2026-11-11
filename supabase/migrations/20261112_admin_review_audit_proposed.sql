-- DRAFT ONLY: do not execute until staging backup, review, and authorization tests.
-- Depends on 20261112_admin_verification_proposed.sql.
-- Staging check (2026-11-12): only profiles_role_check was found; no\n-- verification_status CHECK constraint. Other triggers/permissions remain untested.
-- This migration does not expose documents or add any UI action.
BEGIN;

CREATE TABLE IF NOT EXISTS public.identity_verification_reviews (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  subject_id uuid NOT NULL REFERENCES public.profiles(id),
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id),
  old_status text NOT NULL,
  new_status text NOT NULL CHECK (new_status IN ('verified', 'rejected')),
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.identity_verification_reviews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.identity_verification_reviews FROM PUBLIC, anon, authenticated;
-- Audit records are intentionally not directly accessible from browser clients.

CREATE OR REPLACE FUNCTION public.makaanx_review_identity(
  target_user uuid,
  decision text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  actor uuid := (SELECT auth.uid());
  current_status text;
  document_ref text;
BEGIN
  IF actor IS NULL OR NOT (SELECT public.makaanx_is_admin()) THEN
    RAISE EXCEPTION 'Administrator authorization required' USING ERRCODE = '42501';
  END IF;
  IF target_user IS NULL OR decision IS NULL OR decision NOT IN ('verified', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review request' USING ERRCODE = '22023';
  END IF;
  IF target_user = actor THEN
    RAISE EXCEPTION 'Self-review is not permitted' USING ERRCODE = '42501';
  END IF;

  SELECT p.verification_status, p.cnic_path
    INTO current_status, document_ref
  FROM public.profiles AS p
  WHERE p.id = target_user AND p.role IN ('tenant', 'landlord')
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Applicant not found' USING ERRCODE = '22023';
  END IF;
  IF current_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending applications can be reviewed' USING ERRCODE = '22023';
  END IF;
  IF document_ref IS NULL OR btrim(document_ref) = '' THEN
    RAISE EXCEPTION 'No submitted document reference' USING ERRCODE = '22023';
  END IF;
  -- A saved path is not proof of document validity. Reviewer must inspect
  -- the actual private object before invoking this function.
  UPDATE public.profiles SET verification_status = decision
  WHERE id = target_user AND verification_status = 'pending';

  INSERT INTO public.identity_verification_reviews
    (subject_id, reviewer_id, old_status, new_status)
  VALUES (target_user, actor, current_status, decision);
END;
$function$;

REVOKE ALL ON FUNCTION public.makaanx_review_identity(uuid, text)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_review_identity(uuid, text)
  TO authenticated;

COMMIT;

-- Mandatory before enabling any UI:
-- 1. CHECK constraint inspection completed; still verify triggers and status semantics.
-- 2. Verify function ownership and existing RPCs; check direct UPDATE grants remain denied.
-- 3. Verify admin has securely inspected the actual private document.
-- 4. Test tenant/landlord/anon denial; admin success; duplicate and self-review rejection.
-- 5. Verify audit insert and status update rollback together on failure.
-- 6. Consider richer audit fields (reason, document hash, retention policy)
--    and compliance/privacy review before accepting real CNIC documents.
