# MakaanX administrator verification — staging gate

Status: **not deployed, not approved for production**. This is a test plan for the proposed `supabase/migrations/20261112_admin_verification_proposed.sql`, not evidence that it has passed.

## Before any migration
1. Confirm Supabase project name and project ref are **makaanx-staging**, not the older project.
2. Back up the staging database and record current policies and function definitions.
3. Run `supabase/preflight_admin_access_readonly.sql`; export CSV (metadata only). Check that `public.profiles` and `storage.objects` have RLS enabled.
4. Review every existing SELECT policy on `storage.objects` and `public.profiles`. PostgreSQL permissive policies are OR-combined; adding a restrictive-looking policy does not undo an overly broad existing policy.
5. Confirm the proposed SECURITY DEFINER function is owned by a trusted DB role, cannot be modified by `authenticated`, and the `profiles.role` column is not client-writable.
6. Confirm existing CNIC submission RPC and storage upload policies still function; do not paste CNIC files, user emails, tokens or service-role keys into tickets or chat.

## Staging authorization matrix (separate browser sessions)
| Test actor | Read own profile | Read other profile | Read own CNIC | Read other CNIC | Update own role/status |
| --- | --- | --- | --- | --- | --- |
| Anonymous | No | No | No | No | No |
| Tenant | Yes | No | As permitted by existing policy | No | No |
| Landlord | Yes | No | As permitted by existing policy | No | No |
| Admin | Yes | Yes | Yes, if a document exists | Yes, for authorized review | No direct update |

Expected admin document read requires *explicit authorized admin session* and valid object path. Test with **dummy staging files only**, not real identity documents.

## Required regression checks
- Unauthenticated requests to the profile table, storage objects and admin routes are denied.
- Tenant/landlord cannot list or download other users' private documents, even if they know the object path.
- Tenant/landlord cannot call `makaanx_is_admin` to gain privileges; it returns false.
- Tenant/landlord cannot update `role`, `verification_status`, `verification_score`, `trust_score` or `cnic_path` through direct REST updates.
- Admin dashboard and verification queue show only what the current session can actually read; no fabricated totals.
- Existing tenant CNIC upload and `makaanx_submit_cnic` RPC continue to work.
- All tests run in staging. Do not apply proposed migration to production until peer-reviewed, backed up and passed.

## Next design gate: approval/rejection
Use a dedicated database RPC with an admin check, strict allowed status transitions, audit table (actor, subject, old/new status, timestamp), and an atomic transaction. Restrict direct UPDATE grants on protected columns. Add explicit review outcomes to the UI only after those backend tests pass.
