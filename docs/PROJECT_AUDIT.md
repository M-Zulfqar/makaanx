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
  npm is the existing CI path and the lockfile updated by this change.

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

## Administrator sees one of six profiles: evidence and diagnosis

1. The user reports staging holds one admin, one landlord and four tenants. This
   audit did not independently query or count staging rows.
2. `app/admin/users/page.tsx` first checks the caller's own profile role, then
   selects `id,full_name,role,verification_status` from all visible profiles,
   ordered by id, limited to 100. There is **no own-id filter on the directory
   query**, no role filter, no one-row limit and no frontend row suppression.
3. `app/admin/page.tsx` uses an exact head count of profiles, without an id filter.
4. Both reads use the cookie-bound public-key server client. An application role
   of `admin` does not change the PostgreSQL API role from `authenticated`, nor
   confer RLS bypass. An authenticated admin can pass the role guard while seeing
   only its own row.
5. `20261101_staging_auth_phase2.sql` grants authenticated SELECT but creates
   `profiles_select_own USING (auth.uid() = id)`. Under that policy alone, any
   signed-in account, including the administrator, sees exactly its own profile.
6. `20261112_admin_profile_read_staging_proposed.sql` explicitly supplies the
   missing administrator SELECT policy using a SECURITY DEFINER helper. It is
   marked **NOT APPLIED**. The later verification proposal uses another policy
   name and also grants CNIC read access; that is a broader, separate capability.

**Conclusion:** the repository establishes that own-profile RLS produces the
reported result, and excludes a one-row frontend limit as the explanation for
six records. Missing/effectively inactive admin SELECT access is the leading,
code-supported diagnosis. The actual staging root cause remains **unconfirmed**
until deployed policy definitions and the authenticated request's target project
are inspected. Proposed files and historical comments do not prove what is live.
A wrong frontend project URL could also produce a different row count; no deployed
environment variables or authenticated staging session were available to rule it out.
Cookie loss on redirects is a separately confirmed defect, not proof of the count issue.

### Minimal confirmation and repair gate

- Verify deployed public URL identifies the intended staging project (do not
  publish keys, tokens, identities or document paths).
- Obtain metadata-only output from `supabase/admin_read_access_preflight_readonly.sql`:
  profiles RLS/FORCE flags, all SELECT policies and roles, helper owner/security,
  and effective sensitive-column grants. Compare with the repository proposal.
- With an existing admin session, count visible profiles. Compare with a trusted
  aggregate-only staging count grouped by role; no private documents needed.
- If admin SELECT is absent and role mutation is locked down, review the existing
  **profile-read-only** proposal `20261112_admin_profile_read_staging_proposed.sql`.
  Obtain explicit database approval before applying it. Do not bundle CNIC access.
- After approved application, use separate existing admin/tenant/landlord sessions:
  admin should see six profiles in the reported fixture, tenant/landlord only their
  own profile, anonymous none. Test forbidden role/status/path mutations and ensure
  CNIC access is unchanged. Metadata inspection alone is insufficient.

Do not disable RLS, replace the public key with service-role credentials, hardcode
six, remove role guards or relax own-profile policies to mask this problem.

## Security and data integrity findings

| Priority | Finding / action |
| --- | --- |
| P0 | Dependency audit identified critical Next.js 16.2.0 advisories, including proxy bypass. Updated Next and matching ESLint configuration to 16.4.6. Audit now reports no critical findings; Zod 3 remains high and seven transitive lint-tool findings are moderate. Schedule Zod 4 compatibility work before release. |
| P0 | Deployed profile privilege lockdown is unverified. Historical status notes describe broad INSERT/UPDATE grants; later SQL comments describe hardened staging. Confirm current effective grants and trigger behavior before trusting role-based admin access. Own-row UPDATE policies do not protect privileged columns. |
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
