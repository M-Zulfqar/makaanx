-- READ ONLY / NOT EXECUTED. Minimum cross-milestone metadata package.
-- Intended existing staging reference: ficudncgevvxsxbjscrk.
-- No identities, bodies, document paths, tokens, hashes or object payloads.
BEGIN TRANSACTION READ ONLY;
SELECT c.relname,c.relkind,c.relrowsecurity,c.relforcerowsecurity,pg_get_userbyid(c.relowner) AS owner
FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN
('profiles','properties','applications','favorites','conversations','messages','notifications','notifications_v1','conversation_reads_v1','message_requests_v1','identity_submissions_v1','identity_review_events_v1','identity_document_views_v1','property_reports') ORDER BY c.relname;
SELECT table_schema,table_name,column_name,data_type,udt_name,is_nullable,column_default FROM information_schema.columns
WHERE (table_schema='public' AND table_name IN ('profiles','properties','applications','favorites','conversations','messages','notifications','notifications_v1','conversation_reads_v1'))
OR (table_schema='storage' AND table_name='objects' AND column_name IN ('owner_id','metadata','name','bucket_id')) ORDER BY table_schema,table_name,ordinal_position;
SELECT * FROM pg_policies WHERE (schemaname='public' AND tablename IN ('profiles','properties','applications','favorites','conversations','messages','notifications','notifications_v1','conversation_reads_v1')) OR (schemaname='storage' AND tablename='objects') ORDER BY schemaname,tablename,policyname;
SELECT md5(coalesce(string_agg(row_to_json(p)::text,E'\n' ORDER BY p.tablename,p.policyname),'')) AS messaging_policy_baseline FROM pg_policies p WHERE schemaname='public' AND tablename IN ('conversations','messages');
SELECT c.relname,con.conname,pg_get_constraintdef(con.oid) AS definition FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('profiles','properties','applications','favorites','conversations','messages') ORDER BY c.relname,con.conname;
SELECT c.relname,ic.relname AS index_name,i.indisunique,i.indisvalid,i.indisready,pg_get_indexdef(i.indexrelid) AS definition FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_class ic ON ic.oid=i.indexrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relname IN ('applications','favorites','conversations','messages') ORDER BY c.relname,ic.relname;
SELECT p.oid::regprocedure AS signature,p.prosecdef,p.proconfig,pg_get_userbyid(p.proowner) AS owner,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,
 pg_get_functiondef(p.oid) AS definition FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname LIKE 'makaanx%' ORDER BY p.oid::regprocedure::text;
SELECT c.relname,t.tgname,pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE NOT t.tgisinternal AND n.nspname='public' AND c.relname IN ('profiles','applications','properties','conversations','messages') ORDER BY c.relname,t.tgname;
SELECT role, count(*) AS profile_count FROM public.profiles GROUP BY role ORDER BY role;
SELECT id,public,file_size_limit,allowed_mime_types FROM storage.buckets WHERE id='cnic-documents';
SELECT grantee,table_schema,table_name,privilege_type FROM information_schema.table_privileges WHERE table_schema IN ('public','storage') AND table_name IN ('profiles','properties','applications','favorites','conversations','messages','notifications_v1','objects') ORDER BY table_name,grantee,privilege_type;
-- Effective role checks include inherited/PUBLIC grants, unlike raw ACL rows.
SELECT r.actor,c.table_name,c.column_name,
 has_column_privilege(r.actor,format('public.%I',c.table_name),c.column_name,'INSERT') AS can_insert,
 has_column_privilege(r.actor,format('public.%I',c.table_name),c.column_name,'UPDATE') AS can_update
FROM information_schema.columns c CROSS JOIN (VALUES('anon'),('authenticated')) r(actor)
WHERE c.table_schema='public' AND ((c.table_name='profiles' AND c.column_name IN ('role','verification_status','verification_score','cnic_path','trust_score')) OR c.table_name IN ('conversations','messages','applications','favorites')) ORDER BY c.table_name,c.column_name,r.actor;
SELECT * FROM pg_publication_tables WHERE schemaname='public' AND tablename IN ('messages','conversations','notifications_v1');
COMMIT;
