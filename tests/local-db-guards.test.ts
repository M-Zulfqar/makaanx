import { expect,test } from 'vitest';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require=createRequire(import.meta.url);
const { validName,cleanEnv,IMAGE,IMAGES,DATABASE }=require('../scripts/local-db/docker.cjs');
test('local database runner has pinned image and fixed disposable database',()=>{expect(Object.values(IMAGES)).toContain(IMAGE);expect(IMAGES['16']).toMatch(/^postgres:16-alpine@sha256:[a-f0-9]{64}$/);expect(DATABASE).toBe('makaanx_disposable');});
test.each(['https://example.supabase.co','postgres','production','makaanx-pg-../../x','makaanx-pg-x;id',''])('invalid external/ambiguous container name denied (%s)',value=>expect(()=>validName(value)).toThrow());
test('strict disposable name accepted without accepting URL input',()=>expect(()=>validName('makaanx-pg-0123-abcd')).not.toThrow());
test('ambient Docker and PostgreSQL routing configuration is stripped',()=>{const snapshot={...process.env};try{Object.assign(process.env,{DOCKER_HOST:'tcp://remote:2375',DOCKER_CONTEXT:'external',PGHOST:'remote',PGSERVICE:'staging',DATABASE_URL:'private-connection',SUPABASE_URL:'private-project'});const env=cleanEnv();for(const name of ['DOCKER_HOST','DOCKER_CONTEXT','PGHOST','PGSERVICE','DATABASE_URL','SUPABASE_URL'])expect(env[name]).toBeUndefined();}finally{for(const key of Object.keys(process.env))if(!(key in snapshot))delete process.env[key];Object.assign(process.env,snapshot);}});

test('external connection arguments fail before Docker without echoing supplied secrets',()=>{const r=spawnSync(process.execPath,['scripts/local-db/run.cjs','--database-url=PRIVATE_CONNECTION'],{encoding:'utf8',env:{NODE_ENV:'test',PATH:process.env.PATH}});expect(r.status).toBe(2);expect(r.stderr).not.toContain('PRIVATE_CONNECTION');expect(r.stderr).toContain('external connection arguments are rejected');});

test('focused admin-repair runner rejects external connection arguments before Docker',()=>{const r=spawnSync(process.execPath,['scripts/local-db/admin-repair.cjs','--database-url=PRIVATE_CONNECTION'],{encoding:'utf8',env:{NODE_ENV:'test',PATH:process.env.PATH}});expect(r.status).toBe(2);expect(r.stderr).not.toContain('PRIVATE_CONNECTION');expect(r.stderr).toContain('No connection or execution arguments accepted');});

test('PostgreSQL 17 gate uses a fixed 17.11 digest without arbitrary image input',()=>{expect(IMAGES['17']).toMatch(/^postgres:17[.]11-alpine@sha256:[a-f0-9]{64}$/);const r=spawnSync(process.execPath,['-e',"process.stdout.write(require('./scripts/local-db/docker.cjs').IMAGE)"],{encoding:'utf8',env:{NODE_ENV:'test',PATH:process.env.PATH,MAKAANX_LOCAL_PG_MAJOR:'17'}});expect(r.status).toBe(0);expect(r.stdout).toBe(IMAGES['17']);});
test('unsupported major is rejected before Docker without accepting an image or URL',()=>{const r=spawnSync(process.execPath,['scripts/local-db/admin-repair.cjs'],{encoding:'utf8',env:{NODE_ENV:'test',PATH:process.env.PATH,MAKAANX_LOCAL_PG_MAJOR:'PRIVATE_EXTERNAL_IMAGE'}});expect(r.status).not.toBe(0);expect(r.stderr).toContain('Only pinned local PostgreSQL majors');expect(r.stderr).not.toContain('PRIVATE_EXTERNAL_IMAGE');});
