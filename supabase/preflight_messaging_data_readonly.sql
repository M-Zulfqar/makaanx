-- READ ONLY: metadata and counts only. No message bodies or personal data.
select 'conversations_total' as metric, count(*)::bigint as value from public.conversations
union all
select 'messages_total',count(*) from public.messages
union all
select 'conversations_without_property',count(*) from public.conversations where property_id is null
union all
select 'conversations_with_property',count(*) from public.conversations where property_id is not null
union all
select 'messages_sender_not_owner',count(*)
from public.messages m join public.conversations c on c.id=m.conversation_id
where m.sender_id<>c.user_id
union all
select 'conversations_missing_property_reference',count(*)
from public.conversations c left join public.properties p on p.id=c.property_id
where c.property_id is not null and p.id is null;
