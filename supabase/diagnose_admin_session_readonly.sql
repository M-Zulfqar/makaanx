-- READ ONLY. Run ONLY in an already-authenticated diagnostic SQL session.
-- The SQL editor normally runs as postgres without the app JWT: its count is
-- privileged and is NOT evidence that the application admin session can read six.
-- No SET ROLE, forged claims, user identifiers or account creation are required.
BEGIN TRANSACTION READ ONLY;
SELECT current_user AS database_role,
       auth.role() AS authenticated_role,
       auth.uid() IS NOT NULL AS authenticated_subject_present;

-- Check the helper definition with diagnose_admin_policy_readonly.sql first.
-- The application diagnostic invokes the same existing zero-argument helper.
SELECT public.makaanx_is_admin() AS admin_rpc_result,
       (SELECT count(*) FROM public.profiles) AS accessible_profile_count;
COMMIT;
