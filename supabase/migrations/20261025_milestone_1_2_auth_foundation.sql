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

alter table public.profiles enable row level security;
drop policy if exists "makaanx_select_own_profile" on public.profiles;
create policy "makaanx_select_own_profile" on public.profiles
for select to authenticated using ((select auth.uid()) = id);

-- Intentionally do not allow arbitrary profile UPDATE from clients:
-- otherwise users could promote themselves to admin or approve their own CNIC.
-- Use a carefully scoped server-side endpoint for allowed profile edits.

-- Storage bucket must be PRIVATE, not public.
update storage.buckets set public = false where id = 'cnic-documents';
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
