-- READ ONLY: staging admin profile permissions preflight.
-- No personal information or CNIC documents are returned.
-- Run in makaanx-staging SQL Editor, export results as CSV.
SELECT 'column_update' AS category,
       column_name AS name,
       CASE WHEN has_column_privilege('authenticated','public.profiles',column_name,'UPDATE')
            THEN 'allowed' ELSE 'denied' END AS details
FROM information_schema.columns
WHERE table_schema='public' AND table_name='profiles'
UNION ALL
SELECT 'table_privilege', privilege,
       CASE WHEN has_table_privilege('authenticated','public.profiles',privilege)
            THEN 'allowed' ELSE 'denied' END
FROM (VALUES ('SELECT'),('INSERT'),('UPDATE'),('DELETE')) AS p(privilege)
UNION ALL
SELECT 'profile_policy', policyname,
       cmd || ' roles=' || array_to_string(roles,',') ||
       ' using=' || coalesce(qual,'NULL') ||
       ' check=' || coalesce(with_check,'NULL')
FROM pg_policies
WHERE schemaname='public' AND tablename='profiles'
ORDER BY category,name;
