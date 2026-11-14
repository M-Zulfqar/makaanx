# Minimum administrator visibility repair — security review package

> Milestone 8D: see ADMIN_ACCESS_FINAL_APPROVAL.md. Current decision is NO-GO.
> Live preflight and data-scope approval are missing; this is not an execution plan approval.

15 November 2026 (Asia/Karachi). Base PR #7 (`dc72da3`); branch
`feature/admin-access-minimum-repair`, stacked draft onto
`feature/backend-integration-readiness`. **Proposed only. No staging/production
connection, SQL or account change occurred. No deployment/merge is requested here.**

## Newly confirmed baseline and diagnosis

The owner now confirms project `ficudncgevvxsxbjscrk`: no makaanx_is_admin function
or overload in any schema; profiles RLS enabled/FORCE disabled; sole SELECT policy
profiles_select_own TO authenticated USING ((SELECT auth.uid()) = id); no admin
SELECT policy; authenticated schema USAGE/table SELECT; protected-column UPDATE
denied; six profiles (1 admin/1 landlord/4 tenants). Both browser/server return
PGRST202 and one accessible profile.

These facts supersede the earlier owner observations of an existing helper/admin
policy. The missing RPC explains discovery error PGRST202; own-only SELECT explains
one visible row. This is evidence for a minimal missing-object repair, not a reason
to bypass RLS. No live repair is claimed based on local results.

Established contract is reused from the narrow historical
`20261112_admin_profile_read_staging_proposed.sql`: zero-argument, stable boolean
SECURITY DEFINER helper checking auth.uid against protected stored profiles.role.
The new file uses CREATE, not CREATE OR REPLACE; it does not drop/recreate any
existing policy and refuses existing helpers anywhere.

## Exact review files

- `supabase/migrations/20261115_admin_visibility_minimum_proposed.sql` — full exact
  proposed transaction, unmodified in focused local tests.
- `supabase/rollback_admin_visibility_minimum_proposed.sql` — exact guarded rollback.
- `supabase/verify_admin_visibility_minimum_readonly.sql` — owner metadata/aggregate
  verification. Read-only; it does not forge JWT/session claims.

Only persistent objects added: public.makaanx_is_admin() and
makaanx_admin_read_profiles SELECT policy. The helper comment identifies this
repair for guarded rollback. No INSERT/UPDATE/DELETE/TRUNCATE/REFERENCES/TRIGGER
privilege, own-read/write policy, row/account, Storage rule, identity workflow,
rental or messaging object is changed. Transaction-local guard settings are not
persistent schema objects. No unrelated feature gate is enabled.

## Preconditions and explicitly unconfirmed safety prerequisites

The supplied staging evidence is not a full privilege/DDL snapshot. The SQL
therefore additionally **refuses** until all these conditions hold:

- Current migration owner and profiles table owner are postgres; ordinary table,
  no inheritance/partitioning; RLS on/FORCE off; id UUID NOT NULL single primary key,
  role TEXT NOT NULL, established protected fields present.
- No helper/procedure/overload with that name in any schema; exact own-only
  permissive SELECT expression and role. The only optional other policy is the
  established profiles_update_own with exact own USING/WITH CHECK. Unknown or
  NULL/unconditional policies abort. Existing write policies are never replaced.
- Authenticated USAGE/table SELECT; anon is not a member of authenticated and has
  no profile SELECT. Neither role can CREATE in public/auth, write/REFERENCE the
  table or INSERT/REFERENCE columns. Only optional authenticated UPDATE(full_name,
  phone) is accepted; all other UPDATE privileges must be absent, including inherited.
- Exactly 1 admin/1 landlord/4 tenants at execution; a concurrent signup/count
  change requires rechecking evidence, not weakening the guard.
- Newly created helper ACL may contain only owner + non-grantable authenticated
  EXECUTE. Unexpected default/inherited EXECUTE (e.g. an additional default-granted
  role) aborts and rolls back the entire transaction. Global/default grants are
  NOT silently changed to make it pass.

Some of these are **additional fail-closed assumptions**, not new claims about
staging. Confirm them from owner-reviewed metadata before execution approval.
The transaction has no project-reference oracle: the owner must select the exact
project independently. An identical wrong project could satisfy SQL metadata.
Review trusted signup/alternate role-writing RPCs and schema owners too; a read
helper cannot make an existing role-escalation writer safe. No alternate writer
was inspected on staging by Codex.

## Before/after privilege and row-visibility matrix

| Actor / operation | Before observed baseline | After proposed repair | Rollback |
| --- | --- | --- | --- |
| Stored admin: profiles SELECT | Own row only (1) | Six rows via added authenticated policy | Own row only |
| Tenant/landlord: profiles SELECT | Own row only | Own row only; helper false | Own row only |
| Anonymous: profiles SELECT | Must be denied (guard prerequisite) | Denied | Denied |
| Authenticated: helper EXECUTE | Function absent / PGRST202 | Allowed, no arguments, returns own stored-role boolean | Absent / PGRST202 |
| Anonymous/PUBLIC: helper EXECUTE | Absent | Revoked; no elevation | Absent |
| Protected profile INSERT/UPDATE | Must already be denied | Unchanged; no grant | Unchanged |
| Optional own full_name/phone UPDATE | Existing grant/policy, if present | Unchanged | Unchanged |
| Profile DELETE/other dangerous writes | Must already be denied | Unchanged | Unchanged |
| Private document storage access | Existing rules | Unchanged; no access granted | Unchanged |

Important privacy boundary: admin SELECT covers **rows**, not just directory
columns. Existing authenticated table SELECT means a legitimate stored admin can
read existing selectable profile columns across those rows (potentially phone or
document-reference fields). The helper itself returns only boolean, and the
application diagnostic only counts. No Storage object/bytes/signed URL is exposed
by this migration. If column-limited admin access is desired instead, that needs
a separate approved projection/grant design; it is not secretly added here.

## Transactions, locking and deployment risks

One transaction: check baseline under SHARE ROW EXCLUSIVE table lock, create
helper/ACL/policy, assert profile ACL/column ACL/write-policy fingerprints unchanged,
commit. Five-second lock timeout and thirty-second statement timeout abort rather
than waiting indefinitely. Ordinary SELECT remains possible; profile writes/signup
triggers can briefly wait. Schedule a quiet short window with no concurrent DDL.
No function or policy is partially committed after a guard or timeout failure.

Postgres ownership is explicit; its trusted owner can read profiles without
recursive self-RLS (table owner and FORCE off). No service key or client bypass is
introduced. The function has an empty search_path and qualified references.
Authenticated clients cannot supply another subject or change their stored role
using this helper. Do not relax ownership/grant guards blindly after an abort.

PostgREST can temporarily retain the old RPC schema cache. If SQL metadata shows
the exact helper but HTTP still gives PGRST202, investigate normal schema-cache
reload; do not rerun CREATE or add a second policy. An explicit
`NOTIFY pgrst, 'reload schema';` is not part of the read-only verification file or
this proposed migration; obtain approval if a manual reload is actually needed.
No app rebuild/deployment is needed if its existing public configuration and
revision already match this project.

Rollback validates the helper body, owner, language/volatility/search_path/comment/
ACL and exact SELECT policies; it drops only the new policy and helper. DROP
FUNCTION RESTRICT (never CASCADE) refuses additional dependencies and restores the
policy too when the transaction aborts. Later dependent report/identity policies
could therefore require a new rollback review. Successful rollback loses admin
cross-profile visibility and restores the absent-RPC error; no data is erased.

## Local evidence and limits

Focused runner: `npm run test:db:admin-repair`. It reuses PR #7's pinned, local Unix
Docker/network-none safety helper and creates **profiles/auth-only** synthetic
fixtures: 1 admin, 1 landlord, 4 tenants. Non-owner/NOBYPASSRLS SQL actors include
two tenants, the landlord, the admin and anonymous. Two additional tenant profiles
supply the six-row baseline; they are not real accounts. The local auth.uid adapter
maps SESSION_USER, not JWTs; real PostgREST discovery is not emulated (missing SQL
function is 42883, while observed HTTP error is PGRST202).

Tests exercise exact unpatched migration/rollback, before admin=1/no helper and
after admin=6, ordinary own=1/helper=false, anonymous denial, protected-column and
parameter abuse denial, unchanged data/ACL/write and own policies, and exact
rollback returning own-only. Negative fixtures prove refusal of extra/restrictive/
NULL policies, inherited protected grants, INSERT/schema CREATE, FORCE/schema
column drift, functions in other schemas, unexpected default EXECUTE, second
application, changed helper body and dependent rollback objects. Unsafe fixtures
are owner-only local setup and removed before successful authorization assertions;
no RLS bypass is used to make an actor test pass.

Final command results are recorded in the draft PR and IMPLEMENTATION_PLAN.md.
Existing full local PostgreSQL suite is retained; CI adds the focused suite and a
bounded metadata-only result artifact. No local test proves live Supabase JWT,
project selection, function default ACL or PostgREST schema-cache behavior.

## Owner approval checklist — no execution requested yet

1. Security-review the exact three SQL files. Confirm the additional owner/type/
   policy/CREATE/write/default-ACL prerequisites privately; do not send keys or rows.
2. Select intended project ficudncgevvxsxbjscrk and verify a restorable backup plus
   exact policy/ACL/function metadata snapshot. Approve the precise migration,
   expected admin-six/nonadmin-own outcome, short writer-blocking window, risks and
   guarded rollback. Do not approve broad historical admin/storage migrations.
3. Only after explicit execution approval, an authorized owner runs this single
   transaction. Codex has not done so. Capture bounded success/error codes only;
   any abort means stop and reconcile the exact changed baseline.
4. Run the read-only verification SQL as owner for metadata/aggregates, then the
   unchanged /auth/diagnostics in existing real admin and tenant/landlord sessions.
   Expected admin: intended ref, API role authenticated, helper true, count six,
   errorCodes empty. Others: helper false/count one. SQL-editor owner counts are
   not proof of JWT/RLS behavior. No forged claims, account creation, permission
   changes, merge or deployment are authorized by this checklist itself.
