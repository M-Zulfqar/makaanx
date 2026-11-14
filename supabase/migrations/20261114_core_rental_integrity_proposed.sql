-- PROPOSED ONLY / NOT APPLIED. Requires explicit database-owner approval.
-- Read docs/CORE_RENTAL_WORKFLOWS.md before use. No policy/grant/record changes.
-- Preconditions: inspect preflight_core_rental_readonly.sql with a trusted owner;
-- all key columns must already be NOT NULL and FK-linked to the intended tables;
-- equivalent valid/ready full unique keys are reused; no conflicting names or duplicates.
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
DO $$
DECLARE t text; cols text[]; index_name text;
BEGIN
 FOREACH t IN ARRAY ARRAY['applications','favorites'] LOOP
  cols:=CASE WHEN t='applications' THEN ARRAY['property_id','tenant_id'] ELSE ARRAY['property_id','user_id'] END;
  index_name:=CASE WHEN t='applications' THEN 'makaanx_rental_application_once' ELSE 'makaanx_rental_favorite_once' END;
  IF EXISTS(SELECT 1 FROM pg_index i WHERE i.indrelid=format('public.%I',t)::regclass AND i.indisunique AND i.indisvalid AND i.indisready
   AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnkeyatts=2
   AND ARRAY(SELECT a.attname::text FROM unnest(i.indkey) WITH ORDINALITY k(attnum,ord) JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum WHERE k.ord<=i.indnkeyatts ORDER BY a.attname)=cols)
  THEN CONTINUE; END IF;
  IF to_regclass(format('public.%I',index_name)) IS NOT NULL THEN RAISE EXCEPTION 'Conflicting index name requires review'; END IF;
  EXECUTE format('CREATE UNIQUE INDEX %I ON public.%I (%I,%I)',index_name,t,cols[1],cols[2]);
 END LOOP;
END $$;
COMMIT;
-- No automatic duplicate cleanup. This does not replace RLS or column grants.
-- Rollback ONLY if these indexes were created by this approved change and are not
-- attached to later constraints: DROP INDEX public.makaanx_rental_application_once;
-- DROP INDEX public.makaanx_rental_favorite_once;
-- Rollback removes concurrency protection; coordinate application behavior first.
