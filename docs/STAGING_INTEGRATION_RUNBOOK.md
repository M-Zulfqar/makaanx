# Staging integration runbook — ordered approval gates

14 November 2026 (Asia/Karachi). This is a prepared validation package, not an
approval or execution record. Real integration verified in this milestone: **none**.
Expected owner-supplied staging reference: `ficudncgevvxsxbjscrk`. Six profiles are
owner-reported (1 admin, 1 landlord, 4 tenants); helper/policy existence is observed,
but matched effective app access remains unresolved. Do not assume absent migration.

## 1. Minimum read-only collection — owner execution guide

No keys/tokens in chat. Use an existing approved runtime/account and SQL editor
for the intended project, verify project selection privately, and record build
commit/environment scope. Do not deploy/rebuild just to run this guide.

1. Same failing existing admin sign-in: run unchanged `/auth/diagnostics`, retain
   only its five fields from browser **and** server. No JWT, subject/email, cookies,
   key or private path. Compare expected project reference, verified API role,
   helper result, exact accessible count and bounded codes. Correct environment/
   session mismatch first; SQL-owner counts do not emulate a browser JWT.
2. Run **only** `supabase/preflight_integration_minimum_readonly.sql` after checking
   the intended project. One READ ONLY transaction: relation/RLS/FORCE, columns,
   all policies, indexes/FKs/triggers, existing RPC definitions/ownership/EXECUTE,
   effective column permissions, private bucket configuration, publication tables
   and aggregate role counts. No message/profile identities or object payloads.
   Review metadata output privately before sharing; never attach credentials or
   private constants if an existing custom function embeds them.
3. If browser helper=true/count=1, inspect actual SELECT/ALL policy applicability,
   permissive/restrictive composition, helper exact definition/overloads, schema/
   relation and inherited grants. If helper=false, resolve stored-role/session/
   exact helper behavior. If count=6 but directory=1, inspect deployed query/build/
   cache/paging. Do not add another policy or service-role bypass as a guess.
4. Only if needed, targeted follow-ups: `admin_visibility_minimum_readonly.sql`,
   `preflight_rental_integrity_readonly.sql`, `preflight_identity_v1_readonly.sql`.
   Their baseline and privacy instructions apply. Avoid duplicated full exports.
   Historical messaging data preflight compares sender to c.user_id (legacy own
   row design), so it is not a two-party participant authorization verdict.

These scripts are PREPARED, not run here. Owner-editor metadata privileges differ
from authenticated runtime authorization. Do not paste private rows/documents.

## 2. Reconcile dependencies before selecting any SQL

| Gate | Evidence required | Conditional change only after approval |
| --- | --- | --- |
| Profile security/admin visibility | Effective role/status/path INSERT/UPDATE denied; trusted helper/session/policies actually match | Minimal evidence-based repair, not blind admin-policy reapplication |
| Rentals | All role SELECT/DML policies, effective grants, exact unique indexes and predicates, FK actions, transition writers | Missing pair indexes only if no equivalent; focused FK/transition repair from actual baseline |
| Identity | Private bucket + namespace, exact legacy overloads/audit tables, v1 prerequisites, retention and cleanup | Choose one reconciled v1 path; preserve historical audit; no broad admin object SELECT |
| Messaging | Actual columns/UUID/timestamp contract, participant history, duplicate pairs, all policies/grants/RPCs, non-destructive FKs | Choose reconciled v1 upgrade; historical v2 cascade/zero-row assumptions not a deployment plan |
| Notifications | Existing tables/workflows, event ownership, unique source keys | Focused new-message-only v1 foundation if absent; no guessed shadow workflow |
| Reports | Confirm actual existing reports schema and admin helper prerequisites | Separate reviewed property-reports proposal only when genuinely missing |

Required order: establish protected roles and matched admin access → validate
rental grants/unique/FK/status integrity → choose identity and messaging contracts
independently from exact baseline → approve/test required proposals on a disposable
clone → approve deployment-specific release gates. Never concatenate all files in
supabase/migrations or run blanket db push. Identity submissions remain source-
gated; review EXECUTE/viewer absent. Messaging marker is compatibility only, not
proof of authorization; Realtime remains source-disabled. None is released here.

Before approved SQL: reviewed baseline ACL/policy/function snapshots, restorable
backup, locks/downtime schedule, migration diff and rollback limitations. No backup
or customer export goes in Git. Unknown existing objects/policies cause stop and
reconciliation. No deletion/backfill of history, duplicate constraint/index,
participant reassignment or silent property-ownership propagation is authorized.

## 3. Real acceptance matrix — NOT RUN

Use existing normal sessions for read-only runtime comparisons. Connected DML,
rollback transactions, fixtures, accounts, object uploads and migrations all need
separate explicit approval. Use synthetic records/documents in an approved clone.

| Area | Required real assertions |
| --- | --- |
| Admin | Existing intended admin sees authorized six only after matched runtime diagnosis; tenant/landlord own scope; anonymous denied; direct protected writes denied. |
| Property/application/favorite | Own/unrelated/anon boundaries through direct API; forged owner/sender keys denied; exact duplicate pair conflict under simultaneous inserts; no duplicate constraints; FK delete races preserve application/history; pending-only transitions cannot be bypassed. |
| Identity | Reserved own private upload only; no public/anonymous/other-user read; byte/type/size validation, unknown-result recovery, stale/version/self-review denial, delivery evidence, atomic audit fault injection, trusted broker and cleanup/retention. Milestone 5 guide remains authoritative. |
| Conversation start | Stored tenant + eligible vacant owner only; no self/unrelated context; simultaneous same property/tenant returns one row; property ownership changes preserve history and conflict rather than expose it. |
| Message reads/writes | Two participants only; unrelated tenant AND landlord/anon cannot select or invoke send; forged sender/recipient/created_at/direct INSERT denied; role metadata cannot authorize; body blank/null/oversize/bytes denied. |
| Retry/concurrency | Same nonce/body/chat concurrent sends yield one message and one recipient event; nonce with changed chat/body rejected; lost response retried same nonce; no duplicate event; actor-wide 11th new send/start in minute denied. Independent actors continue. |
| Atomic failure | Approved isolated fault: reject request-map or notification insert after message INSERT; confirm message, request map and last activity all roll back. Remove injected fault after test. No false UI sent state. |
| History/cursors | >60 synthetic messages including equal timestamps; newest 30, older disjoint pages, UUID tie-break, full microseconds, no skipped/duplicated rows; concurrent send after read watermark remains unread; stale mark never regresses cursor. |
| Notifications | One event per confirmed v1 message, intended recipient only; no body/private paths; foreign mark cannot succeed; own mark idempotent; unread count errors unavailable; no client create/retarget/delete/reset-read. Other event kinds remain disabled. |
| Realtime | Publication configuration reviewed separately; authorized one-chat INSERT only; no unrelated/anon events; logout/account switch/nav removes listeners; reconnect refetch; no unrestricted table stream or DELETE old-image leakage. Do not enable before passing. |
| Retention/rollback | Approved history/erasure policy, dedupe retention does not reopen retries, owner-only cleanup plan; RPC off-switch preserves rows/events/uniqueness; no automatic broad privilege restoration or CASCADE. |

True PostgreSQL transaction/concurrency/role behavior cannot be proven by fixture
HTTP handlers. For race tests use two independent authenticated sessions; for
failure injection use a separately approved disposable owner session, then verify
through normal participant sessions. Capture aggregate counts/outcomes/codes only.
No real SQL/DML acceptance case in this table ran in this session.

## 4. Explicitly gated disposable REST harness

`npm run test:integration` always prints a plan and exits before network access.
It needs no credentials and creates nothing. Unit tests verify this default and
that a CLI execute flag alone still fails closed.

Only after explicit owner approval of the disposable target and synthetic
fixtures, the harness supports a **subset** of the matrix: normal role checks,
property-context start/deduplication, derived-sender/idempotent send, altered nonce
rejection, unrelated reads/sends, direct sender spoof, recipient mark-read and a
bounded conversation acknowledgment. It does not run SQL/migrations or create
accounts/properties; the owner must pre-provision approved fictional fixtures.
It retains resulting records; no automatic cleanup or claim of full acceptance.

Required secret/environment variable **names**, never values in chat or Git:

- MAKAANX_TEST_SUPABASE_URL, MAKAANX_DISPOSABLE_PROJECT_REF (matching HTTPS Supabase
  host, exact 20-character reference; known staging reference explicitly rejected).
- MAKAANX_TEST_PUBLIC_KEY; MAKAANX_TEST_TENANT_TOKEN, MAKAANX_TEST_LANDLORD_TOKEN,
  MAKAANX_TEST_OTHER_TENANT_TOKEN, MAKAANX_TEST_OTHER_LANDLORD_TOKEN (four distinct
  existing fictional accounts, checked against own stored roles).
- MAKAANX_TEST_PROPERTY_ID (existing vacant synthetic property owned by that landlord).
- MAKAANX_INTEGRATION_TARGET=disposable and
  MAKAANX_INTEGRATION_APPROVAL=OWNER_APPROVED_DISPOSABLE_SYNTHETIC_WRITES.

Then `npm run test:integration -- --execute-approved`. The flags attest existing
approval; setting them does not obtain approval or authorize a real staging run.
Target naming is an operator guard, not proof the project is disposable. Independently
verify target/account/data isolation first. Use a secret manager or untracked
local environment file; do not pass tokens on the command line. Harness logs only
case names and a generic failure; never response bodies, refs/IDs, tokens or contents.
Mutating mode was **NOT RUN** here. Identity/data writes outside this subset remain
unauthorized. Tests within rolled-back SQL transactions are writes too.

## 5. Readiness handoff

Exact local/unit/browser/audit/build results are in IMPLEMENTATION_PLAN.md and the
stacked PR; GitHub CI result is recorded on that PR. Tests use isolated localhost
fake sessions and synthetic in-memory event state only. No real PostgreSQL,
Supabase storage/publication, six-profile admin access or multi-account staging
behavior is certified. Preserve all existing draft PRs and review/approve concrete
baseline-specific database changes before any merge or deployment.

## Milestone 7 update — isolated PostgreSQL evidence

See BACKEND_INTEGRATION_AUDIT.md, DATABASE_MIGRATION_DEPENDENCIES.md,
LOCAL_DATABASE_TESTING.md, ADMIN_VISIBILITY_DIAGNOSIS.md and
RELEASE_CONSOLIDATION_PLAN.md. Real local PostgreSQL RLS/grant/transaction/lock
tests now execute on a synthetic Docker baseline. They do not change this
runbook's **no live staging verification** statement or authorize connected
mutations. Do not replace Supabase Auth/Storage/Realtime acceptance with the local
metadata adapters. The new conditional rental authorization proposal refuses
existing unknown policies; obtain the actual minimal replacement diff first.
