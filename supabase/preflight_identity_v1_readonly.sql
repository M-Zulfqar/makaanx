-- READ ONLY / NOT EXECUTED. No profile identities, object names or bytes.
-- Use intended staging project ficudncgevvxsxbjscrk; pair with /auth/diagnostics.
BEGIN TRANSACTION READ ONLY;
SELECT table_schema,table_name,column_name,data_type,udt_name,is_nullable,column_default
FROM information_schema.columns WHERE (table_schema='public' AND table_name IN ('profiles','identity_review_audit','identity_verification_reviews','identity_submissions_v1','identity_review_events_v1','identity_document_views_v1'))
 OR (table_schema='storage' AND table_name='objects' AND column_name IN ('owner_id','metadata','name','bucket_id'))
ORDER BY table_schema,table_name,ordinal_position;
SELECT id,public,file_size_limit,allowed_mime_types FROM storage.buckets WHERE id='cnic-documents';
SELECT * FROM pg_policies WHERE (schemaname='storage' AND tablename='objects')
 OR (schemaname='public' AND tablename IN ('profiles','identity_review_audit','identity_verification_reviews','identity_submissions_v1','identity_review_events_v1','identity_document_views_v1')) ORDER BY schemaname,tablename,policyname;
SELECT md5(coalesce(string_agg(row_to_json(p)::text,E'\n' ORDER BY p.policyname),'')) AS storage_policy_baseline
FROM pg_policies p WHERE schemaname='storage' AND tablename='objects';
SELECT p.oid::regprocedure AS signature,pg_get_userbyid(p.proowner) AS owner,p.prosecdef,p.proconfig,
 has_function_privilege('authenticated',p.oid,'EXECUTE') AS authenticated_execute,
 has_function_privilege('anon',p.oid,'EXECUTE') AS anon_execute,pg_get_functiondef(p.oid) AS definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND (p.proname LIKE 'makaanx%identity%' OR p.proname IN ('makaanx_submit_cnic','makaanx_is_admin')) ORDER BY p.oid::regprocedure::text;
SELECT grantee,table_schema,table_name,privilege_type FROM information_schema.table_privileges
WHERE table_schema IN ('public','storage') AND table_name IN ('profiles','objects','identity_review_audit','identity_verification_reviews') ORDER BY table_name,grantee,privilege_type;
SELECT col,has_column_privilege('authenticated','public.profiles',col,'UPDATE') AS authenticated_update,
 has_column_privilege('anon','public.profiles',col,'UPDATE') AS anon_update,
 has_column_privilege('authenticated','public.profiles',col,'INSERT') AS authenticated_insert,
 has_column_privilege('anon','public.profiles',col,'INSERT') AS anon_insert
FROM unnest(ARRAY['role','cnic_path','verification_status','verification_score','trust_score']) col;
SELECT n.nspname,c.relname,t.tgname,pg_get_triggerdef(t.oid) AS definition FROM pg_trigger t
JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace
WHERE NOT t.tgisinternal AND ((n.nspname='public' AND c.relname='profiles') OR (n.nspname='storage' AND c.relname='objects'));
SELECT conrelid::regclass AS relation,conname,pg_get_constraintdef(oid) AS definition FROM pg_constraint
WHERE conrelid IN ('public.profiles'::regclass,'storage.objects'::regclass);
SELECT nspname,has_schema_privilege('authenticated',oid,'CREATE') AS authenticated_create,
 has_schema_privilege('anon',oid,'CREATE') AS anon_create FROM pg_namespace WHERE nspname IN ('public','storage');
COMMIT;
