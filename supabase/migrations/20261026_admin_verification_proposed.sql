-- MakaanX administrator verification migration -- DRAFT, NOT APPLIED.
-- REQUIRED FIRST: apply/test the profile grant hardening in
-- 20261025_milestone_1_2_auth_foundation.sql on a staging clone.
-- This migration assumes profiles.role cannot be self-assigned by clients.
-- Source: admin preflight export, 19 rows, 2026-10-26.
-- No automatic AI approval: decisions are human-reviewed.
--
-- NOTE: verify the allowed verification_status values and current
-- storage.objects grants before deploying. Existing policies are permissive.
begin;

create table if not exists public.identity_review_audit (
  id bigint generated always as identity primary key,
  profile_id uuid not null references auth.users(id),
  reviewer_id uuid not null references auth.users(id),
  old_status text not null,
  new_status text not null,
  reason text not null,
  reviewed_at timestamptz not null default now()
);
alter table public.identity_review_audit enable row level security;
revoke all on public.identity_review_audit from public, anon, authenticated;

-- Security-definer helper avoids recursive RLS when checking admin role.
create or replace function public.makaanx_is_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role = 'admin'
  );
$$;
revoke all on function public.makaanx_is_admin() from public, anon, authenticated;
grant execute on function public.makaanx_is_admin() to authenticated;

drop policy if exists makaanx_admin_read_profiles on public.profiles;
create policy makaanx_admin_read_profiles on public.profiles
for select to authenticated using (public.makaanx_is_admin());

-- Do not grant clients profile role/verification field UPDATE.
-- The only approval/rejection write path is the privileged function.
create or replace function public.makaanx_review_identity(
  target_user uuid,
  decision text,
  review_reason text
) returns void
language plpgsql security definer
set search_path = ''
as $$
declare
  previous_status text;
begin
  if not public.makaanx_is_admin() then
    raise exception 'Administrator privileges required';
  end if;
  if decision not in ('verified','rejected') then
    raise exception 'Invalid verification decision';
  end if;
  if length(btrim(coalesce(review_reason,''))) < 10
     or length(review_reason) > 1000 then
    raise exception 'Review reason must be 10-1000 characters';
  end if;
  if target_user = auth.uid() then
    raise exception 'Reviewing your own identity is not permitted';
  end if;
  select verification_status into previous_status
  from public.profiles
  where id = target_user and role in ('tenant','landlord')
  for update;
  if not found then raise exception 'Eligible profile not found'; end if;
  if previous_status <> 'pending' then
    raise exception 'Only pending identities can be reviewed';
  end if;
  if decision = 'verified' and not exists (
    select 1 from public.profiles p
    join storage.objects o
      on o.bucket_id = 'cnic-documents' and o.name = p.cnic_path
    where p.id = target_user
  ) then
    raise exception 'No uploaded CNIC document exists';
  end if;
  update public.profiles set verification_status = decision
  where id = target_user;
  insert into public.identity_review_audit
    (profile_id, reviewer_id, old_status, new_status, reason)
  values (target_user, auth.uid(), previous_status, decision, btrim(review_reason));
end;
$$;
revoke all on function public.makaanx_review_identity(uuid,text,text)
from public, anon, authenticated;
grant execute on function public.makaanx_review_identity(uuid,text,text)
to authenticated;

drop policy if exists makaanx_admin_read_identity_audit
on public.identity_review_audit;
create policy makaanx_admin_read_identity_audit
on public.identity_review_audit for select to authenticated
using (public.makaanx_is_admin());
grant select on public.identity_review_audit to authenticated;

-- Admin document SELECT access only, never public CNIC exposure.
drop policy if exists makaanx_admin_read_cnic
on storage.objects;
create policy makaanx_admin_read_cnic on storage.objects
for select to authenticated
using (bucket_id = 'cnic-documents' and public.makaanx_is_admin());

commit;

-- STAGING SECURITY GATES:
-- 1. User cannot set role=admin or verification_status=verified.
-- 2. Tenant/landlord cannot execute review RPC.
-- 3. Admin can review another user's pending identity exactly once.
-- 4. Rejected/verified identities cannot be reviewed again.
-- 5. Review writes immutable audit record with reason and reviewer.
-- 6. Anonymous users cannot view private CNIC files.
-- 7. Admin CNIC SELECT only; public bucket remains private.
-- 8. Check all existing permissive storage and profile policies.
-- 9. Verify allowed verification_status values before any deployment.
