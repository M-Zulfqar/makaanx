-- MakaanX staged security bundle (DRAFT / NOT APPLIED)
-- Combines trusted signup provisioning with profile column-level lockdown.
-- Run only on a backed-up staging clone after verifying trigger ownership,
-- profile constraints, RLS policies, and signup compatibility.
-- The auth.users -> public.handle_new_user trigger must already exist.
begin;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = ''
as $$
declare safe_role text;
begin
  safe_role := coalesce(new.raw_user_meta_data ->> 'role', 'tenant');
  if safe_role not in ('tenant','landlord') then safe_role := 'tenant'; end if;

  insert into public.profiles
    (id, full_name, phone, role, trust_score, verification_status)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'full_name', 200),''),
    nullif(left(new.raw_user_meta_data ->> 'phone', 30),''),
    safe_role,
    null,
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Explicitly prevent browser clients from inserting arbitrary profiles or
-- writing protected fields, including grants that existed at column level.
revoke insert, update on table public.profiles from public, anon, authenticated;
do $columns$
declare col record;
begin
  for col in select attname from pg_attribute
    where attrelid = 'public.profiles'::regclass
      and attnum > 0 and not attisdropped
  loop
    execute format(
      'revoke insert (%I), update (%I) on table public.profiles from public, anon, authenticated',
      col.attname, col.attname
    );
  end loop;
end
$columns$;

grant update (full_name, phone) on table public.profiles to authenticated;
alter table public.profiles enable row level security;

-- Existing profiles_update_own policy (or equivalent) must restrict
-- updates to auth.uid() = id. This bundle does NOT create broad policies.
commit;

-- Before production: test signup with tenant/landlord metadata, malicious
-- role=admin and trust_score metadata, self-edit name/phone, self-edit role,
-- cross-user edits, and that existing auth trigger is SECURITY DEFINER-owned.
-- Confirm status='pending' is accepted by the actual profile constraints.
-- Rerun verify_profiles_lockdown_readonly.sql and verify admin read policy.
