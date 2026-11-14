# Backend integration audit — Milestone 7

14 November 2026 (Asia/Karachi). Base: `feature/messaging-notifications` at
`2dad1ecf09399e59160a2336f0b1a6b44e1c0b40`. Work:
`feature/backend-integration-readiness`, stacked draft onto that base.

This audit distinguishes source contracts, actual local PostgreSQL execution and
unknown deployed state. No staging/production connection, SQL, account, document
or record was used. The local database is a reviewed synthetic contract baseline,
not a recovered staging schema. Detailed execution commands/limits are in
LOCAL_DATABASE_TESTING.md; proposed live order is conditional in
DATABASE_MIGRATION_DEPENDENCIES.md.

## Contracts and evidence

| Area | Actual application/source interface | Missing deployed evidence / consequence |
| --- | --- | --- |
| Profiles/auth | Cookie-bound public Supabase clients, getUser, stored profiles.role; protected fields; trusted signup proposal | Exact signup trigger/default/status types, effective INSERT/UPDATE/inherited grants and helper ownership must match. No real Auth JWT/refresh integration tested locally. |
| Admin | `makaanx_is_admin()`; server layout/page guards; directory SELECT with no own-ID predicate, limit 100; five-field browser/server diagnostics | Owner reports helper/admin policy and six staging profiles but app count one. Local successful helper is not a staging diagnosis. Need matched runtime evidence. |
| Properties | Explicit public fields; landlord direct INSERT/UPDATE/DELETE with own predicate; no privileged moderation | Existing RLS/grants/FK actions unknown. App deletion precheck alone cannot preserve hidden/concurrent history. |
| Applications | Tenant direct pending INSERT; landlord status compare-and-set UPDATE; full-history pair uniqueness | Existing index and DB-enforced transition unknown. App checks cannot prevent direct API status/key bypass. New conditional transition/RLS proposal tested only on synthetic policy-free baseline. |
| Favorites | Own `(user_id,property_id)` SELECT/INSERT/DELETE | Exact full unique key and policy scope unknown; direct concurrent constraints tested locally. |
| Identity submit | Local validation + reservation/upload/finalize v1, source-gated | Bucket HTTP bytes/MIME limits, actual owner metadata and cleanup/broker unknown. PG tests exercise metadata RLS/transaction, not uploaded files. |
| Identity review | Single JSON v1, expected version, recent delivery evidence, pending-only/self denial, atomic audit; EXECUTE ungranted | Older two/three-arg overloads may coexist. Broker, delivery and retention not installed. Local body tests use explicit temporary owner grant + synthetic delivery evidence, then revoke it. |
| Conversations | Shared tenant/landlord own-column queries, property-bound start v1 | Historical v2 columns/cascade/zero-history assumptions not a deployed baseline. Owner changes must preserve old participants, not expose their chat. |
| Messages | Strict server input, sender derived by database, nonce retry, cursor paging, quota, notification transaction | Actual privileges/alternate writers/indexes/publication unknown. PG exercises body/RLS/locks; no REST/JWT/Realtime certification. |
| Notifications | Recipient-owned v1 SELECT/mark-read; new-message-only safe IDs | Table/workflow deployment unknown; no external channel or other event triggers. Local event rollback/ownership proven only for selected proposal. |
| Reports | Schema-gated UI; property_reports/events proposal, restricted insert and creation audit | Existing live report objects unconfirmed. No moderation grant/RPC. Creation audit and rollback on fault executed locally. |

## SQL graph and confirmed source risks

The repository lacks the original complete Phase 1 schema. Historical SQL files
are overlapping alternatives, not a replayable chain. In particular:

- Signup/profile grants: foundation, emergency grants, security bundle and phase2
  replace/revoke overlapping objects. Applying one later can change status defaults,
  policies or old submit access; do not stack them on evidence of file dates.
- Admin read-only proposal is narrower than older full admin verification scripts.
  The latter add broad private object SELECT and distinct profile policy names.
  A policy name's presence is not its effective behavior; permissive policies OR,
  restrictive policies AND. FORCE/owner/RLS and overloads affect helpers.
- Old review `(uuid,text,text)` + `identity_review_audit` and `(uuid,text)` +
  `identity_verification_reviews` are incompatible with v1 request/version/audit.
  Preserve audit history; do not replace/merge them blindly or leave an old
  executable write path that bypasses v1.
- Messaging v2 adds auth-user CASCADE FKs and direct message INSERT. New v1 refuses
  destructive history FKs and revokes old writes. An installed v2 baseline may
  therefore require a separate FK repair, not concatenation of both files.
- Rental pair indexes alone do not implement ownership or pending-only transitions.
  Actual status-only column grants still require RLS + transition enforcement.
- All public-schema SECURITY DEFINER writers and membership-based grants need
  review. Table-level REVOKE does not remove column grants; role REVOKE does not
  remove access inherited from another role. Schema CREATE and function owners
  must be trusted. New functions use empty search_path; legacy bodies remain unknown.
- New FK RESTRICT relationships protect retained history but require deliberate
  account/property erasure and retention workflows. Do not weaken them for demos.

## Changes and database evidence from this milestone

1. Added an isolated Docker/PostgreSQL 16.16 harness, deterministic baseline and
   fixtures, real non-owner/non-bypass actor sessions, observed-lock race tests,
   atomic fault injection and sanitized reports. Source and locally applied SHA256
   hashes identify exactly which proposals ran; only synthetic fingerprint literals
   are pinned in memory, never source-edited to claim live compatibility.
2. Added `20261114_rental_authorization_proposed.sql` as a focused missing contract:
   explicit grants/RLS, immutable owner/key boundaries and a pending-only trigger.
   It deliberately aborts on existing policies/triggers or destructive FKs. It is
   NOT an executable repair against unknown staging policy names.
3. Fixed rental uniqueness proposal to reuse equivalent valid/ready full unique
   indexes and reject name conflicts, rather than blindly creating duplicate keys.
   Actual local repeated application and concurrent insert tests verify this path.
4. Hardened identity proposal's legacy revocation: inherited EXECUTE now aborts
   the whole transaction. A synthetic inherited role with both legacy overloads
   reproduced why direct REVOKE was insufficient; test confirms no half-created
   v1 tables survive the abort. No installed function/privilege was modified live.
5. Added independent PostgreSQL CI job with bounded report artifact; existing app
   quality job remains. No branch protection, merge or deployment changes.

## Scope and release readiness

| Feature | Real local PostgreSQL | Browser/unit fixtures | Live Supabase/staging | Release status |
| --- | --- | --- | --- | --- |
| Profile grants/signup/admin SELECT | Tested | Prior tests retained | Unverified | Matched six-profile runtime evidence required |
| Rental ownership/transition/pair/FK races | Tested selected conditional baseline | Prior app tests retained | Unverified | Actual policy/FK diff required |
| Messaging membership/nonce/quota/atomic event | Tested | Prior tests retained | Unverified | Actual RPC/REST/policy integration required |
| Notification recipient/read state | Tested | Prior tests retained | Unverified | Actual installed event contract required |
| Identity SQL state/audit/version/isolation | Tested, temporary review grant only for body tests | Existing gated app retained | Unverified | Upload gate remains false; no broker/release grant |
| Storage object metadata predicates | Tested on local table adapter | Synthetic files only | Unverified | Storage API/bucket/byte validation required |
| Report creation/audit | Tested | Pending-schema UI retained | Unverified | Confirm live reporting schema/approval |
| JWT/Auth cookies/REST/PostgREST/Realtime | Not emulated by plain PG | Existing fixture checks only | Unverified | Separate approved Supabase tests |
| Retention/cleanup/backup/erasure | Documented only | No execution claim | Unverified | Owner policy and operational implementation |

Exact final checks are in IMPLEMENTATION_PLAN.md and the draft PR. No application
feature gate was relaxed because local SQL passed. Older milestone statements
that SQL was not run refer to those earlier sessions; this milestone explicitly
executes reviewed proposals only inside newly created disposable local containers.
