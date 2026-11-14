// ONLY creates its own Docker network-none DB. No host/URL/token inputs accepted.
const {readFileSync,mkdirSync,writeFileSync}=require('node:fs');
const {resolve}=require('node:path');
const {randomUUID,createHash}=require('node:crypto');
const {parseArgs}=require('node:util');
const {IMAGE,LABEL,DATABASE,docker,sql,assertContainer}=require('./docker.cjs');
let values;try{({values}=parseArgs({options:{keep:{type:'boolean',default:false}}}));}catch{console.error('Only --keep is supported; external connection arguments are rejected.');process.exit(2);}
const name=`makaanx-pg-${randomUUID()}`;
const report={image:IMAGE,engine:null,baseline:'synthetic-local-v1',scope:'PostgreSQL SQL roles/RLS/constraints/functions; not Supabase HTTP/Auth/Storage/Realtime',tests:[],setup:[]};
async function owner(text,label){const r=await sql(name,'postgres',text);if(r.code){const code=r.err.match(/ERROR:\s+([A-Z0-9]{5}):/)?.[1]||'UNKNOWN';const e=Error();e.safeMessage=`${label||'Privileged local setup'} failed (${code})`;throw e;}return r.out;}
async function apply(path,patch){let text=readFileSync(path,'utf8');const original=text;if(patch)text=await patch(text);await owner(text,path);report.setup.push({path,source_sha256:createHash('sha256').update(original).digest('hex'),applied_sha256:createHash('sha256').update(text).digest('hex'),syntheticBaselinePinOnly:Boolean(patch)});}
async function pin(text,kind){const target=kind==='storage'?"schemaname='storage' AND tablename='objects'":kind==='rental'?"schemaname='public' AND tablename IN ('properties','applications','favorites')":"schemaname='public' AND tablename IN ('conversations','messages')";const order=kind==='storage'?'p.policyname':'p.tablename,p.policyname';const hash=await owner(`SELECT md5(coalesce(string_agg(row_to_json(p)::text,E'\\n' ORDER BY ${order}),'')) FROM pg_policies p WHERE ${target};`,'Synthetic fingerprint');if(!/^[a-f0-9]{32}$/.test(hash))throw Error('Invalid local baseline fingerprint');return text.replace("'REVIEW_REQUIRED'",`'${hash}'`);}
(async()=>{let started=false;try{
 const start=await docker(['run','-d','--name',name,'--label',LABEL,'--network','none','--tmpfs','/var/lib/postgresql/data:rw,size=512m','--shm-size','128m','-e',`POSTGRES_DB=${DATABASE}`,'-e','POSTGRES_HOST_AUTH_METHOD=trust',IMAGE,'-c','listen_addresses=','-c','log_statement=none','-c','log_min_error_statement=panic','-c','log_min_messages=panic']);if(start.code){const e=Error();e.safeMessage=start.err.includes('no space left')?'Docker local storage exhausted; reset verified kept containers':'Docker image/run unavailable';throw e;}started=true;
 await assertContainer(name);let ready=false;for(let i=0;i<60;i++){const r=await sql(name,'postgres','SELECT 1;');if(!r.code){ready=true;break;}await new Promise(r=>setTimeout(r,250));}if(!ready)throw Error('Local PostgreSQL startup failed');
 report.engine=await owner('SHOW server_version;');
 await apply('scripts/local-db/baseline.sql');
 await apply('supabase/migrations/20261101_staging_auth_phase2.sql');
 await apply('scripts/local-db/fixtures.sql');
 await apply('supabase/migrations/20261112_admin_profile_read_staging_proposed.sql');
 await apply('supabase/migrations/20261114_core_rental_integrity_proposed.sql');
 await apply('supabase/migrations/20261114_rental_authorization_proposed.sql',t=>pin(t,'rental'));
 await require('./negative-setup.cjs')({name,sql,owner,report,pin});
 await apply('supabase/migrations/20261114_identity_workflow_v1_proposed.sql',t=>pin(t,'storage'));
 await apply('supabase/migrations/20261114_messaging_notifications_v1_proposed.sql',t=>pin(t,'messaging'));
 await apply('supabase/migrations/20261114_property_reports_proposed.sql');
 const suite=require('./suite.cjs');await suite({name,sql,owner,report,pin});
 console.log(`${report.tests.length} PostgreSQL checks passed; ${report.engine}; no connected Supabase claim.`);
 }catch(error){report.failure=error.code==='ERR_ASSERTION'?'Local database assertion failed':error.safeMessage||'Local database setup/check failed; inspect isolated setup and bounded test result.';console.error(report.failure);process.exitCode=1;}
 finally{mkdirSync(resolve('work'),{recursive:true});writeFileSync(resolve('work/local-db-results.json'),JSON.stringify(report,null,2));if(started&&!values.keep)await docker(['rm','-f',name]);else if(started)console.log(`Kept isolated container: ${name}`);}
})();
