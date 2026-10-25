# MakaanX SaaS — implementation status

## Built on this development branch
- Supabase email/password signup; existing Google OAuth callback and role-aware login.
- CNIC upload/submission and restricted profile SQL migration (NOT applied).
- Live rental marketplace (/marketplace), details (/marketplace/[id]).
- Tenant application submission and application history (/dashboard/applications).
- Landlord property creation, deletion, and application decisions (/landlord/manage).
- Protected-route configuration fails closed.

## Known limitations (do not market as production-ready)
- Original dashboard and marketing pages still use demo data.
- Database migration is untested and MUST be staged and reviewed before applying.
- Supabase schema must be checked: property required fields, defaults, id types,
  applications columns and check constraints, profile role/status values.
- Role policies must enforce tenant-only applications and landlord-only property writes
  at the DATABASE layer, not only in React.
- Need safe admin identity-review API, audit trail and restricted document reading.
- Need Google-first-login role selection/onboarding.
- Need end-to-end auth, permission, signup and OAuth tests.
- Need proper storage cleanup, property image uploads, messaging, payments,
  notification delivery, property edit workflow, search/filter/pagination.
- Supabase-backed tenant and landlord overview dashboards (replacing mock activity).\n- Initial authenticated tenant inbox and message send/history pages; conversation creation and participant model pending.\n- No payment processor or AI document verification is configured; never fabricate results.
- No live Supabase changes, deployment, or production credentials are made here.

## Release gates
1. Confirm schema and existing policies with read-only SQL.
2. Apply migration to a separate staging Supabase project and validate policies.
3. Run `npm ci`, `npx tsc --noEmit`, `npm run build`, automated tests.
4. Test tenant/landlord/admin permission boundaries and OAuth.
5. Review changes in PR, merge only after tests, then deploy with rollback plan.

## Security note
Existing static UI uses fabricated properties and statistics; do not interpret
these as real user or financial data. The new routes explicitly query Supabase.

## Messaging v2 (2026-10-26)
- Read-only Supabase export confirmed zero conversations and messages.
- Draft migration adds tenant/landlord participant IDs, restrictive RLS, and authenticated conversation-start RPC.
- Tenant property details now include Message Landlord action; landlord inbox pages added.
- All chat UI requires the v2 migration; do NOT enable on production before staging tests.
- CI compilation is not equivalent to RLS or multi-user functional testing.
