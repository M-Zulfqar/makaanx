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
