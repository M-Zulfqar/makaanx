-- PROPOSED ONLY / NOT APPLIED. Requires explicit database-owner approval.
-- Read docs/CORE_RENTAL_WORKFLOWS.md before use. No policy/grant/record changes.
-- Preconditions: inspect preflight_core_rental_readonly.sql with a trusted owner;
-- all key columns must already be NOT NULL and FK-linked to the intended tables;
-- no equivalent unique constraints/indexes, conflicting index names or duplicates.
-- A maintenance window is required: ordinary CREATE INDEX may block writes.
BEGIN;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND is_nullable = 'YES'
      AND ((table_name = 'applications' AND column_name IN ('property_id','tenant_id'))
        OR (table_name = 'favorites' AND column_name IN ('property_id','user_id')))
  ) THEN RAISE EXCEPTION 'Required key columns are nullable; review a separate NOT NULL change first.';
  END IF;
  IF EXISTS (SELECT 1 FROM public.applications GROUP BY property_id, tenant_id HAVING count(*) > 1)
    OR EXISTS (SELECT 1 FROM public.favorites GROUP BY user_id, property_id HAVING count(*) > 1)
    OR EXISTS (SELECT 1 FROM public.applications WHERE property_id IS NULL OR tenant_id IS NULL)
    OR EXISTS (SELECT 1 FROM public.favorites WHERE user_id IS NULL OR property_id IS NULL)
  THEN RAISE EXCEPTION 'Integrity preflight failed. No records were changed; review existing data separately.';
  END IF;
END $$;
CREATE UNIQUE INDEX makaanx_rental_application_once ON public.applications (property_id, tenant_id);
CREATE UNIQUE INDEX makaanx_rental_favorite_once ON public.favorites (user_id, property_id);
COMMIT;
-- No automatic duplicate cleanup. This does not replace RLS or column grants.
-- Rollback ONLY if these indexes were created by this approved change and are not
-- attached to later constraints: DROP INDEX public.makaanx_rental_application_once;
-- DROP INDEX public.makaanx_rental_favorite_once;
-- Rollback removes concurrency protection; coordinate application behavior first.
