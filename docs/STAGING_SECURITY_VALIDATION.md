# Ordered staging security validation

14 November 2026 (Asia/Karachi). Expected project: `ficudncgevvxsxbjscrk`.
This is a validation plan, not evidence of execution. No SQL or real-session
staging tests were run by this milestone. Do not run the migrations directory as
a batch. An existing file, index name or helper is not proof of its behavior.

## 0. Establish the intended runtime and evidence record

Record the selected project reference, running build/commit, environment scope,
role category, date/time and aggregate outcome/error code. Do not export browser
storage, JWTs, cookies, credentials, CNIC paths, document contents or user lists.
Next embeds public variables at build time: changing a runtime setting does not
repair an already-built bundle. A deployment/rebuild still needs owner approval.
Use existing owner-approved accounts; do not create users as part of this guide.

The local HTTP fixture's synthetic sessions are explicitly not real Supabase
sessions and cannot validate staging RLS. Read-only inventory and real-session
reads precede every schema decision. Any data-changing test, including one inside
BEGIN/ROLLBACK, requires explicit approval for that test database and fixture.

## 1. Resolve the administrator visibility evidence gap first

Known owner observations: six profiles, one admin/one landlord/four tenants;
postgres-owned SECURITY DEFINER `makaanx_is_admin()` with authenticated EXECUTE,
no anon EXECUTE; protected profile columns and an admin SELECT policy. An app
session still saw one row. Do not assume the policy is missing.

Minimum new evidence, collected from the same failing build/sign-in:

1. Existing `/auth/diagnostics` browser and server results: only project reference,
   verified JWT/API role, admin RPC boolean, exact accessible count and error codes.
2. `supabase/admin_visibility_minimum_readonly.sql`: profile relation/RLS/FORCE
   settings; all SELECT/ALL policies with permissive/restrictive, TO roles and
   exact predicates; helper signatures/definition/owner/settings/EXECUTE; trusted
   aggregate baseline grouped by role. No identity rows or private paths needed.
3. Record whether the directory on that same build still differs from the exact
   diagnostic count. It currently queries without an own-ID filter and caps at 100.

Interpret in order:

- Wrong project or browser/server mismatch → investigate build/environment and
  normal cookie/session lifecycle. Do not paste tokens or forge claims.
- Correct project but helper false → inspect the exact helper's predicate,
  overloads and session/account role context. Role/profile metadata supplied by
  the user is never an authorization source.
- Helper true with one accessible row → inspect applicability of the SELECT
  policy, restrictive policies, relation kind, schema and helper execution context.
  A correctly applicable permissive helper predicate without restrictive exclusions
  should admit all six in the same context; do not add a duplicate policy to mask
  contradictory evidence.
- Diagnostic count six but page one → inspect running query/UI/cache/build.
- Any error code → investigate that operation; unavailable is not zero.

SQL-editor postgres counts establish a privileged aggregate baseline, not the
browser JWT's authorization. Existing diagnostic privacy protections stay intact.
`ADMIN_ACCESS_DIAGNOSTICS.md` contains the detailed matrix and limitations.

**Gate:** administrator pages continue to label accessible coverage unverified.
Do not enable report/moderation decisions or claim platform totals from a true
helper, a successful query, an environment flag, or an observed count alone.

## 2. Inventory rental RLS, effective grants and existing schema

Use `supabase/preflight_core_rental_readonly.sql`, then
`supabase/preflight_rental_integrity_readonly.sql`. Inspect types/defaults/nullability,
all policies including ALL/restrictive policies, PUBLIC/inherited table and column
privileges, actual FK actions, indexes and noninternal transition triggers.

Confirm profile.role remains unmodifiable; anonymous cannot mutate rental/private
records; owners cannot reassign protected IDs/owner keys; applications can only
be created for the authenticated tenant with pending status; landlord decisions
are scoped to properties they own and cannot rewrite tenant/property keys.
Favorites must be own-user SELECT/INSERT/DELETE only. Verify the API page cap and
count support; no RLS denial is fixed by disabling RLS or using service credentials.

**Gate:** repository policy proposals and mock ownership tests do not certify
these deployed boundaries. Current administration remains read-only.

## 3. Verify uniqueness before considering the integrity proposal

Review actual valid/ready unique indexes and constraints, including column sets,
partial predicates, expression indexes and nullable keys. Require the intended
all-history `(property_id, tenant_id)` application invariant and
`(user_id, property_id)` favorite invariant; a partial pending-only index is not
equivalent. If future reapplication is intended, settle that product rule before
changing this invariant. Do not create redundant constraints with another name.

The trusted-owner aggregate preflight must show no duplicate groups or null keys.
If equivalent constraints exist, skip
`20261114_core_rental_integrity_proposed.sql`. If absent, review and explicitly
approve only that proposal after backup and scheduling its index-lock window.
Never auto-delete duplicates. The proposal aborts on nullable keys, duplicates or
conflicting index names; it does not change rows, RLS or grants.

After explicit approval for writes to approved fixtures, two simultaneous identical
submissions must yield one row and a duplicate conflict; different pairs must be
independent. Client prechecks and handled 23505 mock responses do not prove a real
index exists. Its documented rollback removes only newly created indexes and
reopens duplicate races; preserve all pre-existing constraints.

## 4. Verify FK delete actions and rental history preservation

Inspect every applications→properties, favorites→properties and relevant auth/profile
reference: target columns, NO ACTION/RESTRICT/CASCADE/SET NULL, deferrability and
visibility policies. The app's visible-application precheck cannot prevent a race
or detect rows hidden by a restrictive policy. CASCADE could erase history even
if RLS hides it. Do not describe that precheck as an atomic preservation guarantee.

After approval, test an owned delete with existing history, an unrelated delete,
and concurrent application/delete against approved fixtures. History must survive;
rejected writes must report failure/zero rows accurately. If FK rules do not meet
the retention requirement, prepare a focused FK or atomic-operation proposal from
the actual baseline, with rollback and retention review. Do not guess FK names or
alter/delete existing history in an autonomous repair.

## 5. Verify application transition integrity through the direct API

The app already allows pending→approved/rejected and compares pending in UPDATE.
Check deployed grants, policies and triggers/RPCs independently: settled states
must not be rewritten, tenant/property IDs immutable, tenants cannot decide,
unrelated landlords cannot decide, and rejected concurrent/stale writes must not
claim success. A status-only column grant does not itself enforce transitions.

If database enforcement is absent, stop that release gate and prepare one minimal
reviewed trigger or RPC proposal from the observed schema; do not stack historical
security bundles blindly. Approval does not automatically create a tenancy or
exclusive occupancy. No such write test was executed here.

## 6. Execute the role-isolation matrix only in approved contexts

| Role | Read expectation | Writes to test only after approval |
| --- | --- | --- |
| Anonymous | Approved public listing fields only; no profiles/private reports/audit/identity data. Admin routes denied. | All private/rental mutations denied. |
| Tenant A/B | Own profile, applications and favorites; public listings; no other tenant's private records. | Own pending application/favorite only; no role/owner/status escalation. |
| Landlord A/unrelated landlord | Own portfolio and incoming applications where authorized; not other owners' private data. | Own listing fields and allowed pending decisions only; no tenant/property reassignment. |
| Administrator | Own-profile role authorizes UI; every table remains subject to existing RLS. Platform coverage must be separately verified. | Moderation/report decisions remain disabled in this milestone; no direct privileged writes granted. |

Use existing accounts in separate normal sessions. Check direct API boundaries as
well as pages. Record permitted counts/statuses and machine errors only, without
copying private record payloads. A read-only test is not a write-authorization test.

## 7. Review reports readiness and migration dependencies

`supabase/preflight_admin_management_readonly.sql` checks for `reports`,
`property_reports`, `property_report_events` and related helper/policies. None is
confirmed by repository/runtime evidence available here. If any existing object
is found, reconcile it before proposing new tables; do not create a shadow workflow.

Only after the admin helper/session problem and role-lockdown gates are resolved,
review `20261114_property_reports_proposed.sql`:

- Dedicated property reports, restricted categories/text length/statuses, indexed
  queue/owner/property reads, FK RESTRICT history rules and no attachments.
- Own reports readable by their reporter; admin reads use the existing reviewed
  helper. Inserts limited to authenticated tenant/landlord roles, existing visible
  property and default own reporter/open status. Only three insert columns granted.
- Atomic creation audit via a trusted SECURITY DEFINER trigger with empty search
  path; function/sequence/audit writes revoked from client roles. Audit events are
  admin-readable only. No authenticated UPDATE/DELETE or moderation RPC exists.
- This is creation audit only, not an implemented adjudication audit. Future
  triage/resolution needs its own atomic reason/status/audit design and tests.

No SQL is executed by the application. The reports page remains unavailable until
schema, permissions, retention and the API contract are verified and implemented.
Even applying this proposal does not automatically enable a reporting UI.

Reports proposal acceptance tests (not run; require explicit approved writes):
anon/non-owner denial; default authenticated reporter cannot be spoofed; invalid
category/blank/oversized summary denied; successful insert creates exactly one
creation event; audit failure rolls back the report; clients cannot write audit or
change status; tenant sees own only; admin reads only after helper verified; no
private document paths exist in the schema. FK history restrictions must hold.

Rollback uses `rollback_property_reports_proposed.sql` only for the exact newly
created objects and only when both tables are empty. If data exists, it aborts:
preserve reports/audit history and prepare roll-forward or a separately approved
retention plan. Never CASCADE away unknown dependencies or erase audit history.

## 8. Avoid conflicting migrations and preserve a reviewable release record

Order decisions by evidence: role-lockdown → verified admin helper/session/policy
behavior → rental constraints/grants/transitions/history → conditional missing
uniqueness indexes → reports schema/creation audit → future moderation RPC.
Older identity-review proposals have different policy names, audit designs and
RPC overloads; choose a reviewed path, do not concatenate them. CNIC read policies
are broader privileges and are explicitly outside this milestone.

Before any approved change, record exact baseline objects, backup/restore plan,
expected locks, test fixtures and rollback limits. Stop on conflicts or missing
prerequisites; do not merge/deploy or run a migration to make tests green.

Local lint/typecheck/build/unit/browser/CI results are recorded in the implementation
plan and PR. Verified real staging remains **none in this milestone**. Admin runtime,
rental direct-API, transition/history and report schema gates remain outstanding.

## 9. Milestone 5 identity workflow gates (not executed)

Read `IDENTITY_VERIFICATION_MILESTONE.md` first. Its v1 proposal supersedes the
recommendation in the three historical 20261026/20261112 review proposals; it does
not establish what is deployed or grant a migration approval. Current uploads,
review decisions and private document viewing are disabled in application code.

Order:

1. Preserve the existing `/auth/diagnostics` and pair its five fields from the
   same failing browser/server session with `admin_visibility_minimum_readonly.sql`.
   Project must match `ficudncgevvxsxbjscrk`; resolve environment/session/helper/
   policy/query discrepancies before claiming global queue coverage. Metadata
   helper/policy existence is not effective authorization evidence.
2. Review `preflight_identity_v1_readonly.sql` metadata: all overload definitions,
   ownership/EXECUTE and effective inherited/PUBLIC grants, profile/status types,
   triggers/constraints, schema CREATE privileges, bucket privacy/MIME/size limits,
   object owner_id/metadata contract, all storage policies and audit tables. No
   profile identities or document names/bytes are selected by the script. It is
   prepared, not executed in this session.
3. Capture exact baseline ACL/policies and trusted restore plan; reconcile unknown
   policies/functions rather than replacing or stacking them. The v1 proposal's
   `REVIEW_REQUIRED` policy fingerprint deliberately aborts until reviewed/pinned;
   nonallowlisted storage policies also abort. Other bucket workflows must survive.
   Keep existing audit tables/history. No bulk legacy-document backfill is approved.
4. Only after explicit migration/test approval, validate on an isolated clone with
   synthetic documents and fictional accounts. Existing real-session read checks
   do not authorize creating test users or writing dummy staging records. No SQL
   or DML (even rolled back) is authorized by this checklist itself.
5. Keep application upload gate closed until reservation/schema/storage tests,
   retention/cleanup worker and byte-validation decision pass. Keep review EXECUTE
   ungranted and viewer UI absent until a narrow document broker/access-audit
   design is implemented, approved and tested. No blanket admin storage SELECT,
   browser signed URLs or service-role bypass.

### Required post-approval database and storage acceptance tests — NOT RUN

| Case | Required result/evidence |
| --- | --- |
| Anonymous/tenant/landlord/admin submission | Anonymous denied; only stored tenant/landlord may reserve own; metadata-forged admin/role cannot authorize. Admin cannot submit. |
| Direct grants and malicious alternate RPC | Role/status/trust/path writes denied through REST, all old submission/review overloads client-revoked, unknown privileged writers reconciled. |
| Types/count/size/content | Null/invalid inputs rejected; one reserved path; bucket enforces private MIME/size. Signature/content spoofing requires approved trusted validation, not client-header trust. |
| Namespace/owner | Tenant A cannot upload/list/download/overwrite/delete tenant B's object even with guessed path; same for landlord and anonymous. Only reserved own path accepts INSERT; expired/unreserved path denied. |
| Duplicate/expired/begin retry | Concurrent identical begin produces one active row/path; same content resumes; differing content conflicts; expired reservation blocks new upload until cleanup. Settled/legacy reference cannot be overwritten. |
| Upload failure and unknown result | No object implies finalize failure; committed upload/response loss resumes same path; committed finalize/response loss resumes pending without new upload or duplicate submission. |
| Finalize integrity | Own profile and request must match; object exists/owner/type/size correct; pending link/version atomic. Wrong actor, missing object, stale state or replaced reference denied. |
| Review input/NULLs | JSON null/wrong type/missing or unknown keys, invalid UUID/version/decision/oversized notes and short rejection reason denied with sanitized machine errors. |
| Review authorization | Anonymous, tenant, landlord, forged metadata and self-review denied. Even admin cannot call while EXECUTE ungranted; no direct table/audit writes. |
| View evidence | No broker grant supplied; clients cannot insert delivery evidence. After separate broker approval, require current pending request, same actor/version, successful delivery and age ≤10 minutes. Missing/expired/future/wrong-version evidence denied. |
| Pending-only/stale/duplicate decisions | Only linked eligible pending request transitions. Expected version exact; two concurrent reviews yield one committed decision and event; settled retry is stale and does not create another event. |
| Atomicity fault injection | With approved isolated owner fixture, force audit insertion failure: profile status and request/version remain unchanged. Forced profile/request write failures also leave no audit. Remove injected fault after test. |
| Missing/deleted/wrong-owner object | Both approval and rejection fail; no reference/path returned. Recovery requires approved workflow, not status manipulation. |
| Immutability and retention | Clients cannot edit/delete review/access audit or request rows. FK RESTRICT preserves history; account erasure needs reviewed retention plan. |
| Broker/viewer (future) | One current authorized request only; cookie-auth admin/no self, CSRF protection, rate limit, no bulk/listing, no-store/nosniff headers, no path/URL/log leakage, internal URL TTL ≤60s if used. |
| Cleanup (future) | Reserved expired unlinked only; Storage API deletion, no storage SQL DELETE, locks/fencing against finalize and delayed uploads, idempotent recovery after partial failure, audit kept. Pending/settled never auto-deleted. |
| Rollback/off-switch | Disable UI; revoke v1 RPC and insert access; all rows/objects/history retained. No broad legacy policy restoration or CASCADE. |

Record aggregate outcomes and bounded machine codes only. Do not export actual
objects, raw object paths, tokens, hashes, reviewer notes or private payloads into
GitHub artifacts. Supabase owner-editor execution is not a substitute for real
JWT/RLS/storage-role tests. Unit doubles and localhost synthetic sessions do not
prove these cases. Keep failed/unrun cases as release blockers.
