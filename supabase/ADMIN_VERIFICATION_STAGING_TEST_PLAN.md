# Admin verification staging test plan

Status: guidance only; no database changes.

1. Confirm the Supabase project reference matches the staging URL in local configuration. The dashboard's `main (PRODUCTION)` label may describe the database branch, not the intended environment.
2. Obtain and verify a restorable staging backup before applying any migration. Stop if unavailable.
3. Run `supabase/verify_admin_security_readonly.sql` and `supabase/preflight_admin_access_postmigration_readonly.sql`; inspect function/policy metadata without user PII.
4. Review `supabase/migrations/20261112_admin_verification_proposed.sql` and `supabase/migrations/20261112_admin_review_audit_proposed.sql` independently. Do not apply unreviewed migrations.
5. After a reviewed read-access migration is applied in isolated staging, test through separate actual application sessions: anonymous must not read profiles; two tenants and a landlord must only read their own profiles; an admin must read authorized pending applicants.
6. Confirm tenants and landlords cannot access another person's CNIC object or change role, trust score, verification status, verification score or CNIC path. Test guessed UUID access.
7. Review storage policies for other permissive SELECT policies before enabling admin CNIC access; RLS permissive policies can combine via OR.
8. Before review actions, verify short-lived private document access, reviewer authorization, self-review denial, valid transitions, duplicate review rejection, audit insertion, and atomic rollback on error.
9. Use synthetic test documents only. Never share passwords, tokens, real CNICs, signed URLs, or service-role keys.
10. Record redacted pass/fail outcomes for anonymous, tenant A, tenant B, landlord and admin. Do not merge to main or enable review buttons until all tests pass.

A successful GitHub CI build is not a database authorization test.
