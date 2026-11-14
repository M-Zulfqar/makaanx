# Milestone 5 — Secure identity submission and review readiness

14 November 2026 (Asia/Karachi). Base: `feature/admin-management` at
`fcd23b156ed4391a9de88f4824271fd8d918da03`. Branch:
`feature/secure-identity-verification`, stacked draft targeting that base.
PRs #2/#3/#4 are preserved, draft and unmerged. No SQL, real account creation,
private-document access, database/storage changes, merge or deployment occurred.

## Audit findings and one recommended architecture

Repository evidence, not a claim of deployed schema:

| Existing source | Finding | Decision |
| --- | --- | --- |
| `app/auth/signup/page.tsx`, old identity page | Two separate upload writers, random paths each attempt, RPC failures could strand untracked objects; signup could falsely announce pending review after failed upload. | Registration collects no document. Single authenticated identity page; uploads deliberately gated until reservation/storage validation. |
| `20261025_milestone_1_2_auth_foundation.sql` | `makaanx_submit_cnic(text)` checks own path/object but permits replacing pending/rejected references, does not restrict eligible role, and assigns pending without a submission version. Upload policy admits arbitrary own-folder names. | Historical foundation is not a safe concurrency/retry contract. Proposed v1 retires its client EXECUTE; no automatic application to staging. |
| `20261026_admin_verification_proposed.sql` | Three-argument `makaanx_review_identity(uuid,text,text)`, `identity_review_audit`, reasons for both outcomes; broad admin CNIC SELECT; NULL decision/status checks can fall through SQL three-valued comparisons. | Historical alternative, not recommended for new deployment. Preserve history/definitions. |
| `20261112_admin_verification_proposed.sql` | Recreates helper/profile policy and adds blanket `cnic_admin_select`; would not establish matched runtime coverage. | Do not reapply to fix the unresolved one-profile issue. No helper/profile policy changes in this milestone. |
| `20261112_admin_review_audit_proposed.sql` | Two-argument overload, different `identity_verification_reviews` table, no reason, nonblank path rather than object validation. Both overloads could coexist; review locks alone do not identify a replaced pending submission. | Retire client EXECUTE on all legacy review overloads only in an approved reconciled migration; preserve audit rows. |
| Dormant `IdentityReviewForm` | Called three-argument legacy RPC, trusted raw SDK error messages, no submitted-request version; not mounted in queue. | Replaced by inert readiness notice; no approval/rejection/document call site. |
| Profile fields | `role`, `verification_status`, `cnic_path`, `verification_score` exist in source; statuses pending/verified/rejected; pending does not distinguish absent document. | Preserve status semantics and role lockdown. Approved human review is not official identity authentication. New requests link version and object internally. |
| Storage references | Identity files use `cnic-documents`; rental listing images are a separate public feature. Historical own-folder INSERT and broad review SELECT proposals conflict. | Private CNIC bucket only; reservation-bound INSERT, no direct document SELECT/UPDATE/DELETE; no public URL API. |

Recommended single contract: `20261114_identity_workflow_v1_proposed.sql`.
The three conflicting review files are labeled historical alternatives. This is
not a numbered migration chain to run blindly; never use blanket db push.
No claim is made that any historical proposal is deployed. Check all executable
SECURITY DEFINER functions and effective grants, including inherited/PUBLIC paths,
before deciding what must be retired. Unknown functions/policies require review.

## Implemented application behavior

- Status reader validates `auth.getUser()` and stored own-profile role; it selects
  only `role,verification_status`. Metadata cannot authorize; errors are sanitized. Existing verified/rejected profile labels explicitly do not certify that a review audit or authenticity evidence was inspected.
- Signup retains the existing multi-step design but collects no identity file,
  calls no storage/submission RPC and fabricates no score or pending submission.
- Local selection accepts exactly one nonempty JPEG/PNG up to 10 MiB, matching
  MIME and PNG/JPEG header signatures. Size/count/type/header failures occur before
  reservation. Header checks are not a complete decoder, malware scan or proof
  of authenticity. Filename is not displayed/logged. No previews or public URLs.
- The coordinator uses the proposed APIs only: reserve → upload without upsert →
  finalize → report pending. It reauthenticates and checks stored role/status.
  The returned path must exactly match the authenticated namespace/request UUID.
  No path leaves the coordinator result or is written to local/session storage.
- Same-file retries request the same reservation using a SHA-256 content digest.
  An uncertain upload is reconciled through finalize; 409 is not treated as proof
  of success. Finalize error never reports submitted. A committed pending
  reservation recovered after a lost response skips upload and rechecks finalize.
- No automatic remove is attempted after an ambiguous RPC result: deletion could
  erase a successfully committed submission. Abandoned objects remain indexed by
  a reservation and block replacement until approved recovery/retention cleanup.
- `IDENTITY_SUBMISSION_ENABLED=false` is a source-controlled release gate, not an
  environment/metadata/browser-prop switch. Public submit entry makes no requests
  when gated. The UI explicitly says no upload can occur. Contract coordinator
  tests do not enable the real application. **Live submission is not complete.**
- Queue authorizes on the server and again in its reader, queries actual permitted
  profiles with exact count, 12-row stable pagination, escaped name search and
  allowlisted role/status/submitted/incomplete filters. No email/phone/path/file
  or signed URL is selected. Mixed views explicitly decline to classify individual
  document presence, avoiding any path fetch. Saved reference does not prove
  a valid object; empty/malformed legacy strings need approved reconciliation.
- Errors, unavailable counts, empty pages and restricted coverage are distinct.
  Existing admin loading/error boundaries apply. All review/file access is inert.

## Proposed database contract — never executed

Prerequisites: intended project, resolved admin helper/session issue, exact text
status schema, trusted function owner and non-writable schema, protected profile
columns (no client INSERT/UPDATE), reviewed triggers/functions/grants and private size/type-limited bucket.
`preflight_identity_v1_readonly.sql` collects metadata only and a storage-policy
fingerprint. The proposal deliberately aborts at `REVIEW_REQUIRED` until a reviewer
pins that exact baseline. It also aborts on unknown storage policies or existing
v1 objects; reconcile other bucket policies separately, never weaken them.

The proposal creates:

- `identity_submissions_v1`: subject, internal object name, declared MIME/bytes and
  content digest, state/version, creation/submission/expiry timestamps. Unique
  active subject and object name; request-specific namespace CHECK; FK RESTRICT.
  No direct browser table access or raw-path queue projection.
- `identity_review_events_v1`: immutable-by-client one event per request, actor,
  pending→verified/rejected status, rejection reason, optional notes and timestamp.
  No document bytes/path/hash in review audit; no direct client grants.
- `identity_document_views_v1`: server-only request/version/reviewer/time delivery
  evidence. No browser insert grant or broker-writing RPC is supplied. It is a
  prerequisite for later review; not proof a human looked at the image.

`makaanx_begin_identity_v1(file_mime,file_bytes,file_sha256)` authenticates, locks
own profile then active submission, validates eligible role and unset/compatible
status/reference. A same-file active reservation is returned; different-file,
expired, legacy-referenced or settled submissions fail closed. One active request
per subject provides a database backstop, not merely a client precheck.

`makaanx_identity_upload_allowed_v1(object_name)` admits only that caller's unexpired
uploading reservation; the storage INSERT policy also checks private bucket and
object owner. Only approved exact historical CNIC policies are removed. Broad
unknown policies cause an abort. No overwrite/delete/list/download policy is added.

`makaanx_finalize_identity_v1(request_id)` locks in the same order, requires own
eligible profile and an unexpired reservation, checks actual storage object owner
and metadata type/size, and atomically links profile/reference/pending plus request
version. Exact still-pending retry returns pending. Settled/stale states fail.
The digest is a retry identity, not a server-verified authenticity/content hash.
Before release, a trusted validation/scanning pipeline must establish whether the
stored bytes need further validation; client MIME/header and storage metadata alone
cannot establish true file content. No scanner integration is claimed.

One recommended review API:

```
makaanx_review_identity_v1(review jsonb) -> verified | rejected
{request_id, expected_version, decision, reason, notes}
```

All keys/types checked; no ambiguous overloads/default arguments. Caller must be
an authenticated stored admin via the reviewed helper; no self-review; eligible
profile/request both pending and linked; expected version exact; object owned and
present; recent (10 minute) trusted document delivery for this actor/version.
Rejection requires 10–1000 character reason, approval may have an empty reason;
notes ≤1000. Profile then request locks serialize against finalize/review. Status,
version and immutable audit insert commit atomically; unique request audit rejects
duplicate review. Retry of a settled review fails stale; it never emits a second
event. Recovery after unknown result must read a future safe outcome projection,
not blindly retry a different decision. No trust/AI score is assigned.

**Review EXECUTE is deliberately ungranted, with no UI call site.** A separately
approved broker and successful PostgreSQL/storage authorization tests are required
before any grant or controls. SQL review/concurrency/audit behavior has NOT run.

## Least-privilege document access proposal — disabled

Do not add broad admin storage SELECT or browser signed-URL calls. Proposed future
server broker accepts a request UUID/version, validates cookie-bound admin and
no self-review, then checks linked pending state and current version. A dedicated
trusted backend principal with only a narrow broker operation would resolve the
object and deliver one image; no service-role browser key or app RLS workaround.
No such principal, secret, endpoint or permission is configured here.

Prefer streaming through a request-ID endpoint: private/no-store, no redirects,
no raw object name or storage URL in browser responses, sanitized errors, no body/
URL access logging, bounded one-object response, authenticated same-origin fetch,
CSRF protection for access-audit creation and rate limits. If a storage signed URL
is required internally, expire it within 60 seconds and never return/log it. Do
not claim a signed URL is revocable before its TTL. Broker records delivery only
after authorized successful streaming; bind evidence to reviewer/request/version.
A controlled viewer needs XSS/content-type/nosniff/frame protections. Delivery is
not proof of inspection; the reviewer must affirm manual examination. Broker ACL,
principal provisioning and immutable access auditing require a separate reviewed
proposal before implementation. No uncontrolled bulk or folder listing.

## Retention, cleanup and rollback

Reservations expire at 24 hours for upload/finalize authorization; expiry does not
silently delete records/objects or unlock a new upload. Before enabling submission,
approve and implement an idempotent narrowly authorized cleanup worker. It must
lock profile then request, check expired/uploading and no linked reference, fence
late finalize/upload, delete through the Storage API (never storage SQL DELETE),
recheck and record cleanup result before marking expired. Handle partial deletion/
retry, pending uploads racing cleanup and all immutable audit requirements. No
cleanup worker or timer is deployed. Tracked unresolved reservations are bounded
one per subject and cannot generate unlimited replacement paths.

For submitted/settled documents, owner must approve legal purpose, consent,
retention duration, access review, appeal/recovery and erasure policy. No duration
for real identity retention is invented here. Keep minimal path-free review audit
where legally justified; FK RESTRICT means account deletion needs a reviewed
history-preserving privacy workflow. Do not put notes, hashes or documents in
analytics, GitHub, logs, traces, screenshots or support exports.

`rollback_identity_v1_proposed.sql` is a fail-closed access off-switch: revokes v1
EXECUTE and removes reserved INSERT policy, preserves all data/history and does
not restore broad legacy privileges. Existing objects and ACLs must be captured
before approval. Destructive rollback or baseline restoration needs separately
reviewed dependencies/empty-only checks; never cascade or erase review history.
Disabling UI first avoids user confusion. No rollback was executed.

## Completion matrix

| Area | Implemented code | Mock/fixture tested | Real staging | Remaining gate |
| --- | --- | --- | --- | --- |
| Signup separation/status/privacy | Yes | Yes | No | Real auth lifecycle on approved sessions |
| File/role/namespace validation | Yes | Yes | No | Actual storage enforcement and byte-validation decision |
| Tracked upload/retry coordinator | Yes, source-gated | Yes, proposed RPC doubles | No | Approved schema, cleanup worker and authorization tests |
| Read-only filtered queue | Yes | Yes, restricted and synthetic reviewer views | No | Existing profile RLS/admin visibility |
| Review contract/input validation | SQL proposal + shared schema; no callable UI | Input validation only | No | PostgreSQL NULL/stale/self/concurrency/atomic-audit tests |
| Private document viewing | Architecture only, disabled | No delivery claim | No | Broker/principal/access audit design and approval |
| Retention and cleanup | Documented design | No worker claim | No | Owner policy and tested worker |
| SQL migration/RLS/rollback | Prepared only | No executed SQL claim | No | Baseline reconciliation, approval and isolated DB acceptance suite |

Exact command results appear in `IMPLEMENTATION_PLAN.md` and the draft PR. Existing
`/auth/diagnostics`, proxy/cookies, admin helper/profile SELECT policies and five-field
privacy contract are unchanged. No live credentials exist in this environment.
Use the minimum paired evidence in `STAGING_SECURITY_VALIDATION.md`; do not assume
an absent policy or add an RLS/service-role bypass to make the queue nonempty.
