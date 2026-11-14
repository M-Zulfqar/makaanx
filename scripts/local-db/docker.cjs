const {spawn}=require('node:child_process');
const IMAGES=Object.freeze({
 '16':'postgres:16-alpine@sha256:f377d590e5474681d4d7838635031a2b50647923b7abfa803ce9b5ff35d5c663',
 '17':'postgres:17.11-alpine@sha256:4717f90960a225c2d1c5dac50508c401230f693ff626e06e84e6db0a68ded508',
});
const MAJOR=process.env.MAKAANX_LOCAL_PG_MAJOR??'16';
if(!Object.hasOwn(IMAGES,MAJOR))throw Error('Only pinned local PostgreSQL majors 16 or 17 accepted');
const IMAGE=IMAGES[MAJOR];
const LABEL='org.makaanx.disposable=backend-integration-v1';
const DATABASE='makaanx_disposable';
const cleanEnv=()=>{const env={...process.env};for(const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_TLS','DOCKER_TLS_VERIFY','DOCKER_CERT_PATH','PGHOST','PGPORT','PGDATABASE','PGUSER','PGPASSWORD','PGSERVICE','PGSERVICEFILE','DATABASE_URL','SUPABASE_URL'])delete env[key];return env;};
function docker(args,input=''){return new Promise((resolve,reject)=>{const child=spawn('docker',['--host=unix:///var/run/docker.sock',...args],{env:cleanEnv(),stdio:['pipe','pipe','pipe']});let out='',err='';child.stdout.on('data',v=>out+=v);child.stderr.on('data',v=>err+=v);child.on('error',reject);child.on('close',code=>resolve({code,out:out.trim(),err}));child.stdin.on('error',()=>{});child.stdin.end(input);});}
function validName(name){if(!/^makaanx-pg-[a-z0-9-]{1,50}$/.test(name))throw Error('Invalid disposable container name');}
async function assertContainer(name){validName(name);const r=await docker(['inspect',name]);if(r.code)throw Error('Disposable container unavailable');const c=JSON.parse(r.out)[0];if(c.Config.Labels?.['org.makaanx.disposable']!=='backend-integration-v1'||c.HostConfig.NetworkMode!=='none'||Object.values(c.NetworkSettings.Ports||{}).some(v=>Array.isArray(v)&&v.length)||c.Config.Image!==IMAGE)throw Error('Container identity/isolation mismatch');}
async function sql(name,role,text){validName(name);if(!['postgres','tenant_a','tenant_b','landlord_a','landlord_b','admin_user','anonymous'].includes(role))throw Error('Invalid local actor');return docker(['exec','-i',name,'psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose','-h','/var/run/postgresql','-U',role,'-d',DATABASE],`SET statement_timeout='10s'; SET lock_timeout='5s'; ${text}`);}
module.exports={IMAGE,IMAGES,MAJOR,LABEL,DATABASE,docker,sql,validName,assertContainer,cleanEnv};
