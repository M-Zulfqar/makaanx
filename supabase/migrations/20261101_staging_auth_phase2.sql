-- MakaanX STAGING ONLY — Phase 2: secure profile provisioning.
-- Prerequisite: empty staging project with Phase 1 eight tables installed.
-- Do NOT run in original MakaanX project.
-- This does not create test users, modify existing profile rows, or expose CNICs.
begin;

-- Trusted signup trigger: user metadata cannot request admin privileges,
-- trust scores, verification status, or a CNIC path.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := new.raw_user_meta_data ->> 'role';
  insert into public.profiles (id, full_name, phone, role)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'full_name', 200), ''),
    nullif(left(new.raw_user_meta_data ->> 'phone', 30), ''),
    case when requested_role in ('tenant', 'landlord')
      then requested_role else 'tenant' end
  );
  return new;
end;
$$;

-- The function is invoked by the auth.users trigger, not client RPC.
revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- Explicitly clear all broad client grants, including column-level grants.
revoke insert, update, delete on table public.profiles from public, anon, authenticated;
do $cols$
declare col record;
begin
  for col in select attname from pg_attribute
    where attrelid='public.profiles'::regclass and attnum > 0 and not attisdropped
  loop
    execute format(
      'revoke insert (%I), update (%I) on table public.profiles from public, anon, authenticated',
      col.attname, col.attname);
  end loop;
end
$cols$;

-- Only self-profile reads and harmless profile edits are exposed.
revoke select on table public.profiles from public, anon, authenticated;
grant select on table public.profiles to authenticated;
grant update (full_name, phone) on table public.profiles to authenticated;

drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);
commit;

-- Verify using supabase/verify_staging_auth_phase2_readonly.sql.
-- Test both roles and malicious role=admin signup metadata with TEST accounts.
-- Do not connect the existing production frontend to staging yet.
