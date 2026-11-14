-- OWNER-PRIVATE INSPECTION ONLY, separate approval required; NOT executed live.
-- May reveal literals in definitions. Inspect privately in the selected project's
-- SQL editor; do not export, commit, paste definitions into chat, or log results.
-- Return only source hashes and conclusions about authorization/writes/dependencies.
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ READ ONLY;
SET LOCAL search_path=pg_catalog;
SET LOCAL statement_timeout='15s';
SELECT p.oid::regprocedure AS routine,pg_get_userbyid(p.proowner) AS owner,
 p.prosecdef,p.proconfig,md5(p.prosrc) AS body_hash,pg_get_functiondef(p.oid) AS private_definition
FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
WHERE p.prokind='f' AND ((n.nspname='public' AND p.proname IN('makaanx_submit_cnic','handle_new_user'))
 OR (n.nspname='auth' AND p.proname='uid')
 OR p.oid IN(SELECT tgfoid FROM pg_trigger WHERE NOT tgisinternal
   AND tgrelid IN('auth.users'::regclass,'public.profiles'::regclass)))
ORDER BY p.oid::regprocedure::text;
-- Privately inspect any other writer/dynamic routine/event trigger flagged by
-- the metadata inventory before approval. No blanket body dump is provided.
COMMIT;
