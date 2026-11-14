# 8F — PostgreSQL 17 / managed EXECUTE reconciliation

15 November 2026, Asia/Karachi. Starting review da0100b, existing draft PR #8.
**NO-GO for staging execution.** Copilot's approved read-only findings are supplied
by the owner, not independently retrieved here. No live connection/SQL occurred.
A summary of the older 45075b2 preflight is not the complete da0100b/8F evidence.

## Guard-by-guard reconciliation

| Guard/prerequisite | Supplied actual staging evidence | Status | Security consequence / required action |
| --- | --- | --- | --- |
| PostgreSQL engine | 17.11 | MATCH after local 17.11 validation | Plain PG is not full Supabase/PostgREST certification. |
| Migration actor postgres | Not stated | UNKNOWN | Must run approved batch as reviewed postgres owner; current_user check in full preflight. |
| Profiles owner postgres, ordinary relation | Confirmed owner, no inheritance/partitioning | MATCH; relkind detail not supplied | Full preflight must confirm relkind r. |
| RLS on / FORCE off | Confirmed | MATCH | Required to avoid recursion in postgres-owned helper. |
| public/auth schema owners and effective CREATE | Not supplied | UNKNOWN | Confirm trusted owners and no client CREATE in either schema. |
| UUID non-null id + single-column PK | Not supplied | UNKNOWN | Full preflight must verify exact types/PK. |
| TEXT non-null role | Not supplied | UNKNOWN | Enum/varchar drift aborts; do not cast or weaken automatically. |
| Protected six columns present | Not supplied | UNKNOWN | Full live inventory must match. |
| full_name/status/cnic_path TEXT, not generated | Not supplied | UNKNOWN | New explicit projection contract requires exact types. |
| profiles_select_own + profiles_update_own | Names confirmed | PARTIAL | Exact roles/permissiveness/predicates/check expression and absence of other policies still unknown; names alone do not pass guards. |
| Admin SELECT policy absent | Confirmed | MATCH | Keep own-only table policies; never add a broad policy. |
| Three administrator function names/overloads absent | Confirmed absent | MATCH reported | Current global inventory still needs revision/snapshot confirmation. |
| anon/auth privileged parents absent | Confirmed | PARTIAL | Direct superuser/BYPASSRLS/CREATEROLE flags, schema grants and pg_maintain effective privilege still need evidence. |
| Authenticated USAGE/table SELECT | Earlier owner report | PARTIAL | Reconfirm current effective grants, not merely direct ACLs. |
| No unsafe table/column grants; only optional own full_name/phone UPDATE | Protected restrictions reported previously, full ACL not supplied | PARTIAL | Full preflight, including PG17 MAINTAIN; reject drift. |
| Six profile aggregate 1/1/4 | Confirmed | MATCH | Aggregate does not prove which signed-in subject is admin; no identity query requested. |
| No other routine references admin interface names | Not supplied | UNKNOWN | Narrow metadata inventory and owner-private semantic review. |
| Function default EXECUTE service_role | Confirmed present | MISMATCH with old revocation pattern | Targeted object revocation fixes the known case locally; global/schema source remains unknown. |
| Exact default grantor/scope/grant option/other recipients | Not supplied | UNKNOWN | Supplemental query separates builtin reference, global override, public addition, creator and grantor. Unknown recipient still aborts. |
| service_role effective inheritance/SET reachability | Not supplied | UNKNOWN | Must not retain EXECUTE via authenticated/postgres membership. Effective/member checks abort, including NOINHERIT membership. |
| Existing CNIC SECURITY DEFINER | public.makaanx_submit_cnic(text) confirmed | PARTIAL | Metadata is not live body proof; owner-private review below. No modification authorized. |
| Auth signup writer | auth.users trigger calls handle_new_user() | PARTIAL | Exact schema/body/owner/ACL/path and any other triggers/writers remain unknown. |
| auth.uid() trusted own-JWT semantics | Not supplied | UNKNOWN | Inspect exact zero-arg function privately; local adapter is not JWT validation. |
| Event triggers / dynamic dependencies | Not supplied | UNKNOWN | Inventory metadata; privately review flagged definitions before approval. |
| Backup, maintenance window, app revision/config and cache/exposure | Not supplied | UNKNOWN | Required before separate execution/release approval. |

## Exact cause and scope of the ACL discrepancy

Built-in function defaults are owner EXECUTE plus PUBLIC EXECUTE. They cannot
name a project-specific service_role. A postgres global function default ACL,
when present, overrides the built-in baseline; an IN SCHEMA public ACL adds grants.
Defaults FOR the actual creator postgres apply at CREATE FUNCTION, not defaults
for inherited roles. The copied grants materialize in the new object's proacl.
Changing/revoking a default later does not revoke an existing object's grant.
Explicit grants on existing objects and role inheritance are separate mechanisms.

The owner confirms a managed default with service_role, but the actual rows,
scope, grantor, grant option and memberships were not supplied. **Its exact live
origin is UNKNOWN** until the supplemental read-only query is reviewed. No live
object propagation can be observed yet because the three RPCs are absent; local
PG17.11 tests demonstrate propagation from both global and schema defaults and
the failure in the old grant pattern. Do not report that either live scope was
confirmed by those tests.

The old migration revoked PUBLIC/anon/authenticated only, then allowed only
postgres/authenticated ACL recipients. A default service_role object grant survived
and the strict postcondition aborted the whole batch. That was safe refusal, not
an authorization bypass or a reason to whitelist service_role as an executor.

## Corrected privilege contract

After creating all three new functions, conditionally REVOKE ALL from service_role
on **only those exact signatures**. Role absence is supported. Existing PUBLIC/
anon/authenticated cleanup and non-grantable authenticated EXECUTE remain. Final
ACL allowlist remains only postgres/authenticated; any unknown recipient or grant
option still aborts. service_role effective EXECUTE or reachable authenticated/
postgres membership also aborts: direct REVOKE cannot remove an inherited grant
or block SET ROLE. Rollback requires this same strict contract and refuses drift.

No database-wide ALTER DEFAULT PRIVILEGES appears in the repair/rollback. It is
used only in disposable tests. No existing function, Storage policy, profile grant
or profile policy changes. The transaction does not expose interim default grants
before COMMIT. Superuser privileges cannot be revoked via object ACLs; this is a
trusted-owner boundary, not a claim to restrict postgres itself.

Application call-site review: only verified user-session clients call these three
RPCs in lib/admin/profiles.ts and lib/diagnostics/admin-access.ts. No service-role
client is required or present in those workflows. Targeted denial therefore does
not affect the repository's directory/queue/analytics/labels/diagnostics. External
jobs or consumers are UNKNOWN; owner must attest they do not depend on these
previously absent functions. Existing managed function grants remain untouched.

## Existing routine review — repository evidence versus live unknowns

- `20261101_staging_auth_phase2.sql` handle_new_user: qualified profiles INSERT,
  empty path; metadata role allowlist tenant/landlord, otherwise tenant. No admin
  provisioning from user metadata; no protected score/status/path metadata copied.
  Revoke PUBLIC/anon/authenticated direct EXECUTE; trigger invokes it. Earlier
  `20261025_milestone_1_2_auth_foundation.sql` has a similar safe_role allowlist and
  fixed pending/null defaults. Exact live version is not proved by trigger name.
- Repository `makaanx_submit_cnic(text)` in that foundation proposal: SECURITY
  DEFINER/empty path, auth.uid required, own UUID path regex + storage.objects
  existence, updates own path/status/score only if not verified. It never assigns
  role and does not reference the new helper. It is an existing alternate protected
  column writer, not governed by ordinary table UPDATE grants. NULL path handling
  and replacement/rejection semantics require separate live identity review; no
  unrelated CNIC change or execution occurs here. No document is fetched.
- `auth.uid()` has no authoritative deployed definition in the repository. Focused
  tests use fixed SESSION_USER UUID mapping only, not a JWT verifier. Live owner,
  body/path/ACL and issuer/subject semantics remain BLOCKED.
- Historical/proposed rental/identity/messaging files may reference the helper.
  Their presence in Git is not deployment evidence. New function-name reference
  guards prevent known routine activation; source flags cannot detect all dynamic
  SQL, event trigger effects or external consumers. A benign-looking hash/name is
  not proof of a safe writer. No unrelated routine is replaced to make guards pass.

`supabase/inspect_admin_dependencies_owner_private_readonly.sql` is an exact,
**separately reviewed owner-private** catalog inspection for named existing
routines and actual auth.users/profiles trigger functions. It may reveal literals;
never export/paste its definitions into chat or Git. Send only hashes and conclusions
about role assignment, own-subject predicates, dynamic references and trust boundaries.
Other flagged writers/event triggers need private definition review separately.

## Test and release boundaries

The fixed image selector permits only pinned 16 or pinned **17.11 amd64 Alpine**;
no arbitrary image/URL input. Containers remain network-none, no published ports,
fixed disposable DB, sanitized routing environment, non-owner/non-bypass actors.
Synthetic service_role is NOLOGIN/NOSUPERUSER/NOBYPASSRLS; tests inspect its grants
as owner and never execute any workflow as service_role. Tests demonstrate both
managed default scopes, existing function/default preservation, grant-option
removal, unknown grantee refusal and effective/inherited execution denial.

PG17 introduces MAINTAIN: repair/rollback/full preflight now check it conditionally
and reject both direct MAINTAIN and pg_maintain membership grants. PG16 takes the
older privilege-list branch. GitHub Actions runs both engine versions as required
matrix jobs, no continue-on-error, unique result artifacts with exact SQL hashes.
Generic domain regression tests exercise other historical proposals locally;
focused repair tests alone certify the new own-only-table/projection contract.

Run current full preflight plus supplemental metadata query after review; do not
infer missing guard results from the older preflight. No script creates a probe
object live. Postflight confirms exact object ACLs and effective service denial,
source hashes, own-only policies and separate real-session acceptance. Guard
failure means ROLLBACK/close and investigate; never weaken a guard, CASCADE, change
global defaults or reapply all migration files. Backup/window and exact revision/
SHA256 files are required. Existing 8E transaction/lock/recovery boundaries apply.

### Executed 8F validation

- PostgreSQL **17.11** pinned amd64 Alpine: **48 focused checks + 35 domain
  regression checks passed**. Includes both managed default ACL scopes, role-absent
  installation, effective EXECUTE/SET membership, MAINTAIN/pg_maintain, privacy,
  authorization, filters/pages and atomic migration/rollback.
- PostgreSQL **16.16** pinned image: **46 focused + 35 domain regression checks
  passed** (the two PG17-only MAINTAIN cases are conditional).
- **224 unit tests / 27 files passed**; zero-warning lint, typecheck, loopback/dummy
  production build and diff check passed.
- **118 local production browser checks passed**: general 22, admin 22, identity
  42, messaging 32. Synthetic loopback fixtures only, no actual Supabase/JWT claim.
- Initial image pull/setup was interrupted by local Docker disk pressure; removed
  only regenerable task caches and reran sequentially to completion. A new test
  environment typing error (missing NODE_ENV) was corrected; final build/typecheck
  passed. No unresolved local failure. Earlier interrupted logs are not final evidence.
- Both SQL/private-inspection scripts were syntax/execution checked only against
  synthetic local catalogs; no live bodies or private values were obtained.
- Final commit and actual GitHub Actions matrix results are recorded in PR #8.

## Exact 8F changed-file manifest

- `.github/workflows/quality.yml`
- `docs/ADMIN_ACCESS_FINAL_APPROVAL.md`
- `docs/ADMIN_PG17_COMPATIBILITY.md`
- `docs/IMPLEMENTATION_PLAN.md`
- `docs/PROJECT_AUDIT.md`
- `scripts/local-db/admin-repair.cjs`
- `scripts/local-db/docker.cjs`
- `supabase/inspect_admin_dependencies_owner_private_readonly.sql`
- `supabase/migrations/20261115_admin_visibility_minimum_proposed.sql`
- `supabase/preflight_admin_pg17_acl_readonly.sql`
- `supabase/preflight_admin_visibility_minimum_readonly.sql`
- `supabase/rollback_admin_visibility_minimum_proposed.sql`
- `supabase/verify_admin_visibility_minimum_readonly.sql`
- `tests/local-db-guards.test.ts`
