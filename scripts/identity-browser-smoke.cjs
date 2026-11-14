// Isolated loopback fixtures ONLY. No real accounts, CNICs, SQL or storage writes.
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const base=new URL(process.env.MAKAANX_SMOKE_BASE_URL||'http://127.0.0.1:3000');
if(!['127.0.0.1','localhost','[::1]'].includes(base.hostname))throw new Error('Loopback URL required');
const ids={tenant:'10000000-0000-4000-8000-000000000001',landlord:'20000000-0000-4000-8000-000000000001',admin:'50000000-0000-4000-8000-000000000001',reviewer:'80000000-0000-4000-8000-000000000001',rejected:'70000000-0000-4000-8000-000000000017',verified:'70000000-0000-4000-8000-000000000016'};
function cookie(id){const exp=Math.floor(Date.now()/1000)+3600,enc=v=>Buffer.from(JSON.stringify(v)).toString('base64url');return `base64-${enc({access_token:`${enc({alg:'HS256',typ:'JWT'})}.${enc({sub:id,role:'authenticated',aud:'authenticated',exp})}.synthetic-only`,refresh_token:'synthetic-refresh',token_type:'bearer',expires_in:3600,expires_at:exp,user:{id,role:'authenticated'}})}`;}
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});let checks=0;
 const pass=name=>{checks++;console.log(`PASS ${name}`);};
 try{
  for(const role of ['anonymous','tenant','landlord','admin','rejected','verified','reviewer']){
   const context=await browser.newContext({viewport:{width:1440,height:1000}});if(ids[role])await context.addCookies([{name:'sb-127-auth-token',value:cookie(ids[role]),domain:base.hostname,path:'/',sameSite:'Lax'}]);
   const page=await context.newPage(),errors=[],writes=[];page.setDefaultTimeout(15000);page.on('pageerror',()=>errors.push('RUNTIME_ERROR'));page.on('request',r=>{if(!['GET','HEAD','OPTIONS'].includes(r.method())&&!r.url().includes('/rpc/makaanx_is_admin'))writes.push('WRITE');});
   await page.goto(new URL('/auth/verify-identity',base).href);
   const status=page.getByRole('status');await status.filter({hasText:role==='anonymous'?'Sign in again':role==='admin'||role==='reviewer'?'Only tenant':role==='rejected'?'rejected':role==='verified'?'marked verified':'Pending status alone'}).waitFor();pass(`${role} own status and role restriction`);
   await page.getByText(/No document can be uploaded from this build/).waitFor();assert(!(await page.content()).includes('PRIVATE_FIXTURE_DOCUMENT'));pass(`${role} gate and private path absent`);
   if(['tenant','landlord'].includes(role)){
    await page.getByLabel(/One CNIC image/).setInputFiles({name:'fictional-invalid.svg',mimeType:'image/svg+xml',buffer:Buffer.from('synthetic text')});await status.filter({hasText:'Choose exactly one'}).waitFor();pass(`${role} invalid type denied`);
    await page.getByLabel(/One CNIC image/).setInputFiles({name:'fictional.png',mimeType:'image/png',buffer:Buffer.from([137,80,78,71,13,10,26,10,0])});await status.filter({hasText:'Nothing has been uploaded'}).waitFor();assert(await page.getByRole('button',{name:'Submit for human review'}).isDisabled());pass(`${role} valid local file cannot bypass release gate`);await page.setViewportSize({width:375,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));pass(`${role} mobile submission fits viewport`);
   }
   if(role==='rejected'||role==='verified'){assert.equal(await page.getByLabel(/One CNIC image/).count(),0);pass(`${role} replacement unavailable`);}
   if(role==='reviewer'){
    await page.goto(new URL('/admin/verifications',base).href);await page.getByRole('heading',{name:'Identity verification queue',exact:true}).waitFor();await page.getByRole('heading',{name:'Fictional identity 01',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:/^Fictional identity/}).count(),12);assert(!(await page.content()).includes('PRIVATE_FIXTURE_DOCUMENT'));pass('queue bounded page and private sentinel absent');
    await page.getByRole('link',{name:'Next',exact:true}).click();await page.getByRole('heading',{name:'Fictional identity 13',exact:true}).waitFor();assert.equal(await page.getByRole('heading',{name:/^Fictional identity/}).count(),2);pass('queue real-query-shaped pagination');
    await page.getByLabel(/^Submission/).selectOption('incomplete');await page.getByRole('button',{name:'Filter queue'}).click();await page.getByRole('heading',{name:'Fictional identity 15',exact:true}).waitFor();pass('incomplete distinguished from submitted');
    await page.getByLabel(/^Review status/).selectOption('rejected');await page.getByLabel(/^Submission/).selectOption('all');await page.getByRole('button',{name:'Filter queue'}).click();await page.getByRole('heading',{name:'Fictional identity 17',exact:true}).waitFor();pass('actual status filters');
    await page.getByLabel('Applicant name',{exact:true}).fill('no_matching_fixture');await page.getByRole('button',{name:'Filter queue'}).click();await page.getByText('No accessible profiles match this page and filter.',{exact:true}).waitFor();pass('honest empty queue');
    assert.equal(await page.getByRole('button',{name:/Approve|Reject|Download/}).count(),0);pass('privileged review and viewing absent');
    await page.setViewportSize({width:375,height:812});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth));pass('mobile queue fits viewport');
   }else{
    await page.goto(new URL('/admin/verifications',base).href);
    if(role==='admin'){await page.getByText('No accessible profiles match this page and filter.',{exact:true}).waitFor();pass('own-only admin coverage honest');}
    else{assert.equal(new URL(page.url()).pathname,role==='anonymous'?'/auth/login':'/auth/unauthorized');pass(`${role} admin queue denied`);}
   }
   assert.equal(errors.length,0);assert.equal(writes.length,0);pass(`${role} no runtime errors or write requests`);await context.close();
  }
  console.log(`${checks} identity browser checks passed (synthetic fixtures only)`);
 }finally{await browser.close();}
})().catch(()=>{console.error('Identity browser checks failed; no paths, cookies, JWTs or response bodies logged.');process.exitCode=1;});
