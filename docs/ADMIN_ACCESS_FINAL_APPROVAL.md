# Administrator access — least-privilege approval package (8E)

15 November 2026 (Asia/Karachi). Existing draft PR #8, stacked on PR #7.
**Staging decision: NO-GO / BLOCKED pending live preflight and separate approval.**
This replaces the unexecuted 8C/8D broad-read proposal reviewed at 45075b2. Do not
execute SQL excerpts from that revision or historical administrator bundles.
No staging/production connection, SQL, real accounts/documents, merge, deployment,
Storage grant or unrelated feature activation occurred in 8E.

## Confirmed evidence and remaining prerequisites

Owner supplied: project ficudncgevvxsxbjscrk; six profiles (admin 1, landlord 1,
tenant 4); current admin sees one; helper absent in every schema; only own-profile
SELECT policy; RLS on/FORCE off; diagnostics PGRST202. Missing helper and own-only
RLS explain these symptoms. Existing authenticated USAGE/SELECT and protected
column UPDATE restrictions were reported. Full live schema/grants remain unknown.

**BLOCKED:** live relation/schema ownership, PostgreSQL version, exact types,
policy shapes, inherited grants/role attributes, function default ACLs, callable
SECURITY DEFINER routines/alternate role writers, trigger definitions, auth.uid
semantics, PostgREST exposure/cache, real JWT propagation and backup/window.
Metadata hashes/text scans are not a semantic review of dynamic dependencies.
Select the intended project privately; SQL current_database is not proof of the
Supabase project reference. No permission change is authorized to make guards pass.

## Selected architecture and privacy boundary

All base `profiles` policies/grants remain unchanged: every authenticated subject,
including admin, reads only their own row directly. There is **no new administrator
SELECT policy**, table/column grant or Storage access. Existing own-profile phone
and document-reference flows are preserved.

Three public RPCs, postgres-owned, STABLE/SECURITY DEFINER, empty search_path:

| RPC | Inputs / exact output |
| --- | --- |
| makaanx_is_admin() | Zero arguments; boolean from protected stored role for auth.uid(). No client admin flag or metadata role. |
| makaanx_admin_profiles(...) | Explicit table: id UUID, full_name TEXT, role TEXT, verification_status TEXT, has_document BOOLEAN. |
| makaanx_admin_profile_counts(...) | Explicit one-row table of BIGINT total/admins/landlords/tenants/pending/submitted. No identities or document references. |

Directory/count RPCs check the helper **before filters** and raise 42501 for
non-admins, including empty filters/pages. They use qualified tables/functions,
static SQL and no writes, target administrator parameter or dynamic SQL. Postgres
is the required trusted owner of profiles and functions; FORCE must be off so the
helper does not recursively apply profiles RLS. Owner identity is not caller-
controlled. Revoked PUBLIC/anon EXECUTE; authenticated non-grantable EXECUTE only,
with extra default/inherited executors causing atomic refusal.

No cross-profile phone, raw CNIC paths, trust/verification scores or Storage objects
are returned. `has_document` means cnic_path IS NOT NULL, not valid, authentic,
nonblank or downloadable. Contact/document sentinels are synthetic test data only.
This resolves the 8D column-exposure blocker at the database interface, rather than
relying on React to hide returned fields. Future profile columns are not included.
Any change to the allowlist requires a new security review.

## Filters, counts and pagination

Both read RPCs accept the same validated filters: literal case-insensitive name
substring (max 100 characters), role in empty/admin/tenant/landlord, status in
empty/pending/verified/rejected, submission all/submitted/incomplete, required
boolean eligible-only, optional UUID IDs (max 100, one dimension, no null entries).
Empty IDs match nothing; omitted IDs means no ID filter. Null/unknown filter
values are rejected. Percent, underscore and backslash are escaped as literals.
There is no caller-provided SQL, field name or ordering expression.

Directory requires limit 1–100 and offset 0–1,000,000; defaults 100/0; fixed UUID
ascending order. Invalid inputs raise 22023 after authorization. Counts use identical
predicates without pagination; an empty page can still have a nonzero total.
Queue requests 12 per page, eligible tenants/landlords only. Owner lookup uses at
most 12 distinct IDs from the existing property page, capped server-side at 100.

Rows/counts are separate read statements and can differ under concurrent profile
changes; ordering is stable within a snapshot but offset pagination can shift as
rows change. At six staging rows this is bounded and preserves existing behavior.
No unbounded profile-row response exists; aggregate scans can grow with table size
and require future operational review/indexing if scale warrants it.

## Workflows and diagnostic semantics

| Workflow | 8E implementation |
| --- | --- |
| User directory | Restricted projection, first 100 rows ordered by ID, same visible four fields. |
| Verification queue | Same name/role/status/submission filters and 12-row pagination; safe exact matching count. |
| Property-owner labels | Restricted ID-filtered projection; only id/name consumed. No inferred missing names. |
| Dashboard/analytics profile metrics | Restricted aggregate RPC: total, roles, eligible pending and submitted pending counts. |
| Property/application metrics and samples | Existing RLS-scoped requests unchanged; their coverage is distinct. |
| Authentication/authorization | Existing verified user + protected own role; no metadata role trust. |
| Own-profile reads/writes | Existing policies and column privileges unchanged. |

`/auth/diagnostics` now explicitly reports **six privacy-safe fields**:
projectReference, authenticatedRole, adminRpcResult, accessibleProfileCount,
**accessibleProfileCountScope**, errorCodes.

- Helper true: scope `admin-projection`; count is unrestricted-filter directory
  total from the admin count RPC (expected 6), not direct base-table access.
- Helper false: scope `own-rls`; direct HEAD profiles count (expected 1).
- Helper unavailable: count and scope null; sanitized helper error code. No silent
  own-RLS fallback that could disguise a missing administrator interface.
- Admin count failure: scope admin-projection, count null, sanitized profiles code.
  Successful zero stays distinct from unavailable.

Direct profiles count for **all** existing signed-in subjects remains one under
this baseline, including admin. Historical reports with no scope field used the
old direct-table meaning; do not compare those counts to admin-projection as the
same metric. Browser/server must use the same reviewed app revision/configuration.
No tokens, claims, IDs, contacts, raw errors or document values are serialized.

## Before/after authorization matrix

| Actor / operation | Before | Proposed 8E |
| --- | --- | --- |
| Admin direct profiles SELECT | Own row | Own row |
| Admin restricted directory/count | Missing / PGRST202 | 6 allowlisted rows / total 6 |
| Tenant/landlord direct SELECT | Own row | Own row |
| Tenant/landlord directory/count | Absent | 42501, even with filters/pages |
| Anonymous profiles/helper/directory/count | Denied/absent | Denied |
| Protected role/status/document/score UPDATE | Denied | Unchanged/denied, including admin |
| Optional own name/phone UPDATE | Existing own policy | Preserved; unrelated rows denied |
| Storage files/list/download | Existing boundaries | No change or permission granted |

All after-results above are **local synthetic evidence**, not live acceptance.

## Exact SQL files and execution order (not executed live)

1. `supabase/preflight_admin_visibility_minimum_readonly.sql`: reviewed read-only,
   repeatable-read metadata/hash/shape/aggregate inventory; 15-second statement
   timeout; no identities, paths, bodies, policy literals or trigger arguments.
2. `supabase/migrations/20261115_admin_visibility_minimum_proposed.sql`: revised
   8E migration in the existing unexecuted filename; execute **this file only**,
   not a migration directory push or historical bundles, after separate approval.
3. `supabase/verify_admin_visibility_minimum_readonly.sql`: metadata/aggregate
   verification; compare source hashes with exact rollback body_hash constants.
4. `supabase/rollback_admin_visibility_minimum_proposed.sql`: separately approved
   guarded rollback only. Removes the three new functions; never CASCADE.

Migration rejects unexpected functions/overloads anywhere, literal references in
other routines (unintended activation), RLS/owner/inheritance/type/policy drift,
dangerous inherited/write/schema grants and changed 6/1/1/4 aggregates. It preserves
all existing policies and table/column ACLs and verifies hashes before commit.
Default function grants to extra roles abort the whole transaction. A managed
Supabase default may differ from local PG: inspect it; do not weaken the guard.

Rollback verifies relation/RLS/type/policy/grant baseline, exact signatures,
reviewed source hashes, output types, owner/language/settings/comment/EXECUTE,
absence of extra overloads and external text references, then drops the three
functions with RESTRICT. It does not rewind account rows or rely on a six-row
count after later legitimate activity. Source text references can lack pg_depend
edges; conservative scanning supplements RESTRICT but cannot prove absence of
constructed/dynamic references. Manual private review remains necessary.

## Transaction, availability and recovery

Both write scripts are atomic transactions: SHARE ROW EXCLUSIVE profiles lock,
5-second lock_timeout, 30-second statement_timeout and 30-second idle-in-transaction
session timeout. Ordinary profile SELECT remains available; writes/signup can
briefly wait. Function catalog locks also apply. Timeout/guard failure means abort;
explicitly ROLLBACK/close the failed session, do not continue partial statements.
Run a single reviewed batch with no concurrent DDL/role/grant changes. Table lock
alone does not serialize unrelated catalog changes; the quiet window is required.

Owner must attest a restorable backup and private baseline metadata snapshot,
exact project/revision/script hashes and maintenance window. Do not commit backups
or copy private definitions/credentials into chat. A failed migration leaves no
new RPCs; investigate the failed guard rather than remove it or retry blindly.

After separately approved rollback, new RPCs are absent and the new app shows
honest unavailable states. Coordinate a separately approved application revision
rollback/release; do not treat old broad-policy SQL as fallback. If any rollback
guard/dependency fails, stop and prepare a revised recovery review. Never CASCADE.
No app deployment or cache reload is performed/authorized by this package.

## Post-deployment acceptance — BLOCKED / not run live

After separately authorized staging change only: run exact verify script, compare
all three bodies/contracts/owners/settings/ACLs and confirm profiles_select_own is
the only SELECT policy; existing profile write privileges and data unchanged.
Use existing real admin/tenant/landlord sessions privately, never created accounts
or forged SQL JWT claims. Admin browser/server expected project ficudncgevvxsxbjscrk,
role authenticated, helper true, count 6, scope admin-projection, empty errorCodes.
Tenant/landlord: helper false, count 1, own-rls; admin RPCs denied. Anonymous denied.
Confirm directory, filters, queue, labels and metrics without fetching private
files or writing account fields. Missing RPC/PGRST202 after confirmed creation
requires discovery/cache/exposure investigation, not reapplying CREATE. Any manual
cache notification/reload needs separate approval; it is not part of preflight.

## Validation and decision

Final actual local/CI counts are recorded in the PR and implementation plan after
execution. PostgreSQL uses isolated disposable network-none fixtures and real
non-owner/NOBYPASSRLS actor roles with a fixed SESSION_USER Auth adapter. HTTP/browser
fixtures use synthetic sessions only: they are not Supabase/JWT/RLS certification.
Build uses loopback/dummy public configuration. No dependencies or feature gates
are changed by 8E.

**NO-GO for staging execution.** The broad-column privacy defect is resolved by the
proposed implementation. Live baseline/routine/default-ACL/version compatibility,
backup/window and owner acceptance of the five-field projection + safe aggregates
still require review. Next: ChatGPT reviews exact revised files; owner supplies
only missing read-only metadata after review; Codex reconciles evidence locally.
Copilot may review the same diff/tests; it must not apply SQL or enable features.
No staging execution, merge, deployment or account mutation approval is requested.

### Executed 8E validation

- `npm run test:db:admin-repair`: **39 passed**, PostgreSQL **16.16**.
- `npm run test:db:local`: **35 passed**, PostgreSQL **16.16**.
- `npm test`: **222 passed across 27 files**.
- `npm run lint -- --max-warnings=0`, `npm run typecheck`, production build and
  `git diff --check`: passed. Build used loopback/dummy configuration only.
- Local production browser suites: **22 general + 22 admin + 42 identity + 32
  messaging = 118 passed**, synthetic loopback HTTP/session fixtures only.
- Tests caught and corrected a rollback guard SQL alias collision and an outdated
  owner-label browser selector; their final reruns passed. No unresolved local
  test failure. Actual Supabase/JWT acceptance remains BLOCKED.
- Updated GitHub Actions status is recorded on PR #8 for the final commit.

## Exact 8E changed-file manifest

- `app/admin/users/page.tsx`
- `app/admin/verifications/page.tsx`
- `app/auth/diagnostics/page.tsx`
- `components/admin/presentation.tsx`
- `docs/ADMIN_ACCESS_FINAL_APPROVAL.md`
- `docs/ADMIN_ACCESS_REPAIR.md`
- `docs/ADMIN_VISIBILITY_DIAGNOSIS.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROJECT_AUDIT.md`
- `lib/admin/data.ts`
- `lib/admin/profiles.ts`
- `lib/diagnostics/admin-access.ts`
- `lib/identity/queue.ts`
- `scripts/admin-browser-smoke.cjs`
- `scripts/browser-smoke.cjs`
- `scripts/identity-browser-smoke.cjs`
- `scripts/local-db/admin-repair.cjs`
- `scripts/rental-fixture-server.cjs`
- `supabase/migrations/20261115_admin_visibility_minimum_proposed.sql`
- `supabase/preflight_admin_visibility_minimum_readonly.sql`
- `supabase/rollback_admin_visibility_minimum_proposed.sql`
- `supabase/verify_admin_visibility_minimum_readonly.sql`
- `tests/admin-access.test.ts`
- `tests/admin-management.test.ts`
- `tests/admin-pages.test.tsx`
- `tests/admin-profiles.test.ts`
- `tests/helpers/rental-client.ts`
- `tests/identity-queue.test.ts`
