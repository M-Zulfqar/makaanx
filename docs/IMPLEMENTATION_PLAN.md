# MakaanX implementation plan

Date: 13 November 2026 (session client date, Asia/Karachi).
Audit baseline: `05ceed5102b27f1c1b3f5fcf06c91d107bcd4506`.
See `PROJECT_AUDIT.md` for source evidence and the admin-count diagnosis.

## Working rules

Use dedicated milestone branches and PRs targeting `milestone-1-2-authentication`.
Continue reversible code, documentation and local test work autonomously. Never
merge main, deploy, run SQL migrations, create staging test accounts or modify
existing database/storage records without the required explicit approval.
Keep credentials in environment settings; never request secret values in chat.
Do not store CNICs, database dumps or customer exports in Git.

## Milestone 0 — Audit and safe repair (this PR)

- [x] Map architecture, route coverage and live versus demonstration features.
- [x] Trace admin directory and exact count queries to the cookie-bound public client.
- [x] Explain why own-profile RLS permits an admin guard yet hides other users.
- [x] Identify the existing minimal read-access proposal and confirmation procedure.
- [x] Repair logout in tenant, landlord and admin layouts and profile dropdowns.
- [x] Preserve refreshed session cookies on proxy redirects.
- [x] Handle returned password-reset request errors.
- [x] Remove invented administrator alerts, counts and health claims; hide missing-route links.
- [x] Enforce build type checking; add a regression suite and CI test step.
- [x] Add ESLint tooling, repair all 9 errors/review all 14 warnings, and enable zero-warning CI lint.
- [x] Upgrade Zod and its form resolver with runtime/type-level compatibility coverage.
- [x] Prepare privacy-safe browser/server access diagnostics and read-only SQL scripts.
- [ ] Confirm live staging root cause and obtain approval for any needed database repair.

Acceptance: reviewable code, honest validation results and no live data mutation.

## Milestone 1 — Security and administrator read access (P0)

Dependencies: metadata-only staging connection or reviewed outputs, existing test
sessions, explicit migration approval if changes are required.

1. Confirm intended project and current tables, constraints, grants, triggers,
   helper ownership, RLS/FORCE settings, all permissive policies and RPC overloads.
2. Reconcile historical migration proposals into one documented path. Profile
   role/status/trust/path mutations must be denied before using a role-based
   SECURITY DEFINER administrator helper. No service-role workaround in app code.
3. The owner has observed the admin policy/helper already present. First compare
   browser/server diagnostics for the expected project `ficudncgevvxsxbjscrk` and
   inspect exact policy/helper definitions, restrictive policies and session roles.
   Request approval only for a separately reviewed repair confirmed necessary by
   that evidence; do not reapply the profile-read migration on assumption.
4. Test existing six-profile fixture: administrator six; other accounts own row
   only; anonymous zero. Check sensitive-column writes denied and private storage
   unchanged. Record aggregate outcomes without identities or document contents.
5. Audit properties, applications, favorites, payments and participant messaging
   policies for direct-API ownership bypasses. Repair proposals require approval.
6. Upgrade vulnerable dependencies with regression checks; track remaining major
   upgrades separately rather than applying `npm audit fix --force`.

Acceptance: deployed policy evidence plus real-session role-isolation results.
Block release if profile privilege escalation or RLS bypass remains possible.

## Milestone 2 — Authentication, identity submission and honest UI (P1)

- Real browser tests for password signup/login, confirmation, OAuth callback,
  expiration/refresh, reset/recovery and logout. Use explicitly approved fixtures;
  do not invoke the repository signup script against staging during this audit.
- Google-first-login onboarding, tenant/landlord role provisioning and clear
  incomplete-profile/recovery errors. Define verification requirements per action.
- Label/remove demonstration success flows and unsupported AI/NADRA/payment/backup
  claims. Persist own name/phone and password changes using approved interfaces.
- Consolidate shared user identity and notifications rather than fabricated shells.
- Completed in this PR: existing lint errors/warnings repaired without suppression
  and zero-warning lint added as a failing CI step. Maintain that gate.

Acceptance: auth lifecycle passes; all settings confirmations reflect real outcomes;
no demonstration financial/security operations presented as completed work.

## Milestone 3 — Complete rental and listing workflows (P1)

- Converge `/properties` and tenant catalog on live marketplace; converge landlord
  property screen on `/landlord/manage` while preserving useful presentation.
- Add server search/filter/sort and cursor pagination; use exact count queries for
  totals and explicit recent-record labels where appropriate.
- Implement property editing and approved public listing-image storage. Validate
  payloads and upload size/type; keep CNIC storage completely separate.
- Confirm mutation row counts; enforce pending-only application transitions,
  duplicate prevention and safe concurrent decisions using constraints/RPCs as
  needed (database approval first). Define property delete/retention semantics.
- Build landlord tenants view from accepted applications/tenancies after schema
  design. Avoid assuming a tenancy or lease table already exists.

Acceptance: tenant saves/applies, owning landlord manages/decides, unrelated users
cannot modify records; failures cannot produce false success messages.

## Milestone 4 — Administrator properties, reports and analytics (P1)

- Build `/admin/properties` with scoped reads, filters and pagination. Define
  moderation actions and immutable audit events before exposing write controls.
- Design reports schema and submit/review workflow, then `/admin/reports`.
- Build `/admin/analytics` from approved aggregate queries/RPCs, with role-aware
  counts, explicit date ranges and no fabricated growth/revenue numbers.
- Implement `/admin/logs` only after audit event schema/access/retention is approved.
  Do not repurpose private participant messages as a general admin inbox.
- Restore navigation entries only when routes and authorization tests exist.

Acceptance: routes load real data, partial/failed reads are distinguishable from
zero, and administrator access remains enforced in the database.

## Milestone 5 — Private identity review (P1, separate security gate)

Resolve two-/three-argument review RPC and conflicting audit designs first.
Implement restricted short-lived document viewing, human approve/reject with
reason, self-review denial, eligible pending-only transitions, atomic audit writes
and storage retention/cleanup. Test admin/nonadmin/anonymous access and duplicate
reviews on approved fixtures. Do not add AI approval or assign invented scores.

Acceptance: actual reviewer sees an authorized document; status and audit commit
atomically; no private documents or signed URLs leak into logs, Git or public UI.

## Milestone 6 — Messaging and notification delivery (P2)

Verify messaging-v2 schema, two participants, uniqueness, grants and RPC. Test
cross-account denial and sender spoofing. Add newest-message pagination, realtime
subscriptions/unsubscribe, unread state, retry handling and rate limits. Retire
legacy simulated messages in favor of the real inbox. Design notifications and
preferences with RLS; add delivery channels only when configured and tested.

Acceptance: tenant and owning landlord communicate; unrelated accounts cannot read
or send; new notifications originate from real events.

## Milestone 7 — Payments, leases and optional AI (P2/P3)

Design tenancy/lease and payment ledger before choosing payment provider. Obtain
approval before payments, provider secrets or paid services. Add sandbox checkout,
verified idempotent webhooks, reconciliation and correct failure/refund handling.
Replace demo payments only after ledger tests pass. Treat roommate matching and
AI assistance as optional extensions after core rental/security requirements;
use explainable outputs and never fabricate verification or money movement.

## Milestone 8 — Release and FYP handover (P1 release gate)

Require clean tests/typecheck/lint/build; approved multi-role end-to-end tests;
accessibility/mobile checks; storage/RLS review; error monitoring and rollback
procedure. Reconcile package-manager lockfiles. Provide architecture/schema/API
notes, deployment-variable names, FYP demo script and realistic feature checklist.
Request approval for merge/deployment only after the exact result is reviewable.

## Initial audit validation record (historical)

Local environment: Node 24.22.1; existing CI selects Node 22.
No real Supabase environment variables or credentials were configured.

| Check | Actual result |
| --- | --- |
| `npm ci --ignore-scripts` | Initial attempt failed because default npm cache was outside writable roots. Retry with `--cache /tmp/makaanx-npm-cache` passed (219 original packages). Tooling additions installed afterward. |
| `npm test` | 9 tests passed across two files: logout ordering/local scope/failure and proxy cookie preservation/role/configuration boundaries. Mocked Supabase, not RLS integration. |
| `npm run typecheck` | Passed. An intermediate badge-reference error introduced during removal was fixed before final checks. |
| `npm run build` | Passed with dummy public URL/key and normal TypeScript enforcement; no real database required or contacted by these build fixtures. |
| `npm run lint` | Initial command failed because ESLint was missing. After setup: 9 existing errors and 14 warnings. Errors: demo message effect, nested catalog FilterPanel, chatbot purity, carousel effect, sidebar randomness, two mobile effects, i18n effect and theme effect. These files were not repaired in this backend audit. |
| Production browser smoke | Five checks passed using Playwright with `/usr/bin/chromium`: home, login and anonymous redirects from `/admin/users`, `/landlord/manage`, `/dashboard`. Playwright's default bundled browser was absent; system Chromium worked. Dummy configuration only. |
| `npm audit --json` | Initial dependency review reported 11 findings: 1 critical, 3 high, 7 moderate. Next 16.2.0 was critical and Zod 3 high; patched-framework validation recorded below. No forced or major dependency upgrades. |
| Staging signup / RLS / CNIC / payment tests | Not run: no configured staging access, and signup/migration/storage/payment writes are outside the authorized audit scope. |
| Deployment / merge / SQL migrations | Not run. |

Remaining external blockers: live policy/project evidence, approved role fixtures,
explicit approval for database migrations or other data-changing integration tests.
Code-only roadmap milestones can continue independently, with PR-sized scope.

### Patched framework follow-up

Next.js and its ESLint configuration were updated to **16.4.6**, a non-major
security update reported by npm audit. Regression tests (9/9) and standalone
TypeScript checks passed again. The follow-up dependency audit reports **8**
findings: **0 critical, 1 high (Zod 3), 7 moderate** (transitive ESLint/TypeScript
tooling). Zod remediation requires a major upgrade and compatibility testing with
form resolvers; it was not forced into this repair. These counts are advisory
scanner results, not proof of exploitability of each route.

The **16.4.6 production build passed** with type checking enforced. The same five
production browser checks passed again against the patched server. At that initial audit stage, lint
results remained 9 errors and 14 warnings. `git diff --check` passed. No authenticated
browser lifecycle, role-isolated database access, or remote CI result is claimed.


## Safe-repair follow-up: current validation

The staging evidence and revised diagnosis are in `PROJECT_AUDIT.md` and the
operational guide `ADMIN_ACCESS_DIAGNOSTICS.md`. Missing admin policy is no longer
assumed. Live root cause remains unconfirmed: this session has no staging
credentials/session and did not run either SQL script or connect to real data.

| Check | Latest actual result |
| --- | --- |
| Locked install | `npm ci --ignore-scripts --cache /tmp/makaanx-npm-cache` passed, 603 packages. |
| Regression suite | `npm test`: **33 passed across 9 files**. Includes original logout/proxy tests plus diagnostic privacy/endpoint behavior, external-store UI, carousel, chatbot and Zod/shadcn compatibility. |
| TypeScript | `npm run typecheck` passed. Compatibility testing initially exposed the transformed-output wrapper issue; repaired before final checks. |
| Lint | `npm run lint -- --max-warnings=0` passed: **0 errors, 0 warnings**. No rules disabled. |
| Production build | Next 16.4.6 production build passed with dummy public configuration and TypeScript enforcement. |
| Browser smoke | **14 passed** against the final local production build using system Chromium: nine route checks, unauthenticated diagnostic privacy/cache, browser/server diagnostic UI, theme/Urdu reload, mobile login and no runtime/hydration errors. |
| pnpm lock verification | Imported npm resolutions using pnpm 10.34.9; `pnpm install --lockfile-only --frozen-lockfile --ignore-scripts` passed. Bundled pnpm 11 import initially failed on its internal release-age handler; no partial lock was retained. |
| Dependency audit | Production-only: **0 findings**. Full audit: **0 critical, 0 high, 7 moderate**, all development-tool transitive findings. `npm ls` confirms one deduplicated Zod 4.6.7 and no invalid form peers. |
| Complete PR diff / whitespace | Reviewed original and follow-up source, configuration, diagnostics, tests and lock changes; `git diff --check` passed. No credentials/private files, migration execution or RLS bypass added. |

Resolved security upgrade: pinned Zod **4.6.7**, resolver **7.0.6**, React Hook Form
**7.92.0**. The typed shadcn wrapper was repaired to accept transformed output
values; no cast or `any` workaround was used. The old Zod major-upgrade blocker is
resolved. No Zod 3 copy remains in the installed npm dependency tree.

Remaining dependency limitation: seven moderate development-only lint findings
from minimatch 10.2.6 beneath latest typescript-eslint 8.72.2. Non-forced npm audit
fix was tried and did not fix the upstream major-range constraint. Await a
compatible fixed upstream release, update its lock resolution and rerun lint;
do not silently force minimatch 11 through an unsupported override.

Reproduce browser checks after a local dummy-config production build/start with
`npm run test:browser`. Install Chromium with Playwright or set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`. The script permits only a
loopback base URL (`MAKAANX_SMOKE_BASE_URL`) and uses a fresh unauthenticated context.
It covers route rendering/redirects, diagnostic response shape/cache/privacy,
diagnostic UI, persisted theme/Urdu direction, mobile controls and runtime errors.
It creates no accounts and does not exercise authorized staging data workflows.

The workflow lint step is mandatory for the quality job and fails on warnings.
GitHub branch rules must require that quality job for merge enforcement; no ruleset
API was used or repository protection settings changed here. No merge/deployment
was performed. Remaining release gates: matched live RLS/project/session evidence,
approved real-session integration tests and explicit approval for database repairs.


## Milestone 3 implementation record — 14 November 2026

Branch `feature/core-rental-workflows` starts from c008b09 and targets
`audit/backend-repair` in a separate draft PR. PR #2 and main are unchanged.
See `CORE_RENTAL_WORKFLOWS.md` for the completion matrix, source/interface evidence,
remaining database gates, separate proposed migration/preflight, security analysis,
rollback, and demo/test procedure.

Implemented: shared live public/tenant discovery/details/homepage listings;
search/city/type/budget/bedroom filters, stable sorting and 12-record pagination;
landlord editing with strict payload/role/owner validation; affected-row checks for
all writes; pending-only compare-and-set decisions; tenant-owned applications and
favorites; actual summary counts across owned data; no fabricated rental/revenue
statistics. Existing design-system cards, responsive grids, theme/navigation shell
and loading/error feedback are retained. Unconfirmed listing media is shown as
not provided; private CNIC storage is untouched.

Database status: no real rental session or metadata connection was available.
The uniqueness migration is proposal-only; no SQL was run. Direct-API isolation,
atomic duplicate races, transition/immutable-key enforcement and deletion history
constraints require approved staging evidence and tests. Admin access remains
unresolved and its policy is not assumed absent.

| Check | Milestone 3 actual result |
| --- | --- |
| Regression suite | `npm test`: **79 passed across 14 files**, including all 33 existing repairs/diagnostic tests and 46 rental regression tests. Auth/ownership, strict payloads, stale/zero-row writes, duplicate handling, queries/counts, form states and page failures are covered with mocks/isolated fixtures. |
| TypeScript | `npm run typecheck` passed. Initial nullable-row typing was corrected before final validation. |
| Zero-warning ESLint | `npm run lint -- --max-warnings=0` passed: **0 errors, 0 warnings**. No suppressions added. |
| Production build | Next 16.4.6 production build passed with loopback read-only fixture URL and dummy public key; existing CI uses its dummy build-only configuration. No real database was contacted. |
| Browser smoke | **22 checks passed** against the final local production build: original route/auth/privacy checks plus real-query-shaped fixtures for pagination, title/city/type/budget filters, sorting, details, query errors, genuine empty state and mobile catalog. No authenticated staging mutation claim. Catalog screenshot reviewed. |
| Dependency audits | Production audit **0 findings**; full audit **0 critical, 0 high, 7 moderate** development-only baseline findings. No dependency/lockfile changes in this milestone. |
| Diff / database boundaries | `git diff --check` passed. Source/security review complete; existing admin diagnostics, proxy, auth cookies, dependency locks and administrator policies unchanged. No SQL executed; new preflight and uniqueness proposal require owner review. |

No staging data or storage writes, accounts, migration execution, merges or
production deployments. Remaining project completion gates are not disguised as
implemented database guarantees. Authenticated staging checks require existing
approved sessions; do not create fixtures in staging without explicit approval.


## Milestone 4 administration implementation — 14 November 2026

Branch `feature/admin-management` starts from PR #3 commit 28b935b and targets
`feature/core-rental-workflows` as a separate stacked draft. PRs #2/#3 remain
unmerged. See `ADMIN_MANAGEMENT_MILESTONE.md` for the completion matrix and
`STAGING_SECURITY_VALIDATION.md` for the consolidated ordered validation guide.

Implemented server-authorized read-only properties with search/filter/status/
sort/pagination, permitted owner names, exact scoped analytics and explicitly
bounded timestamp/state samples; reports readiness page; restored implemented
navigation; honest settings readiness. Admin verification metrics/queue exclude
ineligible roles and distinguish exact submitted counts from the 50-row sample.
Existing diagnostics, proxy/cookies and administrator policies are unchanged.

Reports schema is not confirmed deployed. A separate proposal, preflight and
empty-only locked rollback are prepared, not executed. It supplies creation audit
only and grants no moderation updates. Its live helper/schema/privacy/permission
prerequisites remain approval gates; the current reports page never queries an
invented table or claims an empty queue. No SQL or real staging access occurred.

| Check | Milestone 4 actual result |
| --- | --- |
| Regression suite | **105 tests passed across 17 files**; existing 79 retained. |
| TypeScript | **Passed** after production route generation; no type suppressions. |
| Zero-warning ESLint | **Passed**, 0 errors and 0 warnings. |
| Production build | **Passed**, Next.js production build with dummy local fixture configuration. |
| Existing browser smoke | **22 checks passed** against the production build and local read-only fixture. |
| Administration browser smoke | **21 checks passed**, anonymous/tenant/landlord/admin synthetic sessions only; no live RLS claim. |
| Dependency audits | Production: **0 findings**. Full: **7 moderate**, development-only baseline; 0 high/critical. No dependency or lockfile changes. |
| Security/diff review | `git diff --check` passed. Authorization/privacy/query/diff review completed. Existing diagnostics, cookies/proxy and administrator policies unchanged; no SQL executed. |

Real staging verification remains none. Runtime admin coverage, rental direct-API
isolation/unique/FK/transition behavior and reporting schema/audit tests must pass
in explicitly approved contexts before release. A rolled-back DML test still
requires permission; local synthetic HTTP sessions are not staging/RLS evidence.

## Milestone 5 identity workflow readiness — 14 November 2026

Branch `feature/secure-identity-verification` starts from PR #4 `fcd23b1` and targets
`feature/admin-management` as a separate stacked draft. The earlier three drafts
are preserved/unmerged. See `IDENTITY_VERIFICATION_MILESTONE.md` for evidence,
architecture, completion matrix and explicit implementation limits.

Implemented own-role/status privacy checks, local one-file MIME/size/header
validation, proposed reservation/finalize coordinator with tracked same-file
retry/unknown-result recovery, signup separation, source-controlled upload gate,
and real read-only filtered/paginated admin queue. Removed dormant legacy review
RPC controls. No live upload or review is enabled while authorization remains
unverified. Existing pending status alone is not claimed to be a submission.

One reviewed v1 SQL proposal replaces the recommendation in conflicting historical
review proposals: reservation-bound private uploads, profile/request locks,
pending/version/object checks, single JSON review API, immutable review and
server-only delivery audit, explicit retirement of both old overloads, no review
EXECUTE grant. Preflight and fail-closed nondestructive rollback prepared only.
No SQL, real DB/storage writes, accounts, private documents, merges or deployments.

| Check | Milestone 5 actual result |
| --- | --- |
| Regression suite | **158 tests passed across 20 files**, including 53 additional identity/page checks; existing regression coverage retained. |
| TypeScript | **Passed** (`npm run typecheck`) after final production route generation. |
| Zero-warning ESLint | **Passed**, 0 errors and 0 warnings. |
| Production build | **Passed**, Next.js 16.4.6 with dummy loopback public configuration. |
| Existing and administration browser smoke | **22 existing + 21 administration checks passed** against final production build; isolated read-only HTTP fixtures. |
| Identity browser smoke | **42 checks passed** against final build: role/status handling, local file validation/gating, scoped queue pagination/filter/empty states, privacy, no write requests and mobile layouts. Synthetic sessions only. |
| Dependency audits | Production 0 findings; full 7 moderate development-only baseline, 0 high/critical. No dependency/lock changes. |
| Security/diff review | `git diff --check` passed; full changed-source/SQL privacy and authorization review completed. Dependency locks, existing diagnostics, Supabase clients, proxy/cookies and admin helper/profile policies unchanged. SQL reviewed as a proposal, not executed. |

Outstanding: matched staging admin-visibility evidence; PostgreSQL/storage
acceptance tests (including self-review, concurrency and audit fault injection);
approved broker/access principal, stored-byte-validation decision, retention and
cleanup worker. SQL architecture is not an executed authorization guarantee.
Source-gated upload and ungranted review remain explicit release gates. Next
backend work can continue independently, but identity release cannot be claimed.

Final checks have no outstanding local failures. Initial test-table argument and
localhost fixture CORS/selector issues were corrected and rerun successfully; no
application authorization rule was weakened. PostgreSQL, storage enforcement,
concurrency and atomic-audit acceptance cases are explicitly **NOT RUN**. GitHub
Actions status is recorded in the draft PR, not inferred from local results.

## Milestone 6 — Messaging, notifications and integration readiness

14 November 2026 (Asia/Karachi). Branch `feature/messaging-notifications` starts
at PR #5 `74481b6` and targets `feature/secure-identity-verification`, separate
stacked draft. Existing PRs #2–#5 remain draft/unmerged and unmodified.

Shared role/participant-authorized inbox and cursor-paged latest history replace
duplicated pages and simulated chat. Server actions validate allowlisted message
input, derive identity from cookies and use nonce-safe proposed RPCs. Actual writes
require the exact compatible backend marker, participant validation and confirmed
RPC result. Missing contracts do not pretend to send. Exact per-conversation unread
state and recipient notification reads/mark actions are compatibility-gated.
Realtime lifecycle adapter is implemented/tested but source-disabled until approved
publication/RLS checks. Invented tenant notifications and preferences save claims
are removed; real in-app pages are linked for all roles, external delivery disabled.

One reviewed messaging/notification upgrade proposal preserves original history,
requires exact baseline/policy/participant/FK reconciliation, reuses equivalent
unique keys, revokes direct writes/legacy start and derives sender/recipient in
atomic rate-limited send + idempotency/event transaction. Preflight and non-
destructive off-switch prepared only. Disposable REST harness defaults to zero
network/writes and has explicit target/approval/fixture guards. Its mutating mode
was NOT RUN. See MESSAGING_NOTIFICATIONS_MILESTONE.md and the new consolidated
STAGING_INTEGRATION_RUNBOOK.md for completion matrix and cross-milestone gates.

| Check | Milestone 6 actual result |
| --- | --- |
| Regression suite | **199 tests passed across 25 files**, including 41 additional messaging/notification/action/UI/lifecycle/gate checks; prior 158 retained. |
| TypeScript | **Passed**, final route-generated `npm run typecheck`; no suppressions. |
| Zero-warning ESLint | **Passed**, 0 errors and 0 warnings. |
| Production build | **Passed**, Next.js 16.4.6 with dummy loopback fixture configuration. |
| Existing rental/admin/identity browser smoke | **22 rental + 21 administration + 42 identity = 85 checks passed** against final production build. |
| Messaging browser smoke | **32 checks passed**, tenant/landlord shared inbox, cursor history, uncertain retry, read acknowledgments, notifications, unrelated/missing-contract/error/mobile/privacy boundaries; synthetic localhost fixtures only. |
| Integration harness default | Plan-only executed; 0 network requests, 0 connected mutations. Execute mode NOT RUN. |
| Dependency audits | Production **0 findings**; full **7 moderate development-only baseline**, 0 high/critical. No dependency/lockfile changes. |
| Diff/security review | `git diff --check` passed; complete changed-source/SQL/privacy/dependency review completed. No private body/token logging, service credentials or public document APIs added. Existing auth/identity/diagnostics/admin profile policies unchanged. SQL and real-DB acceptance cases NOT RUN. |

Real integration remains none. Existing admin one-of-six issue, rental uniqueness/
transitions/FK history, identity broker/cleanup/authorization, messaging direct-API
isolation/concurrency/quota/atomicity, notification recipient/event integrity and
Realtime publication are explicit release gates. No SQL, connected mutations,
real users/messages/notifications, CNIC access, credentials, merges or deployments.

No outstanding local test failures. Initial missing-import/theme helper and test
environment typing errors were corrected and all checks rerun. Local synthetic
state is not PostgreSQL authorization or transactional evidence. GitHub Actions
status is recorded in the draft PR after the actual run.
