// NO NETWORK/WRITES by default. Even rollback transactions require owner approval.
const {randomUUID}=require('node:crypto');
const {parseArgs}=require('node:util');
const {values}=parseArgs({options:{'execute-approved':{type:'boolean',default:false}}});
const cases=['contract and existing fictional roles','property-bound conversation initiation','same conversation on duplicate start','sender-derived idempotent message send','same nonce with altered body rejected','unrelated tenant/landlord read and send denial','direct sender spoof denied','recipient-only notifications and idempotent read state','bounded conversation read acknowledgment'];
if(!values['execute-approved']){console.log('PLAN ONLY: 0 network requests; 0 connected mutations.');for(const name of cases)console.log(`NOT RUN: ${name}`);process.exit(0);}
function fail(){throw Error('Approved disposable acceptance check failed; private payloads were not logged.');}
(async()=>{
 if(process.env.MAKAANX_INTEGRATION_APPROVAL!=='OWNER_APPROVED_DISPOSABLE_SYNTHETIC_WRITES'||process.env.MAKAANX_INTEGRATION_TARGET!=='disposable')fail();
 const url=new URL(process.env.MAKAANX_TEST_SUPABASE_URL||''),ref=process.env.MAKAANX_DISPOSABLE_PROJECT_REF;
 if(url.protocol!=='https:'||!ref||!/^[a-z0-9]{20}$/.test(ref)||ref==='ficudncgevvxsxbjscrk'||url.hostname!==`${ref}.supabase.co`||url.username||url.password||url.search||url.hash||url.pathname!=='/')fail();
 const key=process.env.MAKAANX_TEST_PUBLIC_KEY,property=process.env.MAKAANX_TEST_PROPERTY_ID;
 if(!key||!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(property||''))fail();
 const tokens=['TENANT','LANDLORD','OTHER_TENANT','OTHER_LANDLORD'].map(role=>process.env[`MAKAANX_TEST_${role}_TOKEN`]);if(tokens.some(t=>!t))fail();
 async function api(path,token,method='GET',body){const r=await fetch(new URL(path,url),{method,redirect:'error',signal:AbortSignal.timeout(15000),headers:{apikey:key,Authorization:`Bearer ${token}`, 'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});let data;try{data=await r.json();}catch{fail();}return {ok:r.ok,data};}
 const rpc=(name,args,token=tokens[0])=>api(`/rest/v1/rpc/${name}`,token,'POST',args||{});
 const users=[];for(let i=0;i<tokens.length;i++){const u=await api('/auth/v1/user',tokens[i]);if(!u.ok||!u.data.id)fail();const p=await api(`/rest/v1/profiles?select=role&id=eq.${u.data.id}`,tokens[i]);if(!p.ok||p.data[0]?.role!==(i%2?'landlord':'tenant'))fail();users.push(u.data.id);}if(new Set(users).size!==4)fail();
 const propertyCheck=await api(`/rest/v1/properties?select=id,landlord_id,status&id=eq.${property}`,tokens[0]);if(!propertyCheck.ok||propertyCheck.data.length!==1||propertyCheck.data[0].landlord_id!==users[1]||propertyCheck.data[0].status!=='vacant')fail();
 const cap=await rpc('makaanx_messaging_contract_v1');if(!cap.ok||cap.data!=='messaging-notifications-v1')fail();console.log('PASS contract and existing fictional roles');
 const a=await rpc('makaanx_start_conversation_v1',{target_property:property});if(!a.ok||typeof a.data!=='string')fail();const chat=a.data;
 const b=await rpc('makaanx_start_conversation_v1',{target_property:property});if(!b.ok||b.data!==chat)fail();console.log('PASS property conversation deduplication');
 const request=randomUUID(),args={chat,request,message_body:'Synthetic integration message'};
 const sent=await rpc('makaanx_send_message_v1',args);if(!sent.ok||typeof sent.data!=='string')fail();
 const sentRow=await api(`/rest/v1/messages?select=id,sender_id,conversation_id&id=eq.${sent.data}`,tokens[0]);if(!sentRow.ok||sentRow.data.length!==1||sentRow.data[0].sender_id!==users[0]||sentRow.data[0].conversation_id!==chat)fail();
 const repeated=await rpc('makaanx_send_message_v1',args);if(!repeated.ok||repeated.data!==sent.data)fail();
 const altered=await rpc('makaanx_send_message_v1',{...args,message_body:'Different synthetic body'});if(altered.ok)fail();console.log('PASS sender-derived idempotency and mismatched retry denial');
 for(const token of tokens.slice(2)){const rows=await api(`/rest/v1/messages?select=id&conversation_id=eq.${chat}`,token);if(rows.ok&&(!Array.isArray(rows.data)||rows.data.length))fail();const denied=await rpc('makaanx_send_message_v1',{...args,request:randomUUID()},token);if(denied.ok)fail();}const anon=await api(`/rest/v1/messages?select=id&conversation_id=eq.${chat}`,key);if(anon.ok&&(!Array.isArray(anon.data)||anon.data.length))fail();console.log('PASS unrelated participant and anonymous isolation');
 const spoof=await api('/rest/v1/messages',tokens[0],'POST',{conversation_id:chat,sender_id:users[1],body:'Synthetic spoof attempt'});if(spoof.ok)fail();console.log('PASS direct sender spoof denied');
 const notif=await api(`/rest/v1/notifications_v1?select=id&message_id=eq.${sent.data}`,tokens[1]);if(!notif.ok||notif.data.length!==1)fail();
 const notification=notif.data[0].id;const other=await rpc('makaanx_mark_notification_read_v1',{notification},tokens[2]);if(other.ok&&other.data===true)fail();
 for(let i=0;i<2;i++){const marked=await rpc('makaanx_mark_notification_read_v1',{notification},tokens[1]);if(!marked.ok||marked.data!==true)fail();}
 console.log('PASS recipient-only notification read transition');
 const read=await rpc('makaanx_mark_conversation_read_v1',{chat,through_message:sent.data},tokens[1]);if(!read.ok||read.data!==true)fail();console.log('PASS bounded read acknowledgment');
 console.log('Approved disposable REST subset passed. Records retained; no account creation, SQL or cleanup. Rate/concurrency/rollback/realtime and other milestones require separate acceptance cases.');
})().catch(()=>{console.error('Integration blocked or failed. No URLs, tokens, IDs, message bodies or backend details logged.');process.exitCode=1;});
