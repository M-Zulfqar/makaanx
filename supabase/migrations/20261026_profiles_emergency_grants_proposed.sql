-- MakaanX SECURITY HOTFIX: proposed, not applied.
-- Evidence: 2026-10-26 grant preflight (43 rows) confirms anon and
-- authenticated have table-wide INSERT/UPDATE on public.profiles.
-- Review on a staging clone first; back up and coordinate deployment.
-- This script changes privileges, not profile records or RLS policies.
-- Run with a privileged database migration owner.
begin;

-- RLS does not restrict which columns may be updated. Revoke table grants.
revoke insert, update on table public.profiles from PUBLIC, anon, authenticated;

-- Explicit column privileges survive a table-wide revoke.
do $$
declare col record;
begin
  for col in
    select attname from pg_attribute
    where attrelid='public.profiles'::regclass
      and attnum>0 and not attisdropped
  loop
    execute format(
      'revoke insert (%I), update (%I) on table public.profiles from PUBLIC, anon, authenticated',
      col.attname,col.attname
    );
  end loop;
end $$;

-- Profile creation remains the responsibility of the trusted
-- auth.users trigger (public.handle_new_user, SECURITY DEFINER).
-- Client profile edits are restricted to non-privileged fields.
grant update (full_name, phone) on table public.profiles to authenticated;

-- Keep profile row-level security enabled. Existing self-update policy
-- may still allow changes to the two permitted columns only.
alter table public.profiles enable row level security;
commit;

-- AFTER APPLYING ON STAGING:
-- 1. Rerun supabase/verify_admin_security_readonly.sql.
-- 2. Ensure NO anon INSERT/UPDATE privileges and NO authenticated INSERT.
-- 3. Ensure authenticated UPDATE exists ONLY for full_name and phone.
-- 4. Test signup trigger still provisions profiles.
-- 5. Test user can edit their own name/phone, but not role/status/score.
-- 6. Test cross-account updates are rejected.
-- 7. Inspect inherited grants and all roles before production deployment.
-- This hotfix alone does not fix untrusted signup metadata: separately
-- apply/test the hardened handle_new_user() function.
