import { expect,test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { validName,cleanEnv,IMAGE,DATABASE }=require('../scripts/local-db/docker.cjs');
test('local database runner has pinned image and fixed disposable database',()=>{expect(IMAGE).toMatch(/^postgres:16-alpine@sha256:[a-f0-9]{64}$/);expect(DATABASE).toBe('makaanx_disposable');});
test.each(['https://example.supabase.co','postgres','production','makaanx-pg-../../x','makaanx-pg-x;id',''])('invalid external/ambiguous container name denied (%s)',value=>expect(()=>validName(value)).toThrow());
test('strict disposable name accepted without accepting URL input',()=>expect(()=>validName('makaanx-pg-0123-abcd')).not.toThrow());
test('ambient Docker and PostgreSQL routing configuration is stripped',()=>{const snapshot={...process.env};try{Object.assign(process.env,{DOCKER_HOST:'tcp://remote:2375',DOCKER_CONTEXT:'external',PGHOST:'remote',PGSERVICE:'staging',DATABASE_URL:'private-connection',SUPABASE_URL:'private-project'});const env=cleanEnv();for(const name of ['DOCKER_HOST','DOCKER_CONTEXT','PGHOST','PGSERVICE','DATABASE_URL','SUPABASE_URL'])expect(env[name]).toBeUndefined();}finally{for(const key of Object.keys(process.env))if(!(key in snapshot))delete process.env[key];Object.assign(process.env,snapshot);}});

test('external connection arguments fail before Docker without echoing supplied secrets',()=>{const r=spawnSync(process.execPath,['scripts/local-db/run.cjs','--database-url=PRIVATE_CONNECTION'],{encoding:'utf8',env:{NODE_ENV:'test',PATH:process.env.PATH}});expect(r.status).toBe(2);expect(r.stderr).not.toContain('PRIVATE_CONNECTION');expect(r.stderr).toContain('external connection arguments are rejected');});
