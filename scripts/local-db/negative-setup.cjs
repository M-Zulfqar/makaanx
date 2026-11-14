const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
module.exports=async({name,sql,owner,report,pin})=>{
 // Synthetic owner setup demonstrates that REVOKE on a role alone cannot remove
 // effective EXECUTE inherited through another role. No real identity RPC called.
 await owner(`CREATE ROLE local_legacy_exec NOLOGIN;GRANT local_legacy_exec TO authenticated;
 CREATE FUNCTION public.makaanx_review_identity(uuid,text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$BEGIN RETURN; END$$;
 CREATE FUNCTION public.makaanx_review_identity(uuid,text,text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$BEGIN RETURN; END$$;
 REVOKE ALL ON FUNCTION public.makaanx_review_identity(uuid,text),public.makaanx_review_identity(uuid,text,text) FROM PUBLIC,anon,authenticated;
 GRANT EXECUTE ON FUNCTION public.makaanx_review_identity(uuid,text),public.makaanx_review_identity(uuid,text,text) TO local_legacy_exec;`,'Synthetic inherited legacy ACL fixture');
 const text=await pin(readFileSync('supabase/migrations/20261114_identity_workflow_v1_proposed.sql','utf8'),'storage');
 const r=await sql(name,'postgres',text);assert.notEqual(r.code,0);assert.match(r.err,/Inherited legacy identity EXECUTE requires reconciliation/);
 assert.equal(await owner("SELECT to_regclass('public.identity_submissions_v1') IS NULL;"),'t');
 assert.equal(await owner("SELECT has_function_privilege('authenticated','public.makaanx_review_identity(uuid,text)','EXECUTE');"),'t');
 await owner('REVOKE local_legacy_exec FROM authenticated;DROP FUNCTION public.makaanx_review_identity(uuid,text),public.makaanx_review_identity(uuid,text,text);DROP ROLE local_legacy_exec;');
 report.tests.push({name:'inherited legacy identity EXECUTE aborts and rolls back the entire proposal',status:'passed'});console.log('PASS inherited legacy identity EXECUTE aborts and rolls back the entire proposal');
};
