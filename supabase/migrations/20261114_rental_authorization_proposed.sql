-- CONDITIONAL PROPOSAL ONLY. Local synthetic-baseline tests do not authorize live
-- installation. Requires exact deployed metadata, backup, review and approval.
-- This is a focused authorization/transition layer, not a replacement schema.
BEGIN;
SET LOCAL lock_timeout='5s';
DO $$ DECLARE expected text:='REVIEW_REQUIRED'; actual text; BEGIN
 SELECT md5(coalesce(string_agg(row_to_json(p)::text,E'\n' ORDER BY p.tablename,p.policyname),'')) INTO actual
 FROM pg_policies p WHERE schemaname='public' AND tablename IN('properties','applications','favorites');
 IF expected='REVIEW_REQUIRED' OR expected<>actual THEN RAISE EXCEPTION 'Exact reviewed rental policy baseline required'; END IF;
 -- Never remove unknown permissive/restrictive policies from a live project.
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename IN('properties','applications','favorites'))
 THEN RAISE EXCEPTION 'Existing rental policies need a separately reviewed replacement diff'; END IF;
 IF to_regprocedure('public.makaanx_is_admin()') IS NULL OR to_regprocedure('public.makaanx_application_transition_v1()') IS NOT NULL
 THEN RAISE EXCEPTION 'Missing reviewed helper or existing transition implementation'; END IF;
 IF EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.applications'::regclass AND NOT tgisinternal)
 THEN RAISE EXCEPTION 'Existing application triggers need reconciliation'; END IF;
 IF EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid IN('public.applications'::regclass,'public.favorites'::regclass) AND contype='f' AND confdeltype IN('c','n','d'))
 THEN RAISE EXCEPTION 'History-preserving FK baseline required; do not auto-rewrite constraints'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(ARRAY['role','verification_status','verification_score','trust_score','cnic_path']) col
 CROSS JOIN(VALUES('anon'),('authenticated')) roles(actor) WHERE has_column_privilege(roles.actor,'public.profiles',col,'INSERT') OR has_column_privilege(roles.actor,'public.profiles',col,'UPDATE'))
 THEN RAISE EXCEPTION 'Protected profile grants required'; END IF;
END $$;
-- Existing policies intentionally cause abort even if fingerprint is pinned.
-- For real tables, produce the minimal exact policy replacement after evidence.
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.properties,public.applications,public.favorites FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text;c record; BEGIN
 FOREACH t IN ARRAY ARRAY['properties','applications','favorites'] LOOP
  FOR c IN SELECT attname FROM pg_attribute WHERE attrelid=format('public.%I',t)::regclass AND attnum>0 AND NOT attisdropped LOOP
   EXECUTE format('REVOKE INSERT(%I),UPDATE(%I),SELECT(%I),REFERENCES(%I) ON public.%I FROM PUBLIC,anon,authenticated',c.attname,c.attname,c.attname,c.attname,t);
  END LOOP;
 END LOOP;
END $$;
GRANT SELECT(id,landlord_id,title,address,city,type,rent,bedrooms,bathrooms,area,status,created_at) ON public.properties TO anon,authenticated;
GRANT INSERT(landlord_id,title,address,city,type,rent,bedrooms,bathrooms,area,status) ON public.properties TO authenticated;
GRANT UPDATE(title,address,city,type,rent,bedrooms,bathrooms,area),DELETE ON public.properties TO authenticated;
CREATE POLICY rental_properties_public_v1 ON public.properties FOR SELECT TO anon,authenticated USING(status='vacant');
CREATE POLICY rental_properties_owner_v1 ON public.properties FOR SELECT TO authenticated USING(landlord_id=(SELECT auth.uid()));
CREATE POLICY rental_properties_admin_v1 ON public.properties FOR SELECT TO authenticated USING((SELECT public.makaanx_is_admin()));
CREATE POLICY rental_properties_insert_v1 ON public.properties FOR INSERT TO authenticated WITH CHECK(landlord_id=(SELECT auth.uid()) AND status='vacant' AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='landlord'));
CREATE POLICY rental_properties_update_v1 ON public.properties FOR UPDATE TO authenticated USING(landlord_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='landlord')) WITH CHECK(landlord_id=(SELECT auth.uid()));
CREATE POLICY rental_properties_delete_v1 ON public.properties FOR DELETE TO authenticated USING(landlord_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='landlord'));
GRANT SELECT(id,property_id,tenant_id,status,created_at) ON public.applications TO authenticated;
GRANT INSERT(property_id,tenant_id,status),UPDATE(status) ON public.applications TO authenticated;
CREATE POLICY rental_applications_read_v1 ON public.applications FOR SELECT TO authenticated USING(tenant_id=(SELECT auth.uid()) OR EXISTS(SELECT 1 FROM public.properties p WHERE p.id=applications.property_id AND p.landlord_id=(SELECT auth.uid())) OR (SELECT public.makaanx_is_admin()));
CREATE POLICY rental_applications_insert_v1 ON public.applications FOR INSERT TO authenticated WITH CHECK(tenant_id=(SELECT auth.uid()) AND status='pending' AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='tenant') AND EXISTS(SELECT 1 FROM public.properties p WHERE p.id=applications.property_id AND p.status='vacant' AND p.landlord_id<>(SELECT auth.uid())));
CREATE POLICY rental_applications_update_v1 ON public.applications FOR UPDATE TO authenticated USING(EXISTS(SELECT 1 FROM public.properties p WHERE p.id=applications.property_id AND p.landlord_id=(SELECT auth.uid())) AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='landlord')) WITH CHECK(EXISTS(SELECT 1 FROM public.properties p WHERE p.id=applications.property_id AND p.landlord_id=(SELECT auth.uid())));
CREATE FUNCTION public.makaanx_application_transition_v1() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$
BEGIN
 IF OLD.status IS DISTINCT FROM 'pending' OR NEW.status IS NULL OR NEW.status NOT IN('approved','rejected') OR (to_jsonb(NEW)-'status') IS DISTINCT FROM (to_jsonb(OLD)-'status')
 THEN RAISE EXCEPTION 'Pending-only immutable-key transition required' USING ERRCODE='22023'; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.makaanx_application_transition_v1() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER makaanx_application_transition_v1 BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.makaanx_application_transition_v1();
GRANT SELECT(id,property_id,user_id,created_at),INSERT(property_id,user_id),DELETE ON public.favorites TO authenticated;
CREATE POLICY rental_favorites_read_v1 ON public.favorites FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()));
CREATE POLICY rental_favorites_insert_v1 ON public.favorites FOR INSERT TO authenticated WITH CHECK(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.profiles WHERE id=(SELECT auth.uid()) AND role='tenant') AND EXISTS(SELECT 1 FROM public.properties p WHERE p.id=favorites.property_id));
CREATE POLICY rental_favorites_delete_v1 ON public.favorites FOR DELETE TO authenticated USING(user_id=(SELECT auth.uid()));
COMMIT;
-- Rollback is a separately reviewed ACL/policy restoration, not dropping all
-- security. Do not remove transition/FK/uniqueness protection to make UI succeed.
