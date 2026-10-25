-- MakaanX two-party messaging migration
-- DRAFT: apply on staging only after core security migration is verified.
-- Preflight 2026-10-26: conversations=0, messages=0.
begin;

alter table public.conversations
  add column if not exists tenant_id uuid references auth.users(id) on delete cascade,
  add column if not exists landlord_id uuid references auth.users(id) on delete cascade;

-- No historical conversations exist. Future rows require both participants.
alter table public.conversations
  alter column tenant_id set not null,
  alter column landlord_id set not null,
  alter column property_id set not null;

alter table public.conversations
  add constraint makaanx_distinct_chat_participants check (tenant_id <> landlord_id);

create unique index if not exists makaanx_conversation_property_tenant_unique
  on public.conversations (property_id, tenant_id);
create index if not exists makaanx_conversations_landlord_idx
  on public.conversations (landlord_id, last_message_at desc);
create index if not exists makaanx_messages_conversation_time_idx
  on public.messages (conversation_id, created_at desc);

-- Existing policies must be dropped; permissive policies are combined by OR.
drop policy if exists conversations_insert_own on public.conversations;
drop policy if exists conversations_select_own on public.conversations;
drop policy if exists conversations_update_own on public.conversations;
drop policy if exists messages_insert_own on public.messages;
drop policy if exists messages_select_own on public.messages;
drop policy if exists makaanx_conversations_select_participants on public.conversations;
drop policy if exists makaanx_messages_select_participants on public.messages;
drop policy if exists makaanx_messages_insert_participants on public.messages;

alter table public.conversations enable row level security;
alter table public.messages enable row level security;

create policy makaanx_conversations_select_participants
on public.conversations for select to authenticated
using ((select auth.uid()) in (tenant_id, landlord_id));

create policy makaanx_messages_select_participants
on public.messages for select to authenticated
using (exists (
  select 1 from public.conversations c
  where c.id = messages.conversation_id
    and (select auth.uid()) in (c.tenant_id, c.landlord_id)
));

create policy makaanx_messages_insert_participants
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and char_length(trim(body)) between 1 and 3000
  and attachment_path is null and attachment_name is null and attachment_type is null
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (select auth.uid()) in (c.tenant_id, c.landlord_id)
  )
);

-- Conversation creation must happen through the validated RPC only.
revoke insert, update, delete, truncate on public.conversations from public, anon, authenticated;
revoke update, delete, truncate on public.messages from public, anon, authenticated;
-- Existing column grants can survive table-level revoke.
do $revoke_chat_columns$
declare t text; c record;
begin
  foreach t in array array['conversations','messages'] loop
    for c in select attname from pg_attribute
      where attrelid = format('public.%I', t)::regclass
        and attnum > 0 and not attisdropped
    loop
      execute format('revoke update (%I), delete, insert (%I) on public.%I from public, anon, authenticated',
        c.attname, c.attname, t);
    end loop;
  end loop;
end;
$revoke_chat_columns$;
grant select on public.conversations, public.messages to authenticated;
grant insert (conversation_id, sender_id, body) on public.messages to authenticated;

-- SECURITY DEFINER must be owned by a trusted database owner.
create or replace function public.makaanx_start_conversation(target_property uuid)
returns uuid language plpgsql security definer set search_path = ''
as $$
declare
  caller uuid := auth.uid();
  owner_id uuid;
  chat_id uuid;
begin
  if caller is null then raise exception 'Sign in required'; end if;
  if not exists (
    select 1 from public.profiles p where p.id = caller and p.role = 'tenant'
  ) then raise exception 'Only tenants may start conversations'; end if;

  select p.landlord_id into owner_id
  from public.properties p where p.id = target_property;
  if owner_id is null then raise exception 'Property not found'; end if;
  if owner_id = caller then raise exception 'Cannot message yourself'; end if;
  if not exists (
    select 1 from public.profiles p where p.id = owner_id and p.role = 'landlord'
  ) then raise exception 'Property landlord is not eligible'; end if;

  insert into public.conversations
    (id, user_id, tenant_id, landlord_id, property_id,
     participant_name, participant_role, last_message_at)
  values
    (gen_random_uuid(), caller, caller, owner_id, target_property,
     'Landlord', 'landlord', now())
  on conflict (property_id, tenant_id) do nothing;

  select id into chat_id from public.conversations
  where property_id = target_property and tenant_id = caller;
  if chat_id is null then raise exception 'Could not create conversation'; end if;
  return chat_id;
end;
$$;
revoke all on function public.makaanx_start_conversation(uuid) from public, anon, authenticated;
grant execute on function public.makaanx_start_conversation(uuid) to authenticated;

commit;

-- Staging tests required: tenant starts chat, landlord sees it, both send,
-- unrelated tenant/landlord cannot read or send, anon cannot access,
-- users cannot edit participant columns, duplicates return same chat ID.
-- Do not apply to live DB without review of schema, grants, and backups.
