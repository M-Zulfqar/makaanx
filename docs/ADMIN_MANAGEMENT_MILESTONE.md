# Milestone 4 — Administration and staging readiness

Date: 14 November 2026 (Asia/Karachi).
Base: `feature/core-rental-workflows` at `28b935bf280d9dd9d30f353147fe61b7df1e47ac`.
Branch: `feature/admin-management`; a separate stacked draft PR targets that base
branch. PRs #2 and #3 remain draft/unmerged; main and deployments are untouched.

## Evidence and implementation boundaries

The owner reports six staging profiles, a protected postgres-owned administrator
helper and an existing admin SELECT policy, yet an app session saw one profile.
This milestone does not assume a missing policy and does not change profile RLS,
the helper, auth cookies, the proxy or `/auth/diagnostics`. No real staging access
was configured and no SQL was executed. See `STAGING_SECURITY_VALIDATION.md` for
the ordered minimum-evidence/validation plan.

Existing property/application/profile columns are reused. The repository contained
no reports table/migration/API, and no deployed reports contract has been confirmed.
A missing repository schema is not proof that a live database table is absent.
Accordingly the reports page does not query a guessed table or show a fake queue.

## Completion matrix

| Feature | Implemented in code | Tested with mocks/fixtures | Verified real staging | Remaining gate |
| --- | --- | --- | --- | --- |
| Server admin authorization | Request-local cookie client, getUser and protected own-profile role; layout and every admin page protected, with guards again in property/analytics readers. User metadata cannot authorize. | Anonymous/tenant/landlord denial, errors fail closed, admin permitted; synthetic browser sessions. | No | Real-session/role-lockdown validation; read access still subject to RLS. |
| `/admin/properties` | Read-only actual permitted property fields, search/city/type/budget/bedroom/status filters, stable sorting and 12-row pagination. No vacant-only or own-owner restriction is added. | Query scopes, escaping, pagination/status preservation, owner restrictions/failure, responsive browser navigation. | No | Actual properties SELECT policies and type/page-limit checks. |
| Owner information | Only `id,full_name` from permitted profile rows; missing or failed lookup does not hide permitted listings or invent an owner. | Hidden owners and allowed names tested; explicit projection drops private sentinel fields. | No | Existing profile RLS may hide every owner. No broader profile policy granted. |
| `/admin/analytics` | Exact per-request accessible counts by profile role/application state and eligible pending verification. Actual timestamp/property-state samples use latest 100 requested records. | Correct zero/unavailable distinction, sample bounds, Karachi date grouping, invalid timestamps, eligibility, error privacy. | No | Platform coverage unverified; samples are not global distributions or complete daily totals. |
| Dashboard/verification queue | Same real counts; pending roles limited to tenant/landlord; submitted count uses exact count rather than the 50-row display length. | Eligibility/limited-list versus exact-count regressions; existing diagnostics tests retained. | No | Admin visibility issue remains unresolved; private document viewing/decisions remain disabled. |
| `/admin/reports` | Honest configuration-pending read-only page; no fabricated reports, count, moderation action or false success. | Missing-interface behavior and no guessed-table requests; unauthorized browsers denied. | No | Confirm existing schema first; then review the separate proposed contract and tests. |
| Navigation/design | Properties, Reports and Analytics restored only because routes exist; shared responsive shadcn/theme/typography retained. Mobile menu closes on navigation. Generic admin avatar replaces stock identity image. | Desktop/mobile route and menu checks with loopback fixtures. | No | None for local UI; no deployment performed. |
| Settings readiness | Fake version/latency/storage/backup values and simulated save/cache/index/log operations removed. Real theme control retained. | No fake backup/save/monitoring messages rendered. | No | No monitoring, backup or privileged account-management integration implemented. |
| Reports database/audit | Proposed migration, preflight, empty-only locked rollback and acceptance plan prepared. No reporting/moderation API enabled. | Application missing-schema/authorization behavior only; SQL not executed. | No | Explicit approval, resolved admin prerequisites, schema reconciliation, retention and real role-isolation/audit tests. |

## Exact counts, restricted coverage and samples

Every administration view says **Accessible data · platform coverage unverified**.
RLS silently restricting rows is not a query error. A true helper, count six or
successful SELECT cannot certify platform-wide access; no environment switch or
fixture result promotes a dataset to verified global coverage. Current code does
not claim to automatically detect restriction versus an actually small dataset.

Metrics use exact HEAD counts for each permitted query. Errors/missing count
metadata render —, not zero. Distinct requests are not a single transactional
snapshot. Verification metrics exclude admin/unknown roles. Submitted requests
filter the existence of a document reference but select only count metadata:
no document path/value, bytes or signed URL is fetched or returned.

Property states and activity use `status,created_at` only, latest 100 requested
with stable ordering. Captions show actual returned sample size and limit. Dates
are grouped in Asia/Karachi; invalid timestamps are excluded from daily groups
and counted separately. The sample may omit records on a displayed day. No
revenue, fraud, AI result, growth percentage or full-platform extrapolation exists.
Dedicated privileged aggregate RPCs are not needed for these scoped metrics and
were not introduced while administrator coverage is unresolved.

## Reports proposal and rollback

Files:

- `supabase/preflight_admin_management_readonly.sql`: checks for existing generic
  and dedicated report tables/policies and helper metadata, without report bodies.
- `supabase/migrations/20261114_property_reports_proposed.sql`: **NOT APPLIED**.
  Aborts on any existing report objects or missing helper/role-lockdown prerequisite.
- `supabase/rollback_property_reports_proposed.sql`: **NOT EXECUTED**. Locks both
  newly created tables before checking emptiness to prevent an insert/drop race;
  aborts if any report/audit data exists; no CASCADE or erasure of unknown history.

The proposal adds property reports and append-only creation events, queue/reporter/
property indexes, FK RESTRICT references and explicit RLS/grants. Only authenticated
tenants/landlords may insert three report fields for an existing visible property;
reporter/open status/id/timestamp come from defaults and cannot be spoofed through
column grants. Own reports are readable by their reporter; verified admin helper
allows admin reads. Audit is admin-readable and client-write-revoked. A trusted
SECURITY DEFINER insert trigger (empty search path, no callable client EXECUTE)
writes creation audit in the same transaction. No CNIC/attachment column exists.

This is **creation auditing only**. No authenticated UPDATE/DELETE or moderation
RPC is granted. Future triage/resolution needs a separately reviewed atomic
status/reason/audit design before any write controls. Applying a schema proposal
does not automatically enable this page's reporting UI. Data retention/privacy,
API abuse controls and authenticated report submission need review before release.
No SQL proposal was executed even against a local PostgreSQL instance; fixture
and application tests must not be presented as migration/RLS execution evidence.

The consolidated guide includes prerequisites, role matrix and post-approval
acceptance tests: spoofing denied, invalid inputs denied, one audit event per
insert, audit failure rolls back the report, unauthorized reads/writes denied,
status/audit client mutation denied and FK history preserved. Existing report
objects must be reconciled first rather than shadowed or modified automatically.

## Minimum administrator diagnosis

Use the unchanged five-field browser/server `/auth/diagnostics` reports from the
same failing session/build, paired with
`supabase/admin_visibility_minimum_readonly.sql`. That script narrows the needed
metadata to relation/RLS/FORCE flags, SELECT/ALL policy applicability, exact helper
signatures/definition/settings/owner/EXECUTE and a trusted aggregate role baseline.
It selects no user identity, JWT, cookie, key or private document path.

Do not treat SQL-editor postgres counts as the app JWT's RLS behavior. Follow the
ordered environment/session/helper/policy/query matrix in the consolidated guide.
No blind admin migration reapplication or private CNIC policy is part of this work.

## Reproduce the isolated demo

1. `MAKAANX_FIXTURE_AUTH=1 MAKAANX_FIXTURE_PORT=54330 node scripts/rental-fixture-server.cjs`.
2. Build/start locally with `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54330` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-build-only` (e.g. app port 3006).
3. Set `MAKAANX_SMOKE_BASE_URL=http://127.0.0.1:3006` and optionally
   `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`.
4. Run existing `MAKAANX_RENTAL_FIXTURES=1 npm run test:browser`, then
   `npm run test:browser:admin`.

Synthetic admin/tenant/landlord session cookies exist only in isolated Playwright
contexts. The fixture trusts unsigned synthetic subjects on loopback only and
simulates the one-visible-profile symptom; it is not a Supabase Auth or RLS emulator.
Application code has no fixture-auth bypass or test-mode authorization switch.
The fixture rejects write methods except the fixed read-only boolean helper RPC.
No real accounts, access tokens, database or private documents are used. Source
projections are honored so private-sentinel fields cannot accidentally be returned.

## Validation and next actions

Exact final command results are in `IMPLEMENTATION_PLAN.md` and the PR. No dependency
was added/updated; only a browser-test script entry was added to package.json.
Production dependency findings remain zero; the existing seven moderate lint-tool
findings remain tracked. Next steps: collect matched runtime evidence, validate
rental permissions/integrity, reconcile/approve only necessary schemas, then pursue
identity review, messaging and release acceptance. No merge or deployment occurred.
