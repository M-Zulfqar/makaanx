-- PROPOSAL ONLY / NOT EXECUTED. Explicit owner approval + isolated acceptance.
-- Upgrade existing two-party tables; NOT a replacement or historical data reset.
-- Historical messaging-v2 is an alternative baseline, not a prerequisite to apply
-- blindly. Unknown schema/policies/functions/FK actions require reconciliation.
BEGIN;
SET LOCAL lock_timeout='5s';
DO $$
DECLARE expected_policy_baseline text:='REVIEW_REQUIRED'; actual text;
BEGIN
 SELECT md5(coalesce(string_agg(row_to_json(p)::text,E'\n' ORDER BY p.tablename,p.policyname),'')) INTO actual
 FROM pg_policies p WHERE schemaname='public' AND tablename IN ('conversations','messages');
 IF expected_policy_baseline='REVIEW_REQUIRED' OR expected_policy_baseline<>actual THEN RAISE EXCEPTION 'Reviewed messaging policy baseline required'; END IF;
 IF EXISTS(SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename IN ('conversations','messages') AND (tablename,policyname) NOT IN
 (('conversations','conversations_insert_own'),('conversations','conversations_select_own'),('conversations','conversations_update_own'),('messages','messages_insert_own'),('messages','messages_select_own'),('conversations','makaanx_conversations_select_participants'),('messages','makaanx_messages_select_participants'),('messages','makaanx_messages_insert_participants')))
 THEN RAISE EXCEPTION 'Unknown messaging policies require review'; END IF;
 IF EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN
 ('notifications','notifications_v1','conversation_reads_v1','message_requests_v1','messaging_rate_windows_v1'))
 OR EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname IN
 ('makaanx_messaging_contract_v1','makaanx_start_conversation_v1','makaanx_send_message_v1','makaanx_mark_conversation_read_v1','makaanx_mark_notification_read_v1','makaanx_chat_rate_v1'))
 THEN RAISE EXCEPTION 'Existing notification/v1 objects require reconciliation'; END IF;
 IF EXISTS(SELECT 1 FROM pg_constraint WHERE conrelid IN ('public.conversations'::regclass,'public.messages'::regclass) AND contype='f' AND confdeltype IN ('c','n','d'))
 THEN RAISE EXCEPTION 'Destructive history FK actions require a separate reviewed repair'; END IF;
 IF EXISTS(SELECT 1 FROM public.conversations c LEFT JOIN public.profiles t ON t.id=c.tenant_id LEFT JOIN public.profiles l ON l.id=c.landlord_id
  WHERE c.tenant_id IS NULL OR c.landlord_id IS NULL OR c.property_id IS NULL OR c.tenant_id=c.landlord_id OR t.role IS DISTINCT FROM 'tenant' OR l.role IS DISTINCT FROM 'landlord')
 THEN RAISE EXCEPTION 'Invalid participant history requires reconciliation without deletion'; END IF;
 IF EXISTS(SELECT 1 FROM public.messages m LEFT JOIN public.conversations c ON c.id=m.conversation_id WHERE c.id IS NULL OR m.sender_id IS NULL
  OR m.sender_id NOT IN(c.tenant_id,c.landlord_id) OR m.created_at IS NULL OR NOT isfinite(m.created_at) OR m.body IS NULL OR char_length(btrim(m.body)) NOT BETWEEN 1 AND 3000 OR octet_length(m.body)>12000)
 THEN RAISE EXCEPTION 'Invalid message history requires reconciliation'; END IF;
 IF EXISTS(SELECT 1 FROM public.conversations GROUP BY property_id,tenant_id HAVING count(*)>1)
 THEN RAISE EXCEPTION 'Duplicate conversations require reviewed preservation plan'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(ARRAY['role','verification_status','verification_score','cnic_path','trust_score']) col WHERE has_column_privilege('authenticated','public.profiles',col,'UPDATE') OR has_column_privilege('authenticated','public.profiles',col,'INSERT') OR has_column_privilege('anon','public.profiles',col,'UPDATE') OR has_column_privilege('anon','public.profiles',col,'INSERT'))
 THEN RAISE EXCEPTION 'Stored roles must be protected first'; END IF;
 -- Reuse any equivalent valid/ready full unique key; never duplicate an index.
 IF NOT EXISTS(SELECT 1 FROM pg_index i WHERE i.indrelid='public.conversations'::regclass AND i.indisunique AND i.indisvalid AND i.indisready AND i.indpred IS NULL AND i.indexprs IS NULL AND i.indnkeyatts=2
  AND ARRAY(SELECT a.attname::text FROM unnest(i.indkey) WITH ORDINALITY k(attnum,ord) JOIN pg_attribute a ON a.attrelid=i.indrelid AND a.attnum=k.attnum WHERE k.ord<=i.indnkeyatts ORDER BY a.attname)=ARRAY['property_id','tenant_id'])
 THEN
  IF to_regclass('public.makaanx_conversation_pair_v1') IS NOT NULL THEN RAISE EXCEPTION 'Index name conflict'; END IF;
  CREATE UNIQUE INDEX makaanx_conversation_pair_v1 ON public.conversations(property_id,tenant_id);
 END IF;
END $$;
-- Other required baseline review: UUID primary keys, timestamptz message times,
-- expected nullable/default legacy columns, immutable participant/owner keys,
-- no hostile triggers/alternate privileged writers and trusted function owner.
-- Do not change existing owner/participants/FKs or remove historical messages.
CREATE TABLE public.conversation_reads_v1(
 conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE RESTRICT,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 last_read_at timestamptz NOT NULL,last_read_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE RESTRICT,
 PRIMARY KEY(conversation_id,user_id)
);
CREATE TABLE public.message_requests_v1(
 sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,request_id uuid NOT NULL,
 message_id uuid NOT NULL UNIQUE REFERENCES public.messages(id) ON DELETE RESTRICT,
 PRIMARY KEY(sender_id,request_id)
);
CREATE TABLE public.messaging_rate_windows_v1(
 actor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 kind text NOT NULL CHECK(kind IN ('start','send')),window_start timestamptz NOT NULL,used integer NOT NULL CHECK(used>0),
 PRIMARY KEY(actor_id,kind,window_start)
);
CREATE TABLE public.notifications_v1(
 id uuid PRIMARY KEY DEFAULT pg_catalog.gen_random_uuid(),recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 event_type text NOT NULL CHECK(event_type='new_message'),
 conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE RESTRICT,
 message_id uuid NOT NULL REFERENCES public.messages(id) ON DELETE RESTRICT,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),read_at timestamptz,
 UNIQUE(event_type,message_id,recipient_id)
);
CREATE INDEX notifications_v1_recipient_time ON public.notifications_v1(recipient_id,created_at DESC,id DESC);
CREATE INDEX notifications_v1_unread ON public.notifications_v1(recipient_id) WHERE read_at IS NULL;
-- Verify no equivalent existing message history index before scheduling this
-- optional index separately: (conversation_id,created_at DESC,id DESC).
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_reads_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_requests_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messaging_rate_windows_v1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications_v1 ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.conversations,public.messages,public.conversation_reads_v1,public.message_requests_v1,public.messaging_rate_windows_v1,public.notifications_v1 FROM PUBLIC,anon,authenticated;
DO $$ DECLARE t text;c record;f record; BEGIN
 FOREACH t IN ARRAY ARRAY['conversations','messages'] LOOP
  FOR c IN SELECT attname FROM pg_attribute WHERE attrelid=format('public.%I',t)::regclass AND attnum>0 AND NOT attisdropped LOOP
   EXECUTE format('REVOKE INSERT(%I), UPDATE(%I), REFERENCES(%I), SELECT(%I) ON public.%I FROM PUBLIC,anon,authenticated',c.attname,c.attname,c.attname,c.attname,t);
  END LOOP;
 END LOOP;
 FOR f IN SELECT p.oid::regprocedure AS signature FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='makaanx_start_conversation' LOOP
  EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC,anon,authenticated',f.signature);
  IF has_function_privilege('authenticated',f.signature::oid,'EXECUTE') OR has_function_privilege('anon',f.signature::oid,'EXECUTE') THEN RAISE EXCEPTION 'Inherited legacy EXECUTE requires reconciliation'; END IF;
 END LOOP;
END $$;
DROP POLICY IF EXISTS conversations_insert_own ON public.conversations;
DROP POLICY IF EXISTS conversations_select_own ON public.conversations;
DROP POLICY IF EXISTS conversations_update_own ON public.conversations;
DROP POLICY IF EXISTS messages_insert_own ON public.messages;
DROP POLICY IF EXISTS messages_select_own ON public.messages;
DROP POLICY IF EXISTS makaanx_conversations_select_participants ON public.conversations;
DROP POLICY IF EXISTS makaanx_messages_select_participants ON public.messages;
DROP POLICY IF EXISTS makaanx_messages_insert_participants ON public.messages;
CREATE POLICY conversation_participants_v1 ON public.conversations FOR SELECT TO authenticated USING((SELECT auth.uid()) IN(tenant_id,landlord_id));
CREATE POLICY message_participants_v1 ON public.messages FOR SELECT TO authenticated USING(EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=messages.conversation_id));
CREATE POLICY conversation_reads_own_v1 ON public.conversation_reads_v1 FOR SELECT TO authenticated USING(user_id=(SELECT auth.uid()) AND EXISTS(SELECT 1 FROM public.conversations c WHERE c.id=conversation_reads_v1.conversation_id));
CREATE POLICY notifications_recipient_v1 ON public.notifications_v1 FOR SELECT TO authenticated USING(recipient_id=(SELECT auth.uid()));
GRANT SELECT(id,tenant_id,landlord_id,property_id,last_message_at) ON public.conversations TO authenticated;
GRANT SELECT(id,conversation_id,sender_id,body,created_at) ON public.messages TO authenticated;
GRANT SELECT ON public.conversation_reads_v1,public.notifications_v1 TO authenticated;
-- No direct mutation grant; sender/recipient/read cursor cannot be forged.
CREATE FUNCTION public.makaanx_chat_rate_v1(request_kind text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE amount integer; BEGIN
 INSERT INTO public.messaging_rate_windows_v1(actor_id,kind,window_start,used) VALUES(auth.uid(),request_kind,date_trunc('minute',clock_timestamp()),1)
 ON CONFLICT(actor_id,kind,window_start) DO UPDATE SET used=public.messaging_rate_windows_v1.used+1 RETURNING used INTO amount;
 IF amount>10 THEN RAISE EXCEPTION 'Rate limited' USING ERRCODE='P0001'; END IF;
END $$;
CREATE FUNCTION public.makaanx_start_conversation_v1(target_property uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE caller uuid:=auth.uid();owner uuid;chat_id uuid;existing_owner uuid; BEGIN
 IF caller IS NULL THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=caller AND role='tenant' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT landlord_id INTO owner FROM public.properties WHERE id=target_property AND status='vacant' FOR SHARE;
 IF owner IS NULL OR owner=caller OR NOT EXISTS(SELECT 1 FROM public.profiles WHERE id=owner AND role='landlord') THEN RAISE EXCEPTION 'Unavailable property' USING ERRCODE='42501'; END IF;
 SELECT id,landlord_id INTO chat_id,existing_owner FROM public.conversations WHERE property_id=target_property AND tenant_id=caller FOR UPDATE;
 IF FOUND THEN
  IF existing_owner<>owner THEN RAISE EXCEPTION 'Ownership changed; history retained' USING ERRCODE='40001'; END IF;
  RETURN chat_id;
 END IF;
 PERFORM public.makaanx_chat_rate_v1('start');
 INSERT INTO public.conversations(id,user_id,tenant_id,landlord_id,property_id,participant_name,participant_role,last_message_at)
 VALUES(pg_catalog.gen_random_uuid(),caller,caller,owner,target_property,'Landlord','landlord',clock_timestamp())
 ON CONFLICT(property_id,tenant_id) DO NOTHING RETURNING id INTO chat_id;
 IF chat_id IS NULL THEN SELECT id INTO chat_id FROM public.conversations WHERE property_id=target_property AND tenant_id=caller AND landlord_id=owner; END IF;
 IF chat_id IS NULL THEN RAISE EXCEPTION 'Retry conversation' USING ERRCODE='40001'; END IF;
 RETURN chat_id;
END $$;
CREATE FUNCTION public.makaanx_send_message_v1(chat uuid,request uuid,message_body text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE caller uuid:=auth.uid();c public.conversations%ROWTYPE;previous public.messages%ROWTYPE;message_id uuid:=pg_catalog.gen_random_uuid();sent_at timestamptz;recipient uuid; BEGIN
 IF caller IS NULL THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 IF request IS NULL OR chat IS NULL OR message_body IS NULL OR char_length(btrim(message_body)) NOT BETWEEN 1 AND 3000 OR octet_length(btrim(message_body))>12000 THEN RAISE EXCEPTION 'Invalid message' USING ERRCODE='22023'; END IF;
 PERFORM 1 FROM public.profiles WHERE id=caller AND role IN('tenant','landlord') FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO c FROM public.conversations WHERE id=chat FOR UPDATE;
 IF NOT FOUND OR caller NOT IN(c.tenant_id,c.landlord_id) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT m.* INTO previous FROM public.message_requests_v1 r JOIN public.messages m ON m.id=r.message_id WHERE r.sender_id=caller AND r.request_id=request;
 IF FOUND THEN
  IF previous.conversation_id IS DISTINCT FROM chat OR previous.body IS DISTINCT FROM btrim(message_body) THEN RAISE EXCEPTION 'Request reused' USING ERRCODE='22023'; END IF;
  RETURN previous.id;
 END IF;
 PERFORM public.makaanx_chat_rate_v1('send');
 -- Chat lock serializes commits; monotonic time avoids late arrivals behind an
 -- acknowledged cursor. All alternative/direct message writers must be revoked.
 SELECT greatest(clock_timestamp(),coalesce(max(created_at)+interval '1 microsecond',clock_timestamp())) INTO sent_at FROM public.messages WHERE conversation_id=chat;
 INSERT INTO public.messages(id,conversation_id,sender_id,body,created_at) VALUES(message_id,chat,caller,btrim(message_body),sent_at);
 INSERT INTO public.message_requests_v1(sender_id,request_id,message_id) VALUES(caller,request,message_id);
 UPDATE public.conversations SET last_message_at=sent_at WHERE id=chat;
 recipient:=CASE WHEN caller=c.tenant_id THEN c.landlord_id ELSE c.tenant_id END;
 INSERT INTO public.notifications_v1(recipient_id,event_type,conversation_id,message_id,created_at) VALUES(recipient,'new_message',chat,message_id,sent_at);
 RETURN message_id;
END $$;
CREATE FUNCTION public.makaanx_mark_conversation_read_v1(chat uuid,through_message uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
DECLARE caller uuid:=auth.uid();at_time timestamptz;c public.conversations%ROWTYPE; BEGIN
 IF caller IS NULL THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT * INTO c FROM public.conversations WHERE id=chat FOR UPDATE;
 IF NOT FOUND OR caller NOT IN(c.tenant_id,c.landlord_id) THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 SELECT created_at INTO at_time FROM public.messages WHERE id=through_message AND conversation_id=chat;
 IF at_time IS NULL THEN RAISE EXCEPTION 'Invalid cursor' USING ERRCODE='22023'; END IF;
 INSERT INTO public.conversation_reads_v1(conversation_id,user_id,last_read_at,last_read_id) VALUES(chat,caller,at_time,through_message)
 ON CONFLICT(conversation_id,user_id) DO UPDATE SET last_read_at=excluded.last_read_at,last_read_id=excluded.last_read_id
 WHERE (public.conversation_reads_v1.last_read_at,public.conversation_reads_v1.last_read_id)<(excluded.last_read_at,excluded.last_read_id);
 RETURN true;
END $$;
CREATE FUNCTION public.makaanx_mark_notification_read_v1(notification uuid) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path='' AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authorized' USING ERRCODE='42501'; END IF;
 UPDATE public.notifications_v1 SET read_at=coalesce(read_at,clock_timestamp()) WHERE id=notification AND recipient_id=auth.uid();RETURN FOUND;
END $$;
CREATE FUNCTION public.makaanx_messaging_contract_v1() RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path='' AS $$
 SELECT CASE WHEN auth.uid() IS NOT NULL THEN 'messaging-notifications-v1' ELSE NULL END;
$$;
REVOKE ALL ON FUNCTION public.makaanx_chat_rate_v1(text),public.makaanx_start_conversation_v1(uuid),public.makaanx_send_message_v1(uuid,uuid,text),public.makaanx_mark_conversation_read_v1(uuid,uuid),public.makaanx_mark_notification_read_v1(uuid),public.makaanx_messaging_contract_v1() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.makaanx_start_conversation_v1(uuid),public.makaanx_send_message_v1(uuid,uuid,text),public.makaanx_mark_conversation_read_v1(uuid,uuid),public.makaanx_mark_notification_read_v1(uuid),public.makaanx_messaging_contract_v1() TO authenticated;
COMMIT;
-- No Realtime publication change, external delivery or application/identity event
-- trigger is installed. Only confirmed new-message events create notifications.
-- Do not prune request mappings independently of retained messages; that could
-- reopen duplicate sends on old retries. Retention requires a reviewed policy.
