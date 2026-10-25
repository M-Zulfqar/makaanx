-- MakaanX Milestone 1.2: review in Supabase SQL Editor before applying.
-- Intended for the existing public.profiles table and private cnic-documents bucket.
-- Ensure existing profile data and policies are backed up before applying.
create or replace function public.makaanx_create_profile()
returns trigger
language plpgsql security definer
set search_path = ''
as $$
declare
  requested_role text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'tenant');
  if requested_role not in ('tenant', 'landlord') then
    requested_role := 'tenant';
  end if;
  insert into public.profiles (id, full_name, phone, role, verification_status)
  values (
    new.id,
    nullif(left(new.raw_user_meta_data ->> 'full_name', 200), ''),
    nullif(left(new.raw_user_meta_data ->> 'phone', 30), ''),
    requested_role,
    'pending'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists makaanx_auth_user_created on auth.users;
create trigger makaanx_auth_user_created
after insert on auth.users
for each row execute function public.makaanx_create_profile();

-- Existing CSV shows permissive profile INSERT, UPDATE, DELETE policies.
-- Drop them BEFORE granting narrowly scoped column-level editing.
alter table public.profiles enable row level security;
drop policy if exists profiles_insert_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;
drop policy if exists profiles_delete_own on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists makaanx_select_own_profile on public.profiles;
drop policy if exists makaanx_update_own_profile on public.profiles;

create policy makaanx_select_own_profile on public.profiles
for select to authenticated using ((select auth.uid()) = id);
create policy makaanx_update_own_profile on public.profiles
for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

-- RLS controls rows, not columns. Column GRANTs are essential.
-- Revoke table-wide writes, including grants inherited via PUBLIC.
revoke insert, update, delete on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;
-- No client may edit role, trust_score, verification_score,
-- verification_status, cnic_path or id.

-- Create a private CNIC bucket if it does not exist.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cnic-documents', 'cnic-documents', false, 10485760, array['image/jpeg', 'image/png'])
on conflict (id) do nothing;
-- Storage bucket must be PRIVATE, not public.
update storage.buckets
set public = false, file_size_limit = 10485760,
    allowed_mime_types = array['image/jpeg', 'image/png']
where id = 'cnic-documents';
-- Existing CSV also shows CNIC insert/update policies. Remove their
-- permissive OR paths before creating the stricter insert policy.
drop policy if exists cnic_documents_insert_own on storage.objects;
drop policy if exists cnic_documents_update_own on storage.objects;
drop policy if exists "makaanx_upload_own_cnic" on storage.objects;
create policy "makaanx_upload_own_cnic" on storage.objects
for insert to authenticated
with check (
  bucket_id = 'cnic-documents'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and lower(storage.extension(name)) in ('jpg', 'jpeg', 'png')
);
-- Admin review/read policies must be designed separately after checking
-- the existing policies and the desired review workflow.

-- Allow an authenticated user to submit only their own uploaded CNIC path.
-- No permission to edit role, trust score or verification approval.
create or replace function public.makaanx_submit_cnic(document_path text)
returns void
language plpgsql security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  if document_path !~ ('^' || auth.uid()::text || '/cnic-[0-9a-f-]+[.](jpg|png)$') then
    raise exception 'Invalid document path';
  end if;
  if not exists (
    select 1 from storage.objects
    where bucket_id = 'cnic-documents' and name = document_path
      and (storage.foldername(name))[1] = auth.uid()::text
  ) then
    raise exception 'Document does not exist';
  end if;
  -- A verified user cannot reset their approved status via this RPC.
  update public.profiles
  set cnic_path = document_path, verification_status = 'pending',
      verification_score = null
  where id = auth.uid()
    and coalesce(verification_status::text, '') <> 'verified';
  if not found then
    raise exception 'Profile not found or already verified';
  end if;
end;
$$;
revoke all on function public.makaanx_submit_cnic(text) from public, anon, authenticated;
grant execute on function public.makaanx_submit_cnic(text) to authenticated;

-- SECURITY REVIEW CHECKLIST (run separately before applying):
-- 1. Inspect pg_policies for profiles and storage.objects (including
--    any new policies created after the supplied CSV export).
-- 2. Inspect information_schema.role_table_grants and
--    information_schema.column_privileges for public.profiles.
-- 3. Confirm profiles columns and verification_status values/types.
-- 4. Check existing auth.users triggers to avoid duplicate provisioning.
-- 5. Confirm storage.objects ownership and storage bucket settings.
-- 6. Back up the database and test on staging first.
-- Admin verification must be performed by a trusted server-side workflow,
-- not by granting authenticated users direct verification-field updates.
