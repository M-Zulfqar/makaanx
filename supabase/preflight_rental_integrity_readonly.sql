-- READ ONLY / not executed. Complements preflight_core_rental_readonly.sql.
-- No identities, property addresses, user tokens or document paths are selected.
BEGIN TRANSACTION READ ONLY;
SELECT c.relname AS table_name, con.conname, con.contype,
       con.confrelid::regclass AS referenced_table,
       CASE con.confdeltype WHEN 'a' THEN 'NO ACTION' WHEN 'r' THEN 'RESTRICT'
         WHEN 'c' THEN 'CASCADE' WHEN 'n' THEN 'SET NULL' WHEN 'd' THEN 'SET DEFAULT' END AS on_delete,
       con.condeferrable, con.condeferred, pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('properties','applications','favorites');
SELECT c.relname AS table_name, i.indexrelid::regclass AS index_name,
       i.indisunique, i.indisvalid, i.indisready,
       pg_get_indexdef(i.indexrelid) AS definition,
       pg_get_expr(i.indpred, i.indrelid) AS predicate
FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname IN ('properties','applications','favorites');
SELECT c.relname AS table_name, t.tgname, t.tgenabled,
       pg_get_triggerdef(t.oid) AS trigger_definition,
       p.oid::regprocedure AS function_signature, p.prosecdef,
       pg_get_userbyid(p.proowner) AS function_owner,
       pg_get_functiondef(p.oid) AS function_definition
FROM pg_trigger t JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE n.nspname = 'public' AND c.relname IN ('properties','applications','favorites')
  AND NOT t.tgisinternal;
COMMIT;
