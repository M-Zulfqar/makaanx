-- PROPOSED ROLLBACK ONLY. Not executed. Separate owner approval required.
-- Only for objects created by the exact approved property-reports proposal.
-- Stop if ANY data exists; do not erase reports or audit history to roll back UI.
BEGIN;
SET LOCAL lock_timeout = '5s';
-- Prevent an insert racing the empty-table check and subsequent DROP.
LOCK TABLE public.property_reports, public.property_report_events IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.property_reports)
    OR EXISTS (SELECT 1 FROM public.property_report_events)
  THEN RAISE EXCEPTION 'Report/audit data exists. Preserve it and prepare a reviewed roll-forward plan.';
  END IF;
END $$;
DROP TRIGGER property_report_created_audit ON public.property_reports;
DROP FUNCTION public.makaanx_audit_property_report_created();
DROP TABLE public.property_report_events;
DROP TABLE public.property_reports;
COMMIT;
-- Indexes/identity sequence belonging to these tables are dropped with them.
-- Never use CASCADE or drop existing admin helpers/policies as a shortcut.
