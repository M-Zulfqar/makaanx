# Release consolidation plan — no merges or deployment authorized

14 November 2026. PR metadata was read from GitHub; all existing drafts remain
unmerged and unchanged. This document proposes a review sequence only. No base
retargeting, force push, branch protection edit, merge or Vercel deploy occurred.

## Verified stack and ancestry

| PR | Head branch / verified abbreviated commit | Current target |
| --- | --- | --- |
| #2 | audit/backend-repair — c008b09 | milestone-1-2-authentication — 05ceed5 |
| #3 | feature/core-rental-workflows — 28b935b | audit/backend-repair |
| #4 | feature/admin-management — fcd23b1 | feature/core-rental-workflows |
| #5 | feature/secure-identity-verification — 74481b6 | feature/admin-management |
| #6 | feature/messaging-notifications — 2dad1ec | feature/secure-identity-verification |
| This PR | feature/backend-integration-readiness | feature/messaging-notifications |

Heads form a linear ancestry chain. Suggested approval/review order is #2 → #3 →
#4 → #5 → #6 → this PR. This does not mean migrate databases in PR order or that
any merge is currently authorized. `DATABASE_MIGRATION_DEPENDENCIES.md` controls
conditional database decisions independently.

After each approved lower merge, explicitly review the next PR base and complete
remaining diff. If repository policy permits history-preserving merges they avoid
replaying ancestor work. Squashing/rebasing lower PRs changes ancestry and can show
duplicate changes in higher PRs; obtain a reviewed restack plan before rewriting
those branches. Do not blindly squash the whole stack or cherry-pick isolated
files from later commits. Integration branch → main and deployment need separate
approval after exact consolidated diff, flags, tests and operational gates pass.

## Source overlap and conflict hotspots

Computed from actual branch-to-parent file diffs:

- IMPLEMENTATION_PLAN.md / PROJECT_AUDIT.md span every milestone. Keep later actual
  evidence and preserve historical validation dates/scopes; do not merge tables
  that turn mock/local success into staging certification.
- package.json, fixture server and shared rental-client test helper span several
  PRs. Keep all test scripts/helper operations; no dependency change in this PR.
- #3/#4 touch shared rental presentation and landlord layout; #6 updates landlord
  notifications. Preserve query/filter additions, auth/logout/theme and latest links.
- #4/#5 edit admin verifications; #5 replaces the read-only queue with filtering/
  paging and removes legacy callable review controls. Do not resurrect old forms.
- #4/#6 edit admin shell; #6 replaces notification placeholders with recipient pages.
- #2/#5 edit signup and verification paths. Keep signup separate from gated private
  submission; never restore random-path legacy upload or fake pending success.
- #5 marks old identity SQL historical; #6 marks messaging v2 historical; this PR
  adjusts uniqueness/identity ACL safety and adds conditional rental authorization.
  Resolve SQL conflicts as contract review, not timestamp sorting or concatenation.

The old simulated tenant messages implementation is already retired (#6 redirect).
Shared inbox/render/service code is the current path; do not maintain duplicate
chat pages. Historical migration proposals are retained for review evidence, not
execution. A future clean release migration folder should contain only approved
baseline-specific deltas after actual deployed metadata is captured; moving files
now would break review references without establishing a valid live baseline.

## Configuration and missing operational evidence

- Real Supabase public environment variables, project/build scope, Auth redirect
  allowlist/providers and normal session lifecycle are not configured/verified here.
  Never request or commit service keys, passwords, JWTs or environment files.
- Original Phase 1 DDL is absent. Local baseline.sql is synthetic and MUST NOT be
  deployed. Live schema/policy/type/trigger/FK/index drift remains unmeasured.
- Identity upload source gate remains false; review remains ungranted in the
  proposal. Local temporary test grants are removed and never enter app code.
  Broker/principal, stored-byte validation, retention/cleanup/erasure remain needed.
- Messaging marker checks compatibility only; actual installed RPC/RLS/HTTP role
  propagation needs approved Supabase tests. Realtime source gate remains false;
  publication/JWT delivery not tested. No external notification channels enabled.
- Reports moderation and other event kinds remain disabled/unimplemented.
- Production dependency audit must remain clean; development lint-tool findings
  are tracked separately. No blanket npm audit fix --force or lockfile churn.
- Backup restoration, monitoring/private-log handling, rollback operators, rate/
  abuse limits at HTTP edge and controlled demo fixtures require owner decisions.

## Readiness matrix

| Gate | Current evidence | Release disposition |
| --- | --- | --- |
| Lint/unit/typecheck/build/browser | Actual results in implementation plan / PR | Code quality only; not deployed DB authorization |
| Real PG RLS/grants/transactions/concurrency | Isolated synthetic baseline tested; CI job added | Useful database evidence, not Supabase/live baseline equivalence |
| Admin count issue | Decision tree/template; local restrictive-policy demonstration | BLOCKED on matched five-field reports + deployed metadata |
| Rental live integrity | Proposed conditional policy/trigger + local races | BLOCKED on actual FK/index/policy/status diff |
| Identity live review/storage | SQL tests + gated application | BLOCKED on Auth/Storage/broker/cleanup/retention and explicit release approval |
| Messaging/notification live integration | PG + fixture tests, contract-dependent writes | BLOCKED on deployed baseline/REST/session validation |
| Realtime and external delivery | Adapter tested only, gates closed | Not releasable as live delivery |
| Merge/deploy | Review plan only | Owner approval required, no automated merge/deploy |

## Necessary owner evidence and approvals only

1. Supply the filled minimal report in ADMIN_VISIBILITY_DIAGNOSIS.md and reviewed
   read-only metadata from the intended existing project. No secrets or records.
2. Review an exact baseline-specific database delta only after that evidence,
   including dependencies/backup/locks/expected result, risks and rollback/roll-forward.
   Current generic/local proposals are not a request to execute all SQL files.
3. Approve any separate disposable **Supabase** fixture/test target and connected
   mutations needed for HTTP/JWT/Storage/publication acceptance. Local Docker SQL
   was already authorized by this milestone; no extra approval is needed for it.
4. Decide identity/document retention, broker/cleanup and messaging/event retention
   before enabling those live workflows. Review the concrete implemented/tested
   result before any merge or deployment approval. No paid service is needed for
   the delivered local test environment.
