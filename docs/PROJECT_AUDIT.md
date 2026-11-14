# MakaanX project audit

Audit date: 13 November 2026 (session client date, Asia/Karachi). Repository: `M-Zulfqar/makaanx`.
Baseline: `milestone-1-2-authentication` at `05ceed5102b27f1c1b3f5fcf06c91d107bcd4506`.
Work branch: `audit/backend-repair`. This is a source audit and local validation,
not a certification of deployed Supabase or Vercel configuration.

## Executive assessment

The project has a substantial presentation layer and several genuine Supabase
workflows. It is not feature-complete. Live marketplace, application, favorites,
listing-management and inbox code coexist with older demonstration screens.
Database policy installation and multi-account authorization remain release gates.
No database, storage object, deployment, or main branch was changed in this audit.

## Architecture

- Baseline Next.js 16.2 App Router (updated to 16.4.6 in this repair), React 19, strict TypeScript, Tailwind 4, shadcn/Radix,
  Framer Motion, Recharts. Pages use server components for live reads and client
  components for mutations and interactive presentation.
- `app/layout.tsx` supplies fonts, metadata, Vercel Analytics and providers.
  `components/providers.tsx` wraps custom theme and English/Urdu contexts and toast UI.
  There are duplicate mobile/toast utilities under `hooks/` and `components/ui/`.
- `lib/supabase/server.ts` uses `@supabase/ssr`, the request cookie store, and a
  public publishable/anon key. It does not bypass RLS. Cookie writes are attempted;
  Server Component restrictions are caught, relying on proxy session refresh.
- `lib/supabase/browser.ts` uses the SSR browser client, also with a public key.
  `proxy.ts` protects tenant, landlord and admin namespaces with `auth.getUser()`
  and an own-profile role query. Authentication pages remain accessible.
- Domain tables referenced by code: profiles, properties, applications, favorites,
  payments, conversations and messages. CNIC submission uses a private storage
  bucket and `makaanx_submit_cnic`; chat creation uses `makaanx_start_conversation`.
- `supabase/` contains metadata preflights, verification scripts and overlapping
  historical/proposed migrations. It is not a clean, replayable schema baseline.
  The initial staging Phase 1 schema is not present as a complete migration.
- Existing GitHub Actions runs npm install, typecheck and a build with dummy public
  configuration. This change adds regression tests. No Vercel configuration or
  deployment credentials are provided locally. npm and pnpm lockfiles coexist;
  npm is the existing CI path; both lockfiles are now synchronized with the upgraded manifest.

## Feature inventory

“Implemented” here means connected code exists; it does not imply a successful
staging integration test.

| Area / routes | State and evidence |
| --- | --- |
| `/`, `/pricing`, `/how-it-works`, `/help`, `/privacy`, `/terms` | Marketing/content UI. Claims about verification, AI and secure payments exceed verified backend capabilities. Marketing featured properties and testimonials are static. |
| `/contact` | Form simulates submission using a timer; no delivery backend. |
| `/auth/signup`, `/auth/login` | Supabase signup/password login and profile-based routing implemented. Role selection is checked against the database profile. Signup normalizes role through proposed SQL trigger hardening, whose deployed state is unverified. |
| `/auth/callback` | PKCE code exchange, fixed role destinations and password-reset destination. No arbitrary external redirect. Google configuration and email redirect allowlist require staging checks. |
| `/auth/forgot-password`, `/auth/reset-password` | Supabase reset request and updateUser implemented. Reset request previously ignored returned errors; repaired. Recovery-link/expired-link behavior remains untested. |
| `/auth/verify-identity` | Own CNIC JPEG/PNG upload and submission RPC implemented. No actual AI verification. No storage cleanup for upload-success/RPC-failure. |
| `/marketplace`, `/marketplace/[id]` | Genuine listing reads, tenant application, favorite toggle, conversation-start action. List capped at 100; no server search, filters or pagination. |
| `/properties`, `/properties/[id]` | Older static catalog/detail experience; inconsistent with live marketplace. |
| `/dashboard` | Live own profile, five recent applications, favorites and payment-record reads. Application card explicitly counts only the latest five. |
| `/dashboard/applications`, `/dashboard/favorites` | Live own records and linked property reads. |
| `/dashboard/inbox`, `/dashboard/inbox/[id]` | Participant-filtered conversations and message history/send. Requires messaging-v2 schema/RPC/policies; not verified installed. Oldest 100 messages displayed, without history pagination or realtime subscription. |
| `/dashboard/properties`, `/dashboard/properties/[id]` | Demo catalog/details. Filters and favorites on demo screen are local UI state. |
| `/dashboard/messages` | Legacy simulated conversations/replies, separate from live inbox. |
| `/dashboard/payments`, `/dashboard/roommates` | Static payment/roommate data; payment success simulated by timer; matching and processing services absent. |
| `/dashboard/settings` | Theme/language work locally. Profile, password, notification and billing buttons show success without backend persistence. |
| `/landlord` | Live own listings and applications; listing count limited to latest 100. |
| `/landlord/manage` | Real create/delete listings and application status decisions. Property edit and photo upload absent. Decisions/deletes can report success for zero affected rows; use returning rows or RPC in the next CRUD milestone. |
| `/landlord/inbox`, `/landlord/inbox/[id]` | Live participant-based messaging, subject to the same database gate as tenant inbox. |
| `/landlord/properties`, `/landlord/analytics`, `/landlord/settings` | Demo portfolio, charts and nonpersistent settings, despite live management existing elsewhere. |
| `/admin`, `/admin/users`, `/admin/verifications` | Live RLS-scoped overview, directory (100 rows), submitted queue (50 rows) and incomplete-submission count. No identity approval or private-document viewing enabled. |
| `/admin/settings` | Local settings preview with fabricated save/security/backup/cache/index/log success messages; backend operations absent. |
| `components/ai-chatbot.tsx` | Local canned responses/timers, no AI service integration. |

### Missing routes and broken navigation

At the baseline, admin navigation linked to nonexistent `/admin/properties`,
`/admin/reports`, `/admin/analytics`, `/admin/messages`, and `/admin/logs`.
These links have been removed from active navigation pending implementation;
no fake pages or broad database read privileges were added. Landlord navigation
also links to missing `/landlord/tenants` and `/landlord/payments` (follow-up work).

### Hardcoded administrator information

`app/admin/page.tsx` already queried exact database counts at baseline. It did
**not** hardcode the main user statistic. The fabricated values were in
`app/admin/layout.tsx`: users=12, verifications=8, reports=3, five notifications,
three alerts badge, 85% CPU, pending NADRA claims, 99.9% API uptime, database
health and backup-success text. Those were removed and replaced with explicit
unconnected-service states. Dead profile/security/audit menu items were replaced
with a settings-preview link. Search is disabled until connected. The generic
administrator label is not a fetched account identity; avatars remain presentation.

## Administrator sees one of six profiles: revised evidence and diagnosis

The owner has now supplied staging evidence for project `ficudncgevvxsxbjscrk`:
six profiles (one admin, one landlord, four tenants); `makaanx_is_admin()` exists,
owned by postgres, SECURITY DEFINER=true, authenticated EXECUTE=true and anon
EXECUTE=false; sensitive profile UPDATE privileges are false; and the
`makaanx_admin_read_profiles` SELECT policy is present alongside own-read and
own-update policies. The app still sees one row after signing in again.
These observations supersede the earlier missing-policy hypothesis. They were
reported by the owner; this environment has not queried staging independently.

Source evidence remains: the directory query has no own-user filter, role filter
or one-row limit (it allows 100); the overview uses an exact HEAD count. Both
use public-key, cookie-bound clients and RLS. An application's `profiles.role`
value of admin is distinct from the JWT/API role `authenticated`.

**Current conclusion: root cause is unresolved. Do not assume the migration is
absent or add another policy.** A wrong build/project, browser/server session
mismatch, false helper result, wrong policy expression/TO roles/command, restrictive
policy, relation/schema mismatch or helper execution context needs direct evidence.
A true helper and an applicable permissive SELECT predicate invoking it, without
restrictive exclusions, should permit all six rows in the same project/session.
The observed one-row count means at least one of those assumptions must be checked.

New `/auth/diagnostics` performs browser and cookie-bound server checks only when
clicked. Output is limited to project reference, verified JWT role, helper boolean,
exact visible count and machine error codes. It never returns/logs tokens, users,
claims, profile rows, emails or CNIC data. Unauthenticated requests cannot execute
the helper/count; the server diagnostic is private/no-store. Tests verify privacy,
failure states, role/issuer checks and the true-helper/one-row combination.

Prepared, **not executed**, metadata/session scripts:
`supabase/diagnose_admin_policy_readonly.sql` and
`supabase/diagnose_admin_session_readonly.sql`. See `ADMIN_ACCESS_DIAGNOSTICS.md`
for exact usage, limitations and the evidence-to-next-check matrix. SQL-editor
postgres counts do not reproduce the browser JWT context. Read-only diagnostics
can be run on an existing approved runtime; deploying this code or changing any
policy/function/grant still requires explicit approval.

Do not disable RLS, use a service-role client, hardcode six or relax guards to
mask this problem. Private CNIC viewing remains disabled.

## Security and data integrity findings

| Priority | Finding / action |
| --- | --- |
| P0 | Dependency audit identified critical Next.js 16.2.0 advisories, including proxy bypass. Updated Next and matching ESLint configuration to 16.4.6. Follow-up upgraded Zod to 4.6.7 and the resolver to 7.0.6, with typed and rendered-form compatibility tests. No production dependency findings remain; seven moderate development-tool findings remain (details below). |
| P0 | The owner reports sensitive profile UPDATE privileges are false. Full direct-API boundary and signup-trigger tests are still unverified. Historical status notes describe older broad grants and must not be treated as current metadata. Own-row UPDATE policies do not protect privileged columns. |
| P0 | Proposed SQL files overlap and differ: admin policy names, two audit table designs, two- versus three-argument review RPC overloads. Never apply the directory wholesale. Reconcile a single migration sequence after metadata review. |
| P0 | No complete schema baseline, database test fixtures or live RLS test evidence. Review property/application/favorites/payment and messaging grants, constraints and ownership separately. Browser role checks do not secure direct API access. |
| P1 | Logout did not call signOut; sessions survived navigation. Fixed in all three layouts, including landlord/admin dropdowns that previously had no handler. Logout uses local scope (this browser), blocks duplicate clicks and redirects only on success. |
| P1 | Proxy refreshed cookies on an intermediate response then dropped them on login/role-denied redirects. Fixed by copying cookies with attributes to the redirect response. |
| P1 | Admin statistics are permission-scoped, not guaranteed global totals. Existing accessible-row wording is retained. Verification counts may include pending admin profiles and queue length is capped; define applicant eligibility and pagination before global analytics. |
| P1 | CNIC review component exists but is unused; it expects the three-argument RPC. Do not enable until overload reconciliation, least-privilege private viewing and audited human decisions are tested. No private bytes, paths or signed URLs were retrieved here. |
| P1 | Application/property mutation success needs affected-row confirmation, pending-only transitions, duplicate prevention and concurrency tests. Verification gating comments differ from SQL: role checks alone do not require verified identities. Product rule must be settled before changing policy. |
| P1 | Demo payments, security changes and backups can look real. Disable or clearly label them before an external release; never accept money or real CNICs on an unvalidated workflow. |
| P2 | Errors often expose raw database messages; add controlled feedback and server diagnostics. Pagination and query failure/empty-state handling need consolidation. Detail routes can turn database failures into 404s. |
| P2 | Google-first-login defaults to tenant in proposed provisioning; no landlord onboarding/role-selection workflow. Reset callback and provider settings need real-session testing. Remember-me checkbox is not wired. |
| P2 | Root metadata and signup step title still claim AI verification although no AI verification service runs. Marketing/legal copy and privacy/retention must match actual behavior. |

Tracked-file inspection found only the blank `.env.example`, no tracked SQL backups,
CSV exports or PDFs. Source inspection found no service-role usage or CNIC public-URL
code. This is not a full history secret scan. Ignore rules now cover all `.env.*`
(except the example), local work, TypeScript build metadata and common backup formats.

## Repairs and verification

Safe repairs: real logout; redirect cookie preservation; reset-request error
handling; removal of fabricated admin indicators and dead links; enabling normal
Next build type checking (removed `ignoreBuildErrors`); executable ESLint setup;
Vitest regression suite and CI test step; patched Next.js dependencies. SQL proposals were left untouched.

See the validation results and milestone acceptance gates in `IMPLEMENTATION_PLAN.md`.

## PR #2 safe-repair follow-up

All nine original ESLint errors and fourteen warnings were addressed without
rule disables, inline suppressions or weakening configuration:

- Theme/language and mobile state use `useSyncExternalStore` with stable server
  snapshots, storage/media subscriptions and cleanup. The provider no longer
  suppresses all server-rendered content. Preferences survive reloads and work
  in memory when storage is blocked or quota-limited; cross-tab changes propagate.
- Carousel reads external API state through subscriptions, initializes controls
  correctly and unsubscribes both select and reInit events.
- Demo messages clear unread state at initialization/selection, rather than an
  effect; current message dependencies are stable. Filter markup is a JSX value,
  avoiding a newly created component type and remounted controls on each render.
- Sidebar skeleton variation derives from `useId`, giving stable hydration-safe
  widths. Chatbot messages use monotonically increasing event-time IDs instead
  of millisecond timestamps, and the initial greeting has stable text. Suggested
  prompts send their actual text instead of stale input.
- Twelve native images became Next Image components with explicit dimensions
  while retaining their styling. Existing unoptimized image behavior is unchanged.
  Urdu font loading moved to `next/font` with its CSS variable.
- GitHub Actions now runs lint with `--max-warnings=0` as a mandatory failing step,
  alongside regression tests/typecheck/build; no continue-on-error. Repository
  branch-protection/ruleset settings were not changed by the workflow edit.

### Dependency advisory and diff review

`GHSA-mrhx-c7xc-m3w5` affects Zod versions below 4.6.6: oversized constrained
collections may exhaust memory. Zod 4.6.7 is pinned; `@hookform/resolvers` 7.0.6
supports Zod 4 and requires React Hook Form >=7.55 (resolved 7.92.0). No production
schema imported Zod before this change. Compatibility tests cover nested errors,
transformed values, asynchronous refinements, oversized arrays, and actual shadcn
form submission. `FormField` now preserves the transformed-output generic instead
of silently constraining outputs to input types. The installed tree has no Zod 3.

Seven moderate findings remain in development-only TypeScript-ESLint dependencies,
rooted in `minimatch` (`GHSA-g3hv-75wg-m249`, affected 7.0.0 through 11.0.0).
Latest available `typescript-eslint` 8.72.2 still resolves minimatch 10.2.6;
`npm audit fix --ignore-scripts` did not resolve it. Forcing minimatch 11 beneath
that dependency would cross its supported major range, so no override was added.
Upgrade the upstream lint stack when a compatible fixed dependency is available,
then rerun the same zero-warning gate. Production-only audit has no findings.

The complete PR source/configuration/dependency diff was reviewed, including
prior logout/cookie repairs. No service key, token logging, identity/document
retrieval, RLS bypass, migrations or deployment actions were introduced. New SQL
files explicitly use READ ONLY transactions. Both package locks were synchronized
to prevent npm/pnpm selecting different declared dependency versions. Full pnpm
runtime/build parity is not claimed; npm remains the validated CI installer.
See the latest validation record in `IMPLEMENTATION_PLAN.md`.


## Milestone 3 — Core rental workflows (14 November 2026)

The feature branch starts from c008b09 while PR #2 remains unmerged. Public and
protected property catalogs/details and homepage listing cards now use shared
live readers instead of demonstration arrays. Landlord create/edit/delete,
tenant applications, landlord decisions, and favorites use strict, cookie-bound
server actions with role/ownership checks and returned-row confirmation. Searches,
filters, stable sorting and pagination are implemented. Live summary counts are
separate from limited recent-history lists; fake landlord charts/revenue and shell
portfolio/payment notifications were removed.

The initial inventory above is historical baseline evidence. Current route coverage,
feature-by-feature status, exact column/interface evidence, proposed uniqueness
migration, security/rollback analysis and demo procedure are documented in
`CORE_RENTAL_WORKFLOWS.md`. No rental schema/policy deployment is claimed. Atomic
duplicate prevention, direct-API RLS/grants/transition enforcement and delete-history
constraints remain unverified database release gates. The admin diagnostic and
unresolved six-versus-one issue remain intact; no administrator policy was changed.


## Milestone 4 administration — 14 November 2026

Read-only administrator properties, scoped analytics and reports readiness routes
are now implemented with server role checks, permitted owner information and
explicit coverage/sample labels. Sidebar links are restored only for those routes.
Fake settings health/storage/backup/save states were removed. Verification counts
exclude non-applicant roles and use exact submitted counts separately from the
limited queue. No identity viewing/moderation write is enabled.

The one-of-six issue remains unresolved; neither helper truth nor query success
is used as proof of global visibility. Minimal read-only evidence and the ordered
staging guide are prepared. Report tables are unconfirmed, so the page is honest
about unavailable configuration. The fresh-table/RLS/creation-audit proposal and
locked empty-only rollback have not been executed. Detailed code/mock/real-staging
status is in `ADMIN_MANAGEMENT_MILESTONE.md`.

## Milestone 5 — Identity security readiness (14 November 2026)

Evidence: separate signup and verification upload writers could strand random-path
objects on submission RPC failure. Legacy submit proposal permitted replacing a
pending path and did not restrict eligible roles. Review proposals conflicted on
two-/three-argument overloads, audit tables, reasons and blanket admin object SELECT.
Neither repository proposal is assumed deployed. The dormant review component
used the three-argument contract and raw SDK errors.

Registration now collects no document or invented verification result. Own status
and one-file validation, tracked proposed coordinator/recovery and gated submission
UI are implemented. Admin queue is authorized, filtered, exact-count paginated and
path-free; legacy review controls removed. One v1 SQL architecture, metadata
preflight, nondestructive access rollback and post-approval acceptance matrix are
prepared only. No helper/profile policy, auth proxy/cookies or diagnostics changed.

No live identity upload/review/document viewer is claimed complete. Real RLS,
storage, atomicity, concurrency and retention gates remain unverified; uploads
source-gated, review EXECUTE ungranted. See `IDENTITY_VERIFICATION_MILESTONE.md`
and the Milestone 5 actual results in `IMPLEMENTATION_PLAN.md`.

## Milestone 6 — Messaging and notification source audit

14 November 2026: tenant/landlord inbox code duplicated oldest-100 history and raw
SDK errors; legacy `/dashboard/messages` simulated automatic replies and receipts;
tenant header fabricated five notifications and local read successes. Historical
messaging-v2 direct INSERT/zero-history/cascade assumptions did not supply rate,
nonce, read-cursor, last-activity or event delivery guarantees. No actual deployed
messaging or notification schema is presumed from those proposals.

Replaced with shared scoped bounded inbox/latest-cursor thread, server actions,
strict input/participant checks, confirmation-only nonce-safe send, optional exact
unread state and recipient notification pages. Writes/read-state require proposed
v1 compatibility; Realtime remains source-disabled. Fake notifications/preference
save behavior removed. One history-preserving proposal and minimum metadata package,
ordered integration runbook and default-no-network disposable harness prepared.
Actual local results are in the plan; real RLS/races/atomicity/storage/publication
remain untested. Existing identity gates, diagnostics/helper and auth cookies/proxy
are unchanged. No staging/production mutation, merge or deployment occurred.
