-- PROPOSAL ONLY / NOT APPLIED. Explicit database-owner approval required.
-- Prerequisites: docs/STAGING_SECURITY_VALIDATION.md and admin helper runtime
-- verification. The known admin one-of-six issue must be understood first.
-- No existing administrator policy/helper, rental table, grant or CNIC bucket
-- is modified. Abort rather than shadow an unknown existing reporting workflow.
BEGIN;
SET LOCAL lock_timeout = '5s';
DO $$
BEGIN
  IF to_regclass('public.reports') IS NOT NULL
    OR to_regclass('public.property_reports') IS NOT NULL
    OR to_regclass('public.property_report_events') IS NOT NULL
    OR to_regclass('public.property_report_events_id_seq') IS NOT NULL
    OR to_regprocedure('public.makaanx_audit_property_report_created()') IS NOT NULL
  THEN RAISE EXCEPTION 'Existing report objects require review; no automatic reconciliation.';
  END IF;
  IF to_regprocedure('public.makaanx_is_admin()') IS NULL
  THEN RAISE EXCEPTION 'Reviewed administrator helper is required.'; END IF;
  IF has_column_privilege('authenticated','public.profiles','role','UPDATE')
  THEN RAISE EXCEPTION 'Profile role lockdown is required before report policies.'; END IF;
END $$;

CREATE TABLE public.property_reports (
  id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  reporter_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE RESTRICT,
  category text NOT NULL CHECK (category IN ('inaccurate','unsafe','fraud','other')),
  summary text NOT NULL CHECK (char_length(btrim(summary)) BETWEEN 10 AND 1000),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','triaged','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.property_report_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  report_id uuid NOT NULL REFERENCES public.property_reports(id) ON DELETE RESTRICT,
  actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  action text NOT NULL CHECK (action = 'created'),
  new_status text NOT NULL CHECK (new_status = 'open'),
  occurred_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.property_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_report_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.property_reports, public.property_report_events FROM PUBLIC, anon, authenticated;
REVOKE ALL ON SEQUENCE public.property_report_events_id_seq FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.property_reports, public.property_report_events TO authenticated;
-- Clients cannot spoof reporter, status, timestamp or primary key.
GRANT INSERT (property_id, category, summary) ON public.property_reports TO authenticated;
CREATE POLICY property_reports_read_own ON public.property_reports FOR SELECT TO authenticated
USING (reporter_id = (SELECT auth.uid()));
CREATE POLICY property_reports_read_admin ON public.property_reports FOR SELECT TO authenticated
USING ((SELECT public.makaanx_is_admin()));
CREATE POLICY property_reports_insert_own ON public.property_reports FOR INSERT TO authenticated
WITH CHECK (
  reporter_id = (SELECT auth.uid()) AND status = 'open'
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = (SELECT auth.uid()) AND p.role IN ('tenant','landlord'))
  AND EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_reports.property_id)
);
CREATE POLICY property_report_events_read_admin ON public.property_report_events FOR SELECT TO authenticated
USING ((SELECT public.makaanx_is_admin()));
CREATE INDEX property_reports_queue_idx ON public.property_reports (status, created_at DESC, id);
CREATE INDEX property_reports_reporter_idx ON public.property_reports (reporter_id, created_at DESC, id);
CREATE INDEX property_reports_property_idx ON public.property_reports (property_id);
CREATE INDEX property_report_events_report_idx ON public.property_report_events (report_id, occurred_at, id);

-- Trigger must be owned by the trusted migration owner; never callable as RPC.
CREATE FUNCTION public.makaanx_audit_property_report_created() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  IF auth.uid() IS NULL OR NEW.reporter_id <> auth.uid() OR NEW.status <> 'open'
  THEN RAISE EXCEPTION 'An authenticated own report with open status is required.'; END IF;
  INSERT INTO public.property_report_events (report_id, actor_id, action, new_status)
  VALUES (NEW.id, auth.uid(), 'created', 'open');
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION public.makaanx_audit_property_report_created() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER property_report_created_audit AFTER INSERT ON public.property_reports
FOR EACH ROW EXECUTE FUNCTION public.makaanx_audit_property_report_created();
COMMIT;
-- No authenticated UPDATE/DELETE and no moderation RPC are granted. Future
-- transitions require a separately reviewed atomic decision/audit design.
-- Nothing here approves, rejects or exposes private identity documents.
