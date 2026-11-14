-- PROPOSAL ONLY. NOT APPLIED. Never run via blanket `supabase db push`.
-- Replaces the RECOMMENDATION, not deployed objects, in the 20261026/20261112
-- review proposals. Do not concatenate those proposals. See milestone guide.
-- Requires reviewed baseline fingerprint below, backup, explicit approval and
-- isolated SQL/storage acceptance tests. No privileged UI is enabled by this file.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $$
DECLARE expected_baseline text := 'REVIEW_REQUIRED'; actual_baseline text;
BEGIN
  SELECT md5(coalesce(string_agg(row_to_json(p)::text, E'\n' ORDER BY p.policyname),''))
  INTO actual_baseline FROM pg_policies p WHERE p.schemaname = 'storage' AND p.tablename = 'objects';
  IF expected_baseline = 'REVIEW_REQUIRED' OR actual_baseline <> expected_baseline
  THEN RAISE EXCEPTION 'Reviewed storage policy baseline required'; END IF;
  -- Even a reviewed hash must not authorize deleting unknown bucket policies.
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='storage' AND tablename='objects'
    AND policyname NOT IN ('cnic_owner_insert','makaanx_upload_own_cnic','cnic_documents_insert_own','cnic_documents_update_own','makaanx_admin_read_cnic','cnic_admin_select'))
  THEN RAISE EXCEPTION 'Other storage policies require a separate bucket-isolation reconciliation'; END IF;
  IF to_regclass('public.identity_submissions_v1') IS NOT NULL
    OR to_regclass('public.identity_review_events_v1') IS NOT NULL
    OR to_regclass('public.identity_document_views_v1') IS NOT NULL
    OR EXISTS (SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN ('makaanx_begin_identity_v1','makaanx_finalize_identity_v1','makaanx_review_identity_v1','makaanx_identity_upload_allowed_v1'))
  THEN RAISE EXCEPTION 'Existing v1 objects require reconciliation'; END IF;
  IF to_regprocedure('public.makaanx_is_admin()') IS NULL
  THEN RAISE EXCEPTION 'Reviewed existing admin helper required'; END IF;
  IF EXISTS (SELECT 1 FROM unnest(ARRAY['role','verification_status','verification_score','trust_score','cnic_path']) col
    WHERE has_column_privilege('authenticated','public.profiles',col,'UPDATE') OR has_column_privilege('anon','public.profiles',col,'UPDATE')
      OR has_column_privilege('authenticated','public.profiles',col,'INSERT') OR has_column_privilege('anon','public.profiles',col,'INSERT'))
  THEN RAISE EXCEPTION 'Protected profile column grants must be locked down first'; END IF;
  IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id='cnic-documents' AND public=false
    AND file_size_limit BETWEEN 1 AND 10485760 AND allowed_mime_types <@ ARRAY['image/jpeg','image/png']::text[]
    AND cardinality(allowed_mime_types)>0)
  THEN RAISE EXCEPTION 'Private, size/type-limited bucket required'; END IF;
END $$;
-- Prerequisites additionally reviewed outside SQL: trusted owner with bypass RLS,
-- locked schema CREATE privileges, no hostile profile/storage triggers, exact
-- status column text contract, storage owner_id text + metadata size/mimetype,
-- no other executable SECURITY DEFINER function able to mutate protected fields.

CREATE TABLE public.identity_submissions_v1 (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  subject_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  object_name text NOT NULL UNIQUE,
  file_mime text NOT NULL CHECK (file_mime IN ('image/jpeg','image/png')),
  file_bytes bigint NOT NULL CHECK (file_bytes BETWEEN 8 AND 10485760),
  file_sha256 text NOT NULL CHECK (file_sha256 ~ '^[0-9a-f]{64}$'),
  state text NOT NULL DEFAULT 'uploading' CHECK (state IN ('uploading','pending','verified','rejected','expired')),
  version integer NOT NULL DEFAULT 1 CHECK (version>0),
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL DEFAULT now()+interval '24 hours',
  submitted_at timestamptz,
  CHECK (object_name = subject_id::text || '/cnic-' || id::text || CASE WHEN file_mime='image/png' THEN '.png' ELSE '.jpg' END)
);
CREATE UNIQUE INDEX identity_submissions_v1_active_subject ON public.identity_submissions_v1(subject_id) WHERE state IN ('uploading','pending');
CREATE INDEX identity_submissions_v1_queue ON public.identity_submissions_v1(state,submitted_at,id);
CREATE TABLE public.identity_review_events_v1 (
  request_id uuid PRIMARY KEY REFERENCES public.identity_submissions_v1(id) ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  old_status text NOT NULL CHECK (old_status='pending'),
  new_status text NOT NULL CHECK (new_status IN ('verified','rejected')),
  reason text NOT NULL CHECK (char_length(reason)<=1000 AND (new_status<>'rejected' OR char_length(btrim(reason))>=10)),
  notes text NOT NULL CHECK (char_length(notes)<=1000),
  reviewed_at timestamptz NOT NULL DEFAULT now()
);
-- Only a separately approved trusted document broker may record delivery.
-- No browser grant/RPC to forge view evidence is supplied in this proposal.
CREATE TABLE public.identity_document_views_v1 (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.identity_submissions_v1(id) ON DELETE RESTRICT,
  reviewer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  request_version integer NOT NULL CHECK(request_version>0),
  served_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX identity_document_views_v1_review ON public.identity_document_views_v1(request_id,reviewer_id,request_version,served_at DESC);
ALTER TABLE public.identity_document_views_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.identity_document_views_v1 FROM PUBLIC,anon,authenticated;
ALTER TABLE public.identity_submissions_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_review_events_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.identity_submissions_v1,public.identity_review_events_v1 FROM PUBLIC,anon,authenticated;
-- Deliberately no direct table grants/policies: object paths and reviewer notes
-- stay internal. A later status projection must allowlist non-sensitive fields.

-- Explicitly retire BOTH legacy overloads and the old submission write path.
-- Retain definitions/audit history; do not DROP or replace unknown functions.
DO $$
DECLARE f record;
BEGIN
  FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='public' AND p.proname IN ('makaanx_review_identity','makaanx_submit_cnic')
  LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC, anon, authenticated',f.signature);
    IF has_function_privilege('authenticated',f.signature::oid,'EXECUTE') OR has_function_privilege('anon',f.signature::oid,'EXECUTE')
    THEN RAISE EXCEPTION 'Inherited legacy identity EXECUTE requires reconciliation'; END IF;
  END LOOP;
END $$;

CREATE FUNCTION public.makaanx_begin_identity_v1(file_mime text,file_bytes bigint,file_sha256 text) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid := auth.uid(); p public.profiles%ROWTYPE; s public.identity_submissions_v1%ROWTYPE; request uuid := pg_catalog.gen_random_uuid();
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  IF file_mime IS NULL OR file_mime NOT IN ('image/jpeg','image/png') OR file_bytes IS NULL OR file_bytes NOT BETWEEN 8 AND 10485760
    OR file_sha256 IS NULL OR file_sha256 !~ '^[0-9a-f]{64}$'
  THEN RAISE EXCEPTION 'Invalid input' USING ERRCODE='22023'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=actor FOR UPDATE;
  IF NOT FOUND OR p.role NOT IN ('tenant','landlord') OR p.role IS NULL
    OR p.verification_status IS NOT DISTINCT FROM 'verified' OR p.verification_status IS NOT DISTINCT FROM 'rejected'
    OR (p.verification_status IS NOT NULL AND p.verification_status NOT IN ('pending','unverified'))

  THEN RAISE EXCEPTION 'Submission unavailable' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM public.identity_submissions_v1 WHERE subject_id=actor AND state IN ('uploading','pending') FOR UPDATE;
  IF FOUND THEN
    IF s.file_mime<>file_mime OR s.file_bytes<>file_bytes OR s.file_sha256<>file_sha256
      OR (s.state='uploading' AND (s.expires_at<=now() OR p.cnic_path IS NOT NULL))
      OR (s.state='pending' AND (p.verification_status IS DISTINCT FROM 'pending' OR p.cnic_path IS DISTINCT FROM s.object_name))
    THEN RAISE EXCEPTION 'Existing submission requires recovery' USING ERRCODE='40001'; END IF;
  ELSE
    IF p.cnic_path IS NOT NULL THEN RAISE EXCEPTION 'Legacy reference requires recovery' USING ERRCODE='40001'; END IF;
    INSERT INTO public.identity_submissions_v1(id,subject_id,object_name,file_mime,file_bytes,file_sha256)
    VALUES(request,actor,actor::text||'/cnic-'||request::text||CASE WHEN file_mime='image/png' THEN '.png' ELSE '.jpg' END,file_mime,file_bytes,file_sha256) RETURNING * INTO s;
  END IF;
  RETURN jsonb_build_object('request_id',s.id,'object_name',s.object_name,'state',s.state);
END $$;

CREATE FUNCTION public.makaanx_identity_upload_allowed_v1(object_name text) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
  SELECT EXISTS(SELECT 1 FROM public.identity_submissions_v1 s JOIN public.profiles p ON p.id=s.subject_id
    WHERE s.object_name=$1 AND s.subject_id=(SELECT auth.uid()) AND s.state='uploading' AND s.expires_at>now()
    AND p.role IN ('tenant','landlord') AND p.cnic_path IS NULL AND (p.verification_status IS NULL OR p.verification_status IN ('pending','unverified')));
$$;
-- Remove only the explicitly approved exact baseline CNIC policies.
DROP POLICY IF EXISTS cnic_owner_insert ON storage.objects;
DROP POLICY IF EXISTS makaanx_upload_own_cnic ON storage.objects;
DROP POLICY IF EXISTS cnic_documents_insert_own ON storage.objects;
DROP POLICY IF EXISTS cnic_documents_update_own ON storage.objects;
DROP POLICY IF EXISTS makaanx_admin_read_cnic ON storage.objects;
DROP POLICY IF EXISTS cnic_admin_select ON storage.objects;
CREATE POLICY identity_reserved_insert_v1 ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='cnic-documents' AND owner_id=(SELECT auth.uid())::text AND public.makaanx_identity_upload_allowed_v1(name));
-- No direct object SELECT/UPDATE/DELETE policy. No blanket administrator SELECT.
-- Legacy objects are not migrated, exposed or deleted.

CREATE FUNCTION public.makaanx_finalize_identity_v1(request_id uuid) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); p public.profiles%ROWTYPE; s public.identity_submissions_v1%ROWTYPE;
BEGIN
  IF actor IS NULL THEN RAISE EXCEPTION 'Authentication required' USING ERRCODE='42501'; END IF;
  SELECT * INTO p FROM public.profiles WHERE id=actor FOR UPDATE;
  IF NOT FOUND OR p.role IS NULL OR p.role NOT IN ('tenant','landlord') THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  SELECT * INTO s FROM public.identity_submissions_v1 WHERE id=request_id AND subject_id=actor FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Submission unavailable' USING ERRCODE='22023'; END IF;
  -- Exact retry is safe only while the same pending request is still linked.
  IF s.state='pending' AND p.verification_status='pending' AND p.cnic_path=s.object_name THEN RETURN 'pending'; END IF;
  IF s.state<>'uploading' OR s.expires_at<=now() OR p.cnic_path IS NOT NULL
    OR (p.verification_status IS NOT NULL AND p.verification_status NOT IN ('pending','unverified'))
  THEN RAISE EXCEPTION 'Stale submission' USING ERRCODE='40001'; END IF;
  IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='cnic-documents' AND o.name=s.object_name AND o.owner_id=actor::text
    AND o.metadata->>'mimetype'=s.file_mime AND o.metadata->>'size'=s.file_bytes::text)
  THEN RAISE EXCEPTION 'Reserved object unavailable' USING ERRCODE='22023'; END IF;
  UPDATE public.profiles SET cnic_path=s.object_name,verification_status='pending',verification_score=NULL WHERE id=actor;
  UPDATE public.identity_submissions_v1 SET state='pending',submitted_at=now(),version=version+1 WHERE id=s.id;
  RETURN 'pending';
END $$;

-- ONE recommended review API: single JSON object, no ambiguous overload/defaults.
CREATE FUNCTION public.makaanx_review_identity_v1(review jsonb) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE actor uuid:=auth.uid(); subject uuid; s public.identity_submissions_v1%ROWTYPE; p public.profiles%ROWTYPE;
  request uuid; expected integer; decision text; reason text; notes text;
BEGIN
  IF actor IS NULL OR public.makaanx_is_admin() IS DISTINCT FROM true
  THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  IF review IS NULL OR jsonb_typeof(review)<>'object' OR NOT(review ?& ARRAY['request_id','expected_version','decision','reason','notes'])
    OR (review-ARRAY['request_id','expected_version','decision','reason','notes'])<>'{}'::jsonb
    OR jsonb_typeof(review->'request_id')<>'string' OR jsonb_typeof(review->'expected_version')<>'number'
    OR jsonb_typeof(review->'decision')<>'string' OR jsonb_typeof(review->'reason')<>'string' OR jsonb_typeof(review->'notes')<>'string'
  THEN RAISE EXCEPTION 'Invalid review' USING ERRCODE='22023'; END IF;
  request:=(review->>'request_id')::uuid; expected:=(review->>'expected_version')::integer;
  decision:=review->>'decision'; reason:=btrim(review->>'reason'); notes:=btrim(review->>'notes');
  IF expected<1 OR decision NOT IN ('verified','rejected') OR char_length(reason)>1000 OR char_length(notes)>1000
    OR (decision='rejected' AND char_length(reason)<10)
  THEN RAISE EXCEPTION 'Invalid review' USING ERRCODE='22023'; END IF;
  SELECT subject_id INTO subject FROM public.identity_submissions_v1 WHERE id=request;
  IF subject IS NULL OR subject=actor THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
  -- All mutations lock profile THEN submission, avoiding reverse-order deadlocks.
  SELECT * INTO p FROM public.profiles WHERE id=subject FOR UPDATE;
  SELECT * INTO s FROM public.identity_submissions_v1 WHERE id=request FOR UPDATE;
  IF p.role IS NULL OR p.role NOT IN ('tenant','landlord') OR p.verification_status IS DISTINCT FROM 'pending'
    OR s.state IS DISTINCT FROM 'pending' OR s.version IS DISTINCT FROM expected OR p.cnic_path IS DISTINCT FROM s.object_name
  THEN RAISE EXCEPTION 'Stale review' USING ERRCODE='40001'; END IF;
  IF NOT EXISTS(SELECT 1 FROM storage.objects o WHERE o.bucket_id='cnic-documents' AND o.name=s.object_name
    AND o.owner_id=subject::text AND o.metadata->>'mimetype'=s.file_mime AND o.metadata->>'size'=s.file_bytes::text)
  THEN RAISE EXCEPTION 'Submitted object unavailable' USING ERRCODE='22023'; END IF;
  IF NOT EXISTS(SELECT 1 FROM public.identity_document_views_v1 v WHERE v.request_id=request AND v.reviewer_id=actor
    AND v.request_version=expected AND v.served_at BETWEEN now()-interval '10 minutes' AND now())
  THEN RAISE EXCEPTION 'Authorized recent document delivery required' USING ERRCODE='42501'; END IF;
  -- Delivery evidence is not proof a human inspected or authenticated the image.
  -- This API must remain ungranted until authorized document viewing/audit is
  -- approved and validated. Object existence is NOT human inspection evidence.
  UPDATE public.profiles SET verification_status=decision WHERE id=subject;
  UPDATE public.identity_submissions_v1 SET state=decision,version=version+1 WHERE id=request;
  INSERT INTO public.identity_review_events_v1(request_id,reviewer_id,old_status,new_status,reason,notes)
  VALUES(request,actor,'pending',decision,reason,notes);
  RETURN decision;
END $$;
REVOKE ALL ON FUNCTION public.makaanx_begin_identity_v1(text,bigint,text),public.makaanx_finalize_identity_v1(uuid),public.makaanx_identity_upload_allowed_v1(text),public.makaanx_review_identity_v1(jsonb) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_begin_identity_v1(text,bigint,text),public.makaanx_finalize_identity_v1(uuid),public.makaanx_identity_upload_allowed_v1(text) TO authenticated;
-- NO review EXECUTE grant: separate approved release after DB tests + broker.
-- Do not modify the existing administrator helper/profile SELECT policies.
COMMIT;
