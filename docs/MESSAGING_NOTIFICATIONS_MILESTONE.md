# Milestone 6 — Messaging, notifications and integration readiness

14 November 2026 (Asia/Karachi). Base `feature/secure-identity-verification` at
`74481b692969931edfc9d16f240515b13b17f824`. Branch
`feature/messaging-notifications`, stacked draft targeting that base. PRs #2–#5
remain unmodified, draft and unmerged. No real messages/notifications were sent.

## Source audit and chosen contract

| Evidence | Before | This milestone |
| --- | --- | --- |
| Tenant/landlord inbox + detail pages | Duplicate presentation/query code, 100 oldest messages, weak UUID pattern, raw SDK errors, no paging/read cursor. | Shared components/services; stored-role + explicit participant checks; latest 30 with strict timestamp/UUID older cursor; sanitized unavailable/empty states. |
| `/dashboard/messages` | 705-line simulated conversations, automatic replies, invented delivery/typing/online/read states. | Redirect to actual inbox; no simulated alternate implementation. |
| `SendMessage`, `ContactLandlord` | Browser direct message INSERT accepted sender derived client-side; no rate/nonce protection; start used legacy RPC. | Cookie-bound server actions; strict allowlisted input, auth-derived actor; proposed v1 RPC derives sender/recipient in database. Confirmed-write-only success/invalidation. |
| `20261025_messaging_v2_proposed.sql` | Adds participant columns, property/tenant uniqueness, permissive policies, direct message INSERT; historical zero-row comment, cascade FKs and no rate/read/dedupe/last-activity maintenance. | Marked historical alternative. New upgrade proposal reconciles existing history, revokes direct writes/legacy start, retains original tables and does not assume old zero counts remain true. |
| Notification source | No deployed table/event contract confirmed; tenant header invented five events/read successes. Landlord/admin had disconnected notices. | Shared links and real-data recipient pages for all three roles; honest unavailable state until v1 contract exists; no invented zero or success. |
| Notification preferences | Local toggles and fake saved confirmations. | Notification controls/save disabled with explicit no-delivery/no-persistence text; unrelated settings untouched. |

No messaging or notification proposal is assumed installed. Existing participant-
column reads remain usable under their actual RLS; missing columns/policies fail
honestly. Application start/send/read-state writes require the exact read-only
`makaanx_messaging_contract_v1()` marker and backend RPC success. The marker means
contract compatibility, **not proof of effective deployed RLS or release approval**.
No application/service-role workaround, profile policy, helper or diagnostic change.

## Messaging implementation

- Both roles query own participant column after validated getUser/stored role.
  A malformed/mismatched returned row fails closed as a defense in depth; actual
  PostgreSQL RLS remains essential. Admin is not a conversation participant role.
- Conversation pages: 12 per page, stable saved-activity/id ordering, exact accessible
  count. Property titles use a bounded permitted id/title lookup with reference fallback. Previews are latest one-message bounded queries for those 12; permitted
  rows only. Optional unread count is exact per displayed conversation, not an
  invented inbox-wide badge. Separate requests are not an atomic snapshot.
  Legacy last_message_at may be stale; no historical repair/global chronological
  accuracy is claimed until metadata/data validation. Offset inbox pages can move
  when activity changes; message history itself uses a strict keyset cursor.
- History: fetch 31 descending `(created_at,id)` rows, display at most 30 in ascending
  order within the page, older link from the oldest displayed row. Raw PostgreSQL
  microseconds preserved; UUID/timestamp grammar excludes filter injection.
  No unbounded history fetch, attachment, online/typing/delivery receipt or private
  applicant lookup. Text is React-escaped; errors never include SDK details/body.
- Server send payload is exactly conversationId/requestId/body. Sender/recipient
  fields are rejected, not trusted. Body trimmed, 1–3000 characters and ≤12000 bytes;
  database has matching independent limits and a 10-new-send/minute/actor quota.
- A generated request UUID remains fixed while a request outcome is uncertain.
  Text freezes, retry uses identical body/nonce, no optimistic append/clear/success.
  Only a confirmed UUID clears input and refreshes. Definitive authorization/input/
  quota denials keep an editable draft. Request identity is page-memory only; after
  leaving/reloading an uncertain send, inspect latest history before resending.
  No draft/body/token is persisted to browser storage or logged.
- Starting a conversation accepts only a property UUID. Database derives tenant
  from auth.uid and landlord from eligible vacant property owner; distinct stored
  roles; profile/property locks and an equivalent `(property_id,tenant_id)` full
  unique key prevent duplicates. Changed ownership conflicts preserve old chat
  participants/history; never silently grant a new landlord an old private chat.
- Read acknowledgments are explicit, tied to the actual newest displayed message
  ID, own actor and conversation. Acknowledging through that point includes all older messages, as the UI explicitly states. No mount/navigation automatically mutates reads.
  Stored cursor is monotonic; unread compares `(created_at,id)` and excludes own
  sends. No direct read-state UPDATE/INSERT grant exists in the proposal.

## Realtime — adapter implemented, disabled pending validation

`REALTIME_ENABLED=false` is a source-controlled publication/RLS gate. The UI offers
manual refresh. Before enabling, authorize participant on the existing browser
client; subscribe to INSERT on `public.messages` filtered by one validated
conversation UUID only. Adapter ignores cross-conversation/malformed events,
coalesces invalidation, refreshes bounded server queries instead of appending
payloads, refreshes on SUBSCRIBED/reconnect, reports loss without false live status,
and removes channel/auth listener/timers on cleanup, logout or account switch.
Late events after cleanup cannot refresh. No unrestricted stream or private
notification channel is enabled. Strict-mode/navigation lifecycle is guarded.

Publication membership, authenticated JWT SELECT under RLS, tenant/unrelated
sessions, old subscriptions on logout and reconnect gaps require actual Supabase
validation. The SQL proposal deliberately does not ALTER PUBLICATION. Realtime
is not a durable delivery queue; bounded refetch remains authoritative. No event
payload/message body is logged or cached by the adapter.

## Notification foundation

Proposed `notifications_v1`: UUID, recipient FK, `new_message` event, conversation/
message IDs, created/read timestamps, unique `(event_type,message_id,recipient_id)`,
recipient/time and unread indexes. Payload intentionally contains no body, name,
email, identity path, score or arbitrary link. It is recipient-only SELECT, no
client inserts/updates/deletes. Mark-read RPC derives auth.uid and sets read_at
once; repeated mark is idempotent; foreign/unknown IDs cannot claim success.

Only **confirmed new-message sends through v1** atomically create one event for
the other participant. Exact retry returns prior message before another event is
inserted. No generic client notification-creation API exists. Application,
identity and property events remain unimplemented until their own transition/
audit contracts pass integration tests; no broad historical backfill/triggers are
installed. No email, SMS, push provider or external delivery is connected.

Pages are recipient-filtered, 20 rows with exact accessible count and own unread
HEAD count; unread query failure is unavailable, not zero. Unknown event/invalid
row/missing count fails closed. Read controls mutate only on explicit action and
refresh only on confirmed update. Missing compatibility RPC displays configuration
unavailable without probing a guessed notification table or inventing an empty queue.

## Proposed database upgrade, safety and rollback — NOT RUN

`20261114_messaging_notifications_v1_proposed.sql` starts with a mandatory reviewed
policy fingerprint (`REVIEW_REQUIRED` aborts), unknown policy/object checks,
participant/history validity and duplicate checks. Destructive cascade/SET NULL/
SET DEFAULT history FKs block the proposal: obtain exact metadata and a separately
approved focused FK preservation repair; do not apply historical v2 blindly.
UUID keys/timestamptz fields, legacy nullable/default columns, trusted owner/schema,
role lockdown, effective grants, alternate SECURITY DEFINER writers and triggers
must be reviewed before approval. No historical data is overwritten/deleted.
Equivalent valid/ready full pair uniqueness is reused; a missing index is created
only after duplicate checks, with name-conflict abort and reviewed lock window.
Optional message ordering index requires checking deployed equivalents first.

Original conversations/messages retain history. New private request mappings,
quota windows, own read cursors and recipient notifications are RLS enabled.
Direct DML/table/column grants are revoked; only required SELECT projections and
validated RPC EXECUTE are granted. Legacy start EXECUTE is revoked in the proposal,
not by this session. Unknown privileged writers require separate reconciliation.

Send locks actor profile then conversation, checks membership/input, returns prior
same-nonce/body/chat result or rejects nonce reuse, enforces quota, generates a
monotonic timestamp under the conversation lock, inserts message/request mapping,
updates last activity and inserts recipient event in one transaction. All direct/
alternate writers must be retired to preserve this timestamp/read-order invariant.
Audit/notification insertion failure rolls the send back; concurrent retries must
be validated against PostgreSQL, not inferred from in-memory fixture behavior.
Read acknowledgement locks the same conversation; future sends sort after its
watermark, even when wall clocks tie. No sender-controlled created_at is accepted.

Quota windows and idempotency mappings require owner-approved retention; never
prune mappings independently of message history and reopen duplicate retry risk.
Message/notification retention, erasure/export and participant role/property
ownership changes need an approved privacy policy. No automatic cleanup job or
message deletion API is installed. FK RESTRICT on new records preserves history.
`rollback_messaging_notifications_v1_proposed.sql` revokes RPC access and preserves
all history/read/event records; no destructive rollback or broad ACL restoration.

## Completion matrix

| Feature | Source | Mock/fixture tests | Real PostgreSQL/Supabase | Remaining gate |
| --- | --- | --- | --- | --- |
| Shared scoped inbox/history | Implemented, existing column interfaces | Yes | None | Actual schema, RLS/grants and legacy timestamps |
| Start/send, limits and safe retry | Server actions + proposed v1 RPC | Yes | None | Reviewed migration, direct-API/concurrency/quota tests |
| Unread and mark-read | Implemented, compatibility-gated | Yes | None | Read schema/clock-order/concurrent-send tests |
| Realtime lifecycle | Implemented, source-disabled | Yes, adapter doubles | None | Publication/JWT RLS/reconnect authorization |
| Recipient notifications | Implemented, compatibility-gated | Yes | None | Event schema/ownership/atomicity tests |
| Other event kinds/external delivery | Not implemented | No claim | None | Independently approved transition/provider contracts |
| Disposable integration harness | Explicit opt-in REST subset; default zero-network plan | Gate tests + plan executed | Mutating mode NOT RUN | Owner approval + isolated synthetic fixtures |
| Cross-milestone readiness | Ordered runbook/minimum metadata | Source reviewed only | None | Matched runtime evidence + staged acceptance |

Actual command results are recorded in IMPLEMENTATION_PLAN.md and the draft PR.
No SQL, connected writes, real accounts, private CNICs, real messages/notifications,
service credentials, merges, deployments or paid services were used. Existing
identity gates and five-field `/auth/diagnostics` contract remain unchanged.
