# Milestone 3 — Core rental workflows

Date: 14 November 2026 (Asia/Karachi).
Base: `audit/backend-repair` at `c008b09444179a472b4addb51eb1f063b3713653`.
Branch: `feature/core-rental-workflows`. Separate draft PR targets
`audit/backend-repair`; PR #2 remains unmerged.

## Evidence and scope

This milestone uses the existing cookie-bound public-key Supabase clients and
existing table operations. No production/staging connection, record mutation,
account creation, SQL execution or deployment was performed. Owner-supplied
staging evidence concerns profiles/admin access, not the deployed rental schema
or rental permissions. Repository SQL proposals are not proof of installation.

The property fields selected here are the same fields the existing creation form
already wrote: title, address, city, type, rent, bedrooms, bathrooms, area,
landlord_id and status, plus id/created_at already used in reads. Applications
use existing id/property_id/tenant_id/status/created_at; favorites use existing
user_id/property_id. We added no assumed image, lease, revenue or tenancy columns.
Database rows are parsed before rendering listings; incompatible schemas produce
an error rather than invented values. Incomplete/unsupported legacy records are
not silently overwritten by the editor.

## Completion matrix

“Implemented/tested” means local source and mocks/isolated fixtures passed.
No row in this matrix certifies staging RLS, grants or real-account behavior.

| Feature | Implementation and evidence | Database/deployment gate |
| --- | --- | --- |
| Landlord create/edit | Shared Zod schema on client/server; strict payload excludes owner/status injection; server checks profile role; owner-scoped updates; returned row required. Editor route `/landlord/properties/[id]/edit`. | Existing property INSERT/SELECT/UPDATE privileges, types, status values and RLS unverified. |
| Listing delete | Role and ownership check; checks accessible applications; owner-scoped DELETE RETURNING; zero rows cannot become success. UI explicitly confirms deletion. | Verify FK delete actions and landlord application visibility. A concurrent application/delete needs RESTRICT/NO ACTION history protection or a reviewed atomic RPC; the preliminary read alone is not an atomic database guarantee. |
| Public/tenant discovery | `/properties`, `/marketplace`, `/dashboard/properties` share live cards, title/city search, type/budget/bedroom filters, rent/newest sorting, stable id tie-break and 12-record pagination. Invalid filters show an error without issuing a query. | Anonymous/tenant property SELECT policy, numeric column types and API page limits need staging confirmation. |
| Details | All three detail routes share one live reader; malformed IDs/missing rows produce not-found; database denial/failure uses error UI, never a fabricated 404. Tenant actions use live own saved/application state. | Real authenticated/anonymous reads unverified. App Router loading boundaries may stream not-found with HTTP 200 after headers have committed; tests assert the rendered not-found state rather than claim universal HTTP 404. |
| Homepage listings | Latest live vacant listings use the same card design. No fabricated property scores, reviews, availability, rents or photos. Empty/failure states are separate. | Read access unverified; homepage now renders dynamically. Other marketing/AI claims remain a separate content milestone. |
| Tenant application creation | Server binds authenticated tenant and pending status; requires visible vacant property; rejects own/unavailable listings; own duplicate precheck; returned insert row required; handles 23505. | Atomic duplicate prevention requires a deployed unique key on `(property_id, tenant_id)`; app prechecks alone cannot prevent concurrent clients. |
| Landlord decisions | Loads application, verifies property owner, allows pending→approved/rejected only; UPDATE compares pending status and property id; returned row required. | Current database RLS/column grants/transition enforcement unverified. Direct API clients must also be constrained. Approval does not create a tenancy/lease or promise exclusive occupancy. |
| Application history | Tenant-scoped, exact count, stable order and pagination. Landlord sees up to the latest 100 across all owned listings; labels explicitly state the limit. | API visibility and history retention need role-isolated staging tests. |
| Favorites | Tenant-owned adds/removes with returned property reference; already-saved result explicitly reports no change; zero-row removal fails. Live saved status shared across catalogs/details/saved page and refreshed after mutations. Unavailable references can be removed. | Unique `(user_id, property_id)` and FK behavior unverified; proposed uniqueness change only if absent. |
| Landlord overview/analytics | Real filtered owned-listing count; exact application/pending counts across all accessible owned IDs, not a limited array length. Recent application list is separate from totals. Fake charts/revenue/portfolio/notification counters removed. | Counts reflect current RLS. Multi-request summaries are not a single transactional snapshot. Large portfolios may eventually need an approved aggregate RPC/indexes. |
| Tenant overview | Exact own application/favorite/pending counts and a separately labeled latest-five history. | Counts are record counts under RLS; uniqueness and direct-API isolation require database verification. |
| Administrator access | Existing private diagnostics and policy protections retained; root cause still unresolved. | Matched project/session/RPC/count evidence remains required; no admin policy changes made. |
| Property images | No private CNIC objects queried or reused. Honest photo-not-provided state preserves card/hero layout. | Public listing-image schema/bucket/policies/uploads are not confirmed and were not invented. |

## Implementation structure

- `lib/rentals/schema.ts`: strict mutations, canonical UUID validation, bounded URL
  filters, literal ILIKE escaping, fixed sort fields and pagination URLs.
- `lib/rentals/service.ts`: role/ownership checks, allowlisted writes, affected-row
  confirmation and controlled database error mapping. No raw error message logging.
- `lib/rentals/actions.ts`: Next server actions, cookie-bound public client and
  revalidation of catalogs, details, saved/application pages and overviews. Next's
  built-in action origin protections remain enabled.
- `lib/rentals/queries.ts`: shared property queries and chunked owner-scoped
  application summaries. It avoids relying on an unverified PostgREST embedded
  relationship; owner-ID scans follow the actual returned page length, and missing
  counts/incomplete history fail rather than masquerade as zero.
- `components/rentals/`: shared responsive shadcn cards, filters, detail view,
  management view and loading/error feedback. Existing theme, navigation shell,
  rounded cards, gradient imagery areas and responsive layouts are retained;
  demonstration data and nonfunctional widgets were replaced by truthful UI.

Authorization is layered: the server checks roles and targets; queries explicitly
scope ownership; the database must independently enforce RLS and column grants.
This code cannot secure a direct API if the deployed database policies are weak.
No service-role credentials or RLS bypass were introduced.

## Database approval package

### 1. Read-only preflight (prepared, not executed)

`supabase/preflight_core_rental_readonly.sql` inventories field types/nullability,
constraints/FKs/delete actions, indexes, RLS policies (including restrictive
policies), table/column grants, and aggregate duplicate/null-key counts. Use a
trusted owner for duplicate aggregates; an RLS-restricted user can hide rows.
No names, profile identities, CNICs or document references are selected.

Confirm at minimum:

- properties.id and application/favorite references are UUIDs; rent/area numeric,
  bedroom/bathroom counts numeric, created_at orderable timestamps; supported type
  strings and `vacant` status match existing constraints.
- Profile role is immutable to clients. Properties belong to authenticated
  landlords; UPDATE/DELETE can affect only own rows; owner/id cannot be reassigned.
- Tenant INSERT binds application tenant_id to auth.uid() and pending status;
  tenant cannot edit landlord decisions. Landlord UPDATE is owner-scoped and
  limited to status; property_id/tenant_id/id cannot be reassigned. Pending-only
  transitions must also hold for direct API calls (not just this UI).
- Favorites SELECT/INSERT/DELETE are own-user scoped. Anonymous mutation denied.
- Landlords can read all applications referencing their listings. Property delete
  must preserve existing history, including a concurrent new application.
- API page cap supports the 12-record catalog pages and count metadata is enabled.
  Database errors remain errors; never loosen RLS to make a page appear populated.

### 2. Proposed uniqueness migration

`supabase/migrations/20261114_core_rental_integrity_proposed.sql` is a separate,
**not applied** proposal adding two unique indexes. It changes no records, policies,
grants or CNIC storage. Use only if equivalent unique keys do not already exist.
Required keys must already be NOT NULL and FK-linked; nullable keys or duplicates
abort. The proposal never cleans up existing rows automatically. Normal index
creation can block writes, so approve a backed-up staging maintenance window.

Security analysis: the indexes close duplicate races for valid non-null key pairs;
they do not authorize callers, enforce status transitions, fix weak RLS or make
an ownership precheck atomic. There are no SECURITY DEFINER functions in this
proposal. It intentionally does not touch administrator access policies.

Rollback: if the approved change alone created the two indexes and no later
constraint depends on them, use a separately approved transaction to drop
`public.makaanx_rental_application_once` and `public.makaanx_rental_favorite_once`.
No rows need restoration because the proposal does not modify rows. Dropping the
indexes reopens duplicate races; coordinate the app and roll-forward decision.
Do not drop equivalent pre-existing indexes or apply rollback automatically.

Post-approval staging tests (NOT run here): two concurrent application inserts for
the same property/tenant must yield one row and a 23505 conflict; likewise for
favorites. Different tenants/properties remain independent. Test existing rows,
role isolation, forbidden owner/status-column changes and anonymous denial.
Perform writes only against explicitly approved test fixtures/database, with a
cleanup/rollback plan. Mock tests in this PR verify handling of the 23505 response,
not that a real PostgreSQL index has been installed or executed.

### 3. Conditional further proposals

Exact RLS/grant repairs, immutable application keys, database-enforced status
transitions, and FK RESTRICT/NO ACTION history rules require the metadata first.
They are approval items, not silently stacked migrations. If constraints or grants
already satisfy them, no change is necessary. If not, prepare the minimal focused
proposal and rollback from that actual baseline before asking for approval.

## Demonstration and tests

### Without any real database

1. `npm ci`, `npm test`, `npm run typecheck`, `npm run lint -- --max-warnings=0`.
2. In one terminal: `node scripts/rental-fixture-server.cjs` (loopback 54329).
   It serves 25 explicit fictional listings, rejects all write methods and creates
   no accounts. This is a PostgREST-shaped HTTP fixture, not an RLS emulator.
3. Build with `NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54329` and
   `NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-build-only`; start the production server
   with the same dummy configuration, e.g. port 3003. No real keys are needed.
4. Set `MAKAANX_SMOKE_BASE_URL=http://127.0.0.1:3003`,
   `MAKAANX_RENTAL_FIXTURES=1`, and optionally
   `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium`; run
   `npm run test:browser`. Install the Playwright browser if using its default path.
5. Browse public cards, search by title/city, filter price/type/bedrooms, change
   order, paginate, open a valid detail, and inspect an invalid ID or empty result.
   A `force_error` title search deliberately exercises a safe database-failure UI.

Unit/UI fixtures test create/edit/delete, role/ownership denial, duplicates,
compare-and-set decisions, zero-row failure, invalid payloads, exact totals and
saved controls. They never connect to staging. Browser checks cover public flows
and unauthenticated gates; they do not claim authenticated rental mutations passed
against Supabase. Default browser checks also work with dummy configuration and
truthful query-failure states instead of demo fallback data.

### After explicit approval and existing real staging sessions

Owner checks metadata first, then tenant A saves/applies and observes matching
saved/application counts; refresh/visit another catalog and detail to verify state.
Landlord A edits an owned listing, then approves/rejects its pending application;
repeating/stale decisions must not change a row. Tenant B/unrelated landlord must
not read or mutate those private records. Test direct API calls too. Try duplicate
submissions concurrently only if writes/fixtures have been approved. Verify
profile diagnostics remain private and the admin issue is not masked by these
changes. No real-account/password reset/CNIC/payment test ran in this milestone.

## Current validation and remaining work

Final commands/results are recorded in `IMPLEMENTATION_PLAN.md`. The previous
seven moderate development-only lint findings remain the baseline; no dependency
was added or upgraded for this milestone. Production dependency findings remain
zero at the checked snapshot.

Next: obtain matched admin runtime evidence; verify rental RLS/grants/constraints;
apply only explicitly approved focused repairs; then progress to private identity
review and audited decisions, participant messaging/pagination/realtime, and
release documentation. Property media, tenancies/leases, payments and real AI
services remain separate milestones, not implied completed features.
