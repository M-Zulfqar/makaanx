# Administrator access repair — current proposal

15 November 2026. Milestone 8E supersedes the unexecuted 8C/8D broad administrator
profile SELECT policy. **Do not execute historical SQL excerpts or bundles.**
The current proposal creates three restricted RPCs, adds no profile policy/grant,
and preserves own-profile RLS. See [final security package](ADMIN_ACCESS_FINAL_APPROVAL.md)
for the architecture, exact files, privilege matrix, diagnostic count scopes,
rollback, compatibility blockers and owner checklist. Staging remains **NO-GO**.

Owner-confirmed cause: missing helper gives PGRST202; only profiles_select_own
permits one profile per session. The new design intentionally keeps direct base
visibility at one and provides stored-admin-only allowlisted cross-profile reads.
Admin diagnostics now count the restricted directory with scope admin-projection;
ordinary sessions use own-rls. Historical unscoped counts have a different meaning.

Exact files: `supabase/preflight_admin_visibility_minimum_readonly.sql`,
`supabase/migrations/20261115_admin_visibility_minimum_proposed.sql`,
`supabase/verify_admin_visibility_minimum_readonly.sql`,
`supabase/rollback_admin_visibility_minimum_proposed.sql`.
No staging connection, SQL, real identity/account operation, merge or deployment
occurred. Local/CI test results are recorded in PR #8 and IMPLEMENTATION_PLAN.md.
