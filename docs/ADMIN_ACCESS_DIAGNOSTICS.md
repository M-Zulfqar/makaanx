# Administrator access diagnostics (read only)

Expected staging reference supplied by the owner: `ficudncgevvxsxbjscrk`.
This document replaces the earlier assumption that the administrator policy is
absent. The owner has observed six profiles (one admin, one landlord, four tenants),
the zero-argument helper owned by postgres with SECURITY DEFINER and authenticated
EXECUTE, no anon EXECUTE, protected profile columns, and an admin SELECT policy
alongside own-read/own-update policies. A refreshed app session still sees one row.
These are owner-reported observations, not a database inspection executed here.

## Application check

On an already running build with the intended Supabase public configuration, sign
in with the existing administrator account and visit `/auth/diagnostics`. Click
**Run read-only diagnostics**. No account is created and no profile, policy,
permission or storage object is modified. The browser and cookie-bound server
perform the same checks independently using their existing public clients.
No page navigation automatically executes the diagnostic. No diagnostic logging
was added. Normal session validation may refresh authentication cookies.

Each side reports exactly:

- `projectReference`: parsed from its configured HTTPS Supabase project hostname;
  null for an unrecognizable/custom hostname. No URL path, key or credentials.
- `authenticatedRole`: the verified JWT's PostgreSQL/API role, normally
  `authenticated`. This is **not** the application's `profiles.role` value `admin`.
- `adminRpcResult`: true/false from existing `makaanx_is_admin()`, null on failure.
- `accessibleProfileCount`: exact HEAD count under that same client's RLS, null on
  failure. No profile rows are fetched for the count.
- `errorCodes`: bounded machine codes only; SDK messages/details are discarded.

JWTs are verified using the SDK, never printed or trusted after an unverified
base64 decode. Issuer-project mismatch prevents further queries. No JWT subject,
email, profile role/name, cookie/token, CNIC path or document is returned. A valid
`getUser()` result is required before invoking the helper/count. The server returns
401 for an unauthenticated session and marks all diagnostic responses private,
no-store and Cookie-varying. The diagnostic page is excluded from indexing.
The endpoint deliberately does not require the admin helper to return true:
that false result is necessary evidence, and nonadmins receive only their own
existing RLS-scoped count and helper result, with no increased access.

Do not enable a deployment to run this check without owner approval. On an existing
approved runtime, inspect these five fields rather than exporting browser storage,
request headers or network traces containing tokens.

## Interpretation

| Evidence | Next read-only investigation |
| --- | --- |
| Either project reference differs from `ficudncgevvxsxbjscrk` | Correct environment selection/build configuration. Next embeds `NEXT_PUBLIC_*` values at build time; verify deployment scope and the actual running build. Updating a variable without an approved rebuild does not change the current bundle. |
| Browser and server references differ | Compare the public configuration used at build/runtime; do not copy keys into reports. |
| Auth/claims error, unexpected JWT role or issuer mismatch | Inspect login/session lifecycle and project consistency. Do not paste tokens or manually forge claims. |
| Correct project; browser helper true but server helper false, or vice versa | The two clients may have different/stale sessions. Verify normal sign-out/sign-in in the intended build; review cookie propagation and client initialization. Do not conclude that policy metadata is wrong from this alone. |
| Helper false, one row | Inspect exact helper definition and function overload/default arguments. Confirm in the trusted environment that the existing session corresponds to the intended administrator and its stored role. The diagnostic intentionally omits identity data. |
| Helper true, one row | Inspect actual policy expression/TO roles/command, restrictive policies, RLS/FORCE flags, relation kind, schema and inherited-role permissions. A policy name alone does not establish its behavior. |
| Helper true, six rows but directory one | Inspect the current directory request, deployed revision, caching, query filters/pagination and UI. The repository directory query has no own-id filter. |
| RPC/count error codes | Resolve that specific permission/function/schema/API error. Null is not zero. `PGRST202` suggests function discovery/signature; `42501` indicates privilege denial. |

If the same project/session yields helper=true and a genuinely applicable
permissive SELECT policy is exactly `makaanx_is_admin()`, with no restrictive
policy excluding rows, that helper should admit all six profiles. A one-row count
then contradicts those assumptions: collect matched runtime and metadata evidence
before changing SQL. Do not stack another permissive admin policy as a guess.

## Metadata scripts

`supabase/diagnose_admin_policy_readonly.sql` runs inside a READ ONLY transaction.
It selects policy definitions (including restrictive/permissive), exact function
signatures/definitions/ownership/search-path settings and effective privileges;
it does not select profile identities or documents. Execute only against the
intended existing project. The source was reviewed here; it was **not executed**.

`supabase/diagnose_admin_session_readonly.sql` provides aggregate checks for an
already authenticated SQL session. It does not forge claims or change roles.
The Supabase SQL editor generally uses postgres without the app JWT: its six-row
count does not reproduce the administrator's browser authorization. Prefer the
application check for the actual browser and cookie-bound sessions. Inspect the
existing helper definition before running it; these scripts create no functions.

Any policy/grant/function migration still requires explicit approval and a
separately reviewed repair based on the resulting evidence.
