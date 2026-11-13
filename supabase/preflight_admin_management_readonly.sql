-- READ ONLY. Intended staging reference: ficudncgevvxsxbjscrk.
-- Run only after selecting the intended project. Metadata only; no report text,
-- identities, CNIC paths, JWTs or stored document references are selected.
BEGIN TRANSACTION READ ONLY;
SELECT to_regclass('public.reports') AS existing_reports,
       to_regclass('public.property_reports') AS existing_property_reports,
       to_regclass('public.property_report_events') AS existing_report_events,
       to_regclass('public.property_report_events_id_seq') AS existing_report_sequence;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name IN ('reports','property_reports','property_report_events');
SELECT tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies WHERE schemaname = 'public'
  AND tablename IN ('profiles','properties','applications','favorites','reports','property_reports','property_report_events');
SELECT p.oid::regprocedure AS signature, pg_get_userbyid(p.proowner) AS owner,
       p.prosecdef AS security_definer, p.proconfig AS settings,
       has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
       has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute
FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname IN ('makaanx_is_admin','makaanx_audit_property_report_created');
-- Supplement with diagnose_admin_policy_readonly.sql for the exact helper definition
-- and preflight_core_rental_readonly.sql for rental constraints/effective grants.
COMMIT;
