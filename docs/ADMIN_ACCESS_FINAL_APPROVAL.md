# Administrator repair — final security decision

15 November 2026 (Asia/Karachi). PR #8, based on PR #7. This review supersedes the
readiness implications of the original a58d513 package. **Decision: NO-GO / BLOCKED
for staging execution.** Local database success is not live compatibility evidence.
No staging/production connection, SQL, accounts, private documents, deployment,
merge or feature activation occurred in this review.

## 1. Confirmed staging evidence (owner supplied)

Project ficudncgevvxsxbjscrk; six profiles (1 admin, 1 landlord, 4 tenants); existing
admin can read one. Helper absent in every schema; SELECT profiles_select_own
only; RLS enabled/FORCE off. Existing authenticated schema USAGE/table SELECT and
protected-column UPDATE restrictions were reported; both diagnostics show
PGRST202/count one. These observations explain the missing RPC and own-only data.
They do not establish all grants, schema types/owners, routine writers or defaults.

## 2. Exact files and proposed execution boundary

| File | Status |
| --- | --- |
| supabase/preflight_admin_visibility_minimum_readonly.sql | Exact new metadata/aggregate preflight for security review; NOT run live. This is the next evidence step, after review, not migration approval. |
| supabase/migrations/20261115_admin_visibility_minimum_proposed.sql | Revised guarded repair; reviewed/tested locally, BLOCKED for staging. No scope approval given. |
| supabase/rollback_admin_visibility_minimum_proposed.sql | Revised exact guarded rollback; separate approval, BLOCKED for staging. |
| supabase/verify_admin_visibility_minimum_readonly.sql | Existing read-only post-deploy checks; owner metadata counts alone cannot prove JWT/RLS. |

Do not execute the historical admin/storage bundles or replay all migrations.
Do not use the a58d513 SQL excerpt after this review; review the current PR files.

## 3. Security and compatibility findings

- The SQL/STABLE/zero-argument boolean helper uses protected stored profiles.role,
  not metadata or a target parameter. Owner postgres equals table owner, FORCE
  disabled; this avoids recursive profile RLS. Empty search_path and qualified
  public.profiles/auth.uid references are correct. No record mutation in the body.
- Existing public/anon EXECUTE is revoked on the new function; authenticated gets
  non-grantable EXECUTE. Extra function default grantees abort. Other function/
  schema/policy/column conflicts remain fail-closed; own/write ACLs are preserved.
- New guard rejects client or reachable parent roles with superuser, BYPASSRLS or
  CREATEROLE attributes, and membership of postgres. Actor tests remain non-bypass.
- Creating a missing helper can unintentionally activate an existing PL/pgSQL RPC
  that already references it. New guard blocks literal references in other routines;
  preflight inventories public callable SECURITY DEFINER routines and helper refs.
  Dynamic/constructed names or indirect writers require private owner source review;
  the text scan is deliberately conservative and is NOT proof of a complete graph.
- Rollback now also refuses profile ownership/relation/RLS/FORCE drift.
- DROP FUNCTION RESTRICT does not capture all SQL/PL/pgSQL **text-body** references.
  A real PG test demonstrates zero pg_depend edge for a text-body caller. Rollback
  now refuses known textual references as well as catalog dependencies. Unknown
  dynamic dependencies remain a review blocker, not permission to use CASCADE.
- Added 30-second idle-in-transaction timeout to repair/rollback alongside 5-second
  lock and 30-second statement limits. This bounds a paused batch's lock retention;
  execute one batch and explicitly ROLLBACK after an error rather than pausing.
- No syntax/privilege-query defect was found in the originally tested a58d513 SQL
  on PostgreSQL 16.16. Added guard/preflight alias/parenthesis errors were caught by
  local execution and corrected before final validation. No guard was weakened.
- Actual Supabase PostgreSQL version is still unknown. The preflight reports it;
  PG16-only membership fields are read through to_jsonb and are null on older
  catalogs. Plain PG tests do not validate PostgREST/JWT/session/cache behavior.

## 4. Sensitive-column exposure — approval blocker

The existing authenticated **table SELECT** grant, combined with an admin row
policy, makes **every non-dropped current profile column, and future table-granted
columns, selectable across all profiles by stored admins**. Local baseline fields
are id, full_name, phone, role, trust_score, verification_score, verification_status,
cnic_path. The exact live inventory is unknown until the preflight; do not assume
that this list is exhaustive. No private values are retrieved by the preflight.

| Actual admin application query | Needed cross-profile information |
| --- | --- |
| app/admin/users and lib/identity/queue | id, full_name, role, verification_status |
| lib/admin/data property-owner lookup | id, full_name |
| Profile/role/pending analytics | Counts, grouped role/status, document-presence predicate |
| /auth/diagnostics | Helper boolean + exact count, no rows |
| Authorization | Own stored role only |

Phone, raw document paths and verification/trust scores are not returned by the
current admin pages. `cnic_path` is used only as an
IS NULL/NOT NULL predicate; a presence boolean suffices. A synthetic test proves
admin can query unnecessary contact/path columns after the proposed policy while
an ordinary tenant cannot. No real private path/document was accessed.

**Finding:** broader than current UI needs. No Storage bytes/list/download grant
is added, but a private object path itself is sensitive metadata. Not selecting it
in React is not database-level least privilege. Owner privacy/data-scope acceptance
or a narrower design is BLOCKED; passing SQL guards does not approve exposure.

## 5. Minimal safer alternative — proposed, not implemented

Keep base profiles RLS own-only and existing own-user reads unchanged. Expose a
trusted-admin-only projection/RPC returning id/full_name/role/verification_status
and has_document boolean, plus safe aggregate counts. Authorize with the same
stored-role helper; no new role model, Storage access or service key. A view option
would require a security-barrier, explicit allowlist, trusted ownership and explicit
admin predicate; an RPC must validate filters/pagination and not return raw paths.

Adapt only admin directory/queue/owner/count queries to that projection. Visible
names, six-profile directory, filters and analytics can be preserved. Do not
simply revoke table SELECT and grant four columns to authenticated: tenants,
landlords and admins share that DB role, so legitimate own-profile phone/path
flows would break. This requires a separately reviewed adapter/API change and tests.

The current diagnostic's HEAD count explicitly means **base-table RLS visibility**.
With own-only base RLS that count correctly remains one; do not silently report a
projection count as the same metric or claim the original direct-count contract is
unchanged. A projection design needs explicit diagnostic scope/label review. No
alternative migration, application query switch or feature gate is enabled here.

## 6. Remaining exact preflight checks — all live results BLOCKED

- Project selection, PostgreSQL version and actual inspecting role; profiles/
  schema ownership, ordinary table/no inheritance, RLS/FORCE, UUID id PK, non-null
  TEXT role and required column inventory/types.
- Exact SELECT/optional UPDATE policy shapes; no unexpected policies. Script
  returns hashes/shape booleans, not potentially identifying policy literals.
- Effective table/column INSERT/UPDATE/DELETE/etc, anon read denial, schema CREATE,
  transitive privileged membership and direct membership/admin options.
- Global/built-in plus schema-additive function EXECUTE defaults. Extra surviving
  grantees cause the repair to roll back; do not modify global defaults to pass.
- Helper/overload absence, auth.uid metadata, executable SECURITY DEFINER routines,
  helper references, auth.users/profiles trigger metadata. Source hashes/flags
  are not a semantic review of alternate role writers or dynamic SQL. Owner must
  privately inspect any unclear definition without sharing secrets or literals.
- Six-profile aggregate and existing intended administrator assignment. Aggregates
  alone cannot identify the signed-in subject; keep identities private and validate
  the real session after any separately approved change.

The preflight is a REPEATABLE READ READ ONLY transaction with 15-second statement
limit. It returns metadata/hashes/flags and role counts only: no profile identities,
contacts, paths, function bodies, trigger arguments or JWTs. It creates no objects,
changes no privileges, invokes no application RPC and obtains no new locks beyond
normal SELECT access. It cannot prove the project reference from SQL alone or
predict changes after the snapshot; execution-time guards remain necessary.

## 7. Authorization matrix (proposed row policy, not live results)

| Actor/operation | Before | Proposed result locally | Live acceptance |
| --- | --- | --- | --- |
| Admin SELECT | Own row | Six profiles, including unneeded selectable columns | BLOCKED on scope decision + preflight |
| Tenant/landlord SELECT | Own row | Own row only | BLOCKED pending real sessions |
| Anonymous profile/helper | No access required | Denied | BLOCKED pending live check |
| Authenticated helper | Absent / PGRST202 | Own-role boolean, no target parameter | BLOCKED pending real RPC/cache check |
| Protected writes | Denied requirement | Unchanged/denied | BLOCKED pending effective grants |
| Optional own name/phone writes | Existing own rules | Unchanged | No expansion authorized |
| Storage/documents | Existing boundaries | No grant/change | No access authorized |

## 8. Backup, locks and recovery prerequisites

Owner must verify a restorable backup and private baseline ACL/policy/routine
snapshot, exact project/revision/script hash, quiet maintenance window and no
concurrent DDL. Backups must not be committed or exported to chat. SHARE ROW
EXCLUSIVE allows ordinary reads but can briefly block profile writes/signup.
Timeout/guard failure aborts the transaction; close/ROLLBACK the failed session.
No account rows, profile grants or existing policies are changed by the repair.

Rollback: after separate approval, run the exact rollback file as one transaction.
It validates helper/body/settings/comment/ACL and both SELECT policies, refuses
known routine references, drops only the added policy/helper with RESTRICT and
commits. Any failure must roll back; do not remove dependencies or use CASCADE.
Rollback returns admin visibility to own-only and the RPC to absent; it does not
erase data. Changes made by later authorized migrations require a new rollback
review. No rollback was run on staging.

## 9. Post-deployment and authenticated-session criteria (not run live)

After a separately approved change only: owner runs the exact read-only verify
file, confirms owner/empty path/STABLE/zero args/EXECUTE and unchanged own/write
ACLs. Existing admin browser/server diagnostics must match intended project,
API role authenticated, helper true, accessibleProfileCount six and empty codes
for the current row-policy design. Ordinary existing tenant/landlord sessions:
helper false, own count one. Anonymous denied. No forged claims/accounts/writes.
If a narrower projection is chosen, review its distinct diagnostic criteria first.

PostgREST discovery/cache and real JWT propagation remain untested locally.
Existing helper + persistent PGRST202 warrants cache investigation, not reapplying
CREATE or adding more policies. Any manual NOTIFY/cache reload needs its own
review/approval and is not in the read-only preflight. No app deployment needed
if public configuration already matches the intended project and revision.

## 10. Decision and approval boundary

**NO-GO.** Blocking items: live metadata/precondition results absent; sensitive
cross-profile column scope not approved (narrower alternative recommended);
alternate writer/dynamic routine review absent; actual Supabase version/cache/
JWT behavior unverified; restorable backup/window not attested. Exact tested SQL
and the existence of a single admin do not remove these blockers.

Next: ChatGPT security-review the preflight and findings; the owner obtains only
missing live read-only evidence and decides the profile data scope. Codex can then
reconcile a precise reviewed diff or implement the authorized projection locally.
No staging migration execution, privilege change, merge, deployment or feature
activation approval is requested by this document.

## 11. Actual final local validation

PostgreSQL **16.16**, disposable network-isolated synthetic fixtures only:
`npm run test:db:admin-repair` **28 passed** (including executing the exact preflight,
privileged memberships, unintended activation, sensitive-column exposure, rollback
RLS drift and text-body dependencies); `npm run test:db:local` **35 passed**.
`npm test` **210 passed / 26 files**; `npm run lint -- --max-warnings=0`,
`npm run typecheck` and `npm run build` passed. Build used only loopback/dummy public
configuration, not staging. No browser or actual Supabase session tests were run
in 8D; no application/UI behavior changed. Final `git diff --check` passed.
GitHub Actions results for the updated revision are recorded on existing PR #8.
