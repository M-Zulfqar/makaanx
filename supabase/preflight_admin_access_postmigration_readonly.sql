-- MakaanX administrator access post-migration inspection.
-- READ ONLY. Run on the intended STAGING project after the proposed
-- administrator read-access migration has been reviewed and applied.
-- This query does not fetch user identities, CNIC paths, or document contents.
-- It checks policy definitions, not real-user authorization behavior.
SELECT 'function' AS category,
       p.proname AS name,
       'security_definer=' || p.prosecdef::text ||
       '; authenticated_execute=' ||
       has_function_privilege('authenticated', p.oid, 'EXECUTE')::text AS details
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'makaanx_is_admin'
UNION ALL
SELECT 'profile_policy', policyname,
       cmd || '; roles=' || array_to_string(roles, ',') ||
       '; using=' || coalesce(qual, '<none>')
FROM pg_policies
WHERE schemaname='public' AND tablename='profiles'
UNION ALL
SELECT 'storage_policy', policyname,
       cmd || '; roles=' || array_to_string(roles, ',') ||
       '; using=' || coalesce(qual, '<none>')
FROM pg_policies
WHERE schemaname='storage' AND tablename='objects'
UNION ALL
SELECT 'rls_status', n.nspname || '.' || c.relname,
       'enabled=' || c.relrowsecurity::text ||
       '; forced=' || c.relforcerowsecurity::text
FROM pg_class c
JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE (n.nspname='public' AND c.relname='profiles')
   OR (n.nspname='storage' AND c.relname='objects')
ORDER BY category, name;
