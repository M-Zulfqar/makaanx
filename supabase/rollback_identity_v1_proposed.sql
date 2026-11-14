-- PROPOSED FAIL-CLOSED ROLLBACK / NOT EXECUTED. Requires explicit approval.
-- Prefer disabling code first. Preserve every reservation, review and object.
-- This is an access off-switch, NOT restoration of insecure historical policies.
BEGIN;
SET LOCAL lock_timeout='5s';
REVOKE ALL ON FUNCTION public.makaanx_begin_identity_v1(text,bigint,text),public.makaanx_finalize_identity_v1(uuid),public.makaanx_identity_upload_allowed_v1(text),public.makaanx_review_identity_v1(jsonb) FROM PUBLIC,anon,authenticated;
DROP POLICY identity_reserved_insert_v1 ON storage.objects;
COMMIT;
-- Do not regrant legacy overloads or recreate broad object policies automatically.
-- Do not clear profile statuses or remove submitted objects. Keep audit/history.
-- Restoring exact reviewed baseline ACL/policies requires separate owner approval
-- and the captured metadata; dependencies and privacy risks must be reassessed.
-- Tables/functions may be removed only under a separate empty-only checked plan.
