-- FAIL-CLOSED OFF-SWITCH ONLY / NOT EXECUTED. Explicit approval required.
-- Disable UI first. Preserve all conversations/messages/read cursors/events.
BEGIN;
REVOKE ALL ON FUNCTION public.makaanx_chat_rate_v1(text),public.makaanx_start_conversation_v1(uuid),public.makaanx_send_message_v1(uuid,uuid,text),public.makaanx_mark_conversation_read_v1(uuid,uuid),public.makaanx_mark_notification_read_v1(uuid),public.makaanx_messaging_contract_v1() FROM PUBLIC,anon,authenticated;
COMMIT;
-- Do not restore legacy write grants/policies or drop tables/indexes blindly.
-- Read RLS remains effective. Restore only an independently reviewed exact ACL
-- baseline. Never CASCADE, delete history or remove uniqueness as UI rollback.
