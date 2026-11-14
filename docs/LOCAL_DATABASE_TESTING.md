# Reproducible local PostgreSQL integration testing

14 November 2026. This milestone is authorized to create **disposable local** SQL
fixtures. This permission does not extend to staging/production or the separate
connected REST harness. No real records, tokens, CNIC files or service keys used.

## Initialize and run

Requirements: Node 22+, Linux Docker CLI with access to the local Unix daemon
socket `/var/run/docker.sock`, image registry access for the pinned PostgreSQL
image. No npm database dependency or Supabase environment variables are needed.

```
npm run test:db:local
```

The runner creates a new labeled `makaanx-pg-*` container, initializes/tests it and
removes it in finally. It does not attach to an existing SQL host, accept database
URLs, bind host volumes or publish ports. Docker context/host/TLS routing and PG
connection environment overrides are stripped; the CLI explicitly targets the
local Unix daemon. Container `--network none`, PostgreSQL `listen_addresses=''`,
Unix socket psql only, SQL statement/error-payload logging disabled, database name fixed `makaanx_disposable`, tmpfs PGDATA.
Image: `postgres:16-alpine` pinned by SHA256 in scripts/local-db/docker.cjs;
executed engine **PostgreSQL 16.16**. This digest is the reproducible engine pin,
not a claim of matching the owner's unknown Supabase PostgreSQL version.

To keep a disposable database for inspection:

```
npm run test:db:local -- --keep
npm run test:db:manage -- inspect <printed-makaanx-pg-container-name>
npm run test:db:manage -- reset <printed-makaanx-pg-container-name>
```

Inspect/reset verify strict name, task label, exact pinned image, network-none,
no published ports and internal disposable marker. Reset removes only that
verified local container; it does not run DROP on an input URL or remove Docker
volumes/images globally. Default runs clean up automatically. Do not retain many
containers on small Docker VFS disks. First session's larger bookworm image hit
local disk pressure on a second run; task-only resources were removed and the
smaller pinned Alpine image completed repeated full runs. No shared container,
production DB or security control was altered to solve the resource issue.

If the daemon/image is unavailable, the command fails. Report the blocker; do not
fall back to a configured DATABASE_URL or use the staging project. The helper is
Linux-local by design; Windows/macOS users need an equivalent Linux Docker setup,
not a remote context override. Local Docker access is privileged infrastructure;
run only reviewed checkout code.

## Setup versus actor assertions

1. Owner setup loads `scripts/local-db/baseline.sql`, a minimal **test-only** Phase 1
   shape reconstructed from source columns. It creates synthetic auth/storage
   metadata adapters, private bucket metadata, database roles and a marker.
2. It applies the selected profile provisioning/admin/rental/identity/messaging/
   report proposals from source, plus deterministic fictional fixtures. It patches
   only the literal policy baseline pins in memory for this fresh local metadata.
   No source REVIEW_REQUIRED guard is removed or converted into a live baseline.
3. Tests connect as independent login roles: anonymous, tenant_a, tenant_b,
   landlord_a, landlord_b, admin_user. All are checked NOSUPERUSER/NOBYPASSRLS and
   unable to SET ROLE postgres. Policies apply through membership in anon or
   authenticated. No RLS is disabled for an actor assertion.
4. `auth.uid()` is a deliberately minimal fixed **SESSION_USER** mapping. It is
   not Supabase Auth, does not validate JWTs and must never be installed in a real
   project. Auth table rows are fictional DB fixtures, not real accounts.
5. Explicit owner setup/fault injection is separate from actor operations. Review
   EXECUTE is initially denied as shipped; a test-only owner grant and synthetic
   delivery evidence allow body/version/audit cases, then EXECUTE is revoked again.
   No viewer was built or real document delivered. Fault triggers are removed in
   finally; the entire container is disposable. These privileges are test setup,
   not actor bypasses or application-release changes.

Results are `work/local-db-results.json` (Git ignored): engine, source/applied
SHA256, safe test names/status/codes, observed-lock races. No tokens, bodies,
object paths, reviewer notes or private payloads are emitted. Owner metadata
source hashes identify exactly which files ran; an applied hash differs when a
synthetic policy fingerprint was pinned. Do not export private runtime dumps.

## Actual SQL coverage and concurrency method

The suite exercises real PG RLS, table/column permissions, triggers, indexes/FKs,
SECURITY DEFINER calls and transactions. Concurrent tests use independent psql
sessions: the first holds its actual data locks before commit; the second must
be observed in pg_stat_activity waiting on a **Lock**, or the test fails. No mock
lock or sequential promise is treated as a race. Isolation is PostgreSQL default
READ COMMITTED. A bounded pg_sleep holds an already-executed transaction only
for overlap observation; it does not replace the actual operation.

Coverage: profile signup/grants, six-role isolation, helper/profile reads,
restrictive-policy symptom reproduction, rental forged keys/ownership/pending-only
and duplicate/FK races, equivalent-index reuse, conversation/nonce races, direct
sender spoof, quota, message-notification fault rollback, recipient reads,
monotonic read watermark with concurrent send, identity metadata/namespace/finalize,
missing-object/self/stale/NULL/version conflict, immutable audit and fault rollback,
report spoof/moderation denial and atomic creation audit. Legacy inherited identity
EXECUTE is injected in setup to prove the proposal aborts and fully rolls back.
Unmodified proposal guards and nonempty pinned policy metadata are tested too.

## What this environment cannot certify

It does **not** reproduce Supabase Auth JWT verification/issuer/session refresh,
PostgREST schema cache/HTTP roles, Storage API uploaded bytes, MIME/scanning/signed
URLs/download routing/ownership assignment, Realtime publication delivery or Vercel
build-time env. Storage assertions operate on synthetic metadata rows with real
PG RLS only; no file bytes are uploaded or accessed. Direct SQL actor tests prove
the selected DB boundary, not actual HTTP/JWT role propagation.

The synthetic baseline deliberately has compatible UUID/text/timestamp/default
columns and history-preserving FKs. Passing it says the chosen proposals work on
that baseline; it says nothing about unknown existing policies, enums, broad grants,
custom triggers, alternate RPC writers or data on the real project. Do not copy
baseline.sql/fixtures.sql into Supabase or deploy all migration files. Keep identity
and Realtime release gates closed pending the approved Supabase acceptance suite.

GitHub Actions runs this suite in a separate job and uploads the bounded JSON
report even on failure. Existing lint/unit/typecheck/build job remains intact;
branch protection and deployments are not modified.
