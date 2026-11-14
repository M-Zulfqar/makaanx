// Opt-in, loopback-only in-memory fixtures. NOT a Supabase/RLS emulator.
const {randomUUID}=require('node:crypto');
const tenant='10000000-0000-4000-8000-000000000001',landlord='20000000-0000-4000-8000-000000000001';
const unsupported='70000000-0000-4000-8000-000000000017';
const conversations=Array.from({length:13},(_,i)=>({id:`90000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,tenant_id:tenant,landlord_id:landlord,property_id:`30000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,last_message_at:`2026-11-14T00:00:${String(59-i).padStart(2,'0')}.000000Z`}));
const messages=Array.from({length:65},(_,i)=>({id:`91000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,conversation_id:conversations[0].id,sender_id:i%2?tenant:landlord,body:`Synthetic history item ${i+1}`,created_at:`2026-11-14T00:${String(Math.floor(i/60)).padStart(2,'0')}:${String(i%60).padStart(2,'0')}.000000Z`}));
const reads=[],notifications=[{id:'93000000-0000-4000-8000-000000000001',recipient_id:tenant,event_type:'new_message',conversation_id:conversations[0].id,message_id:messages[0].id,created_at:messages[0].created_at,read_at:null}];
const requests=new Map();
const eligible=(c,u)=>u&&['tenant','landlord'].includes(u.role)&&[c.tenant_id,c.landlord_id].includes(u.id);
function reply(req,res,url,rows){
 let result=rows.filter(row=>[...url.searchParams].every(([key,value])=>{
  if(['select','order','limit','offset'].includes(key))return true;
  if(key==='or'){const m=value.match(/created_at\.(lt|gt)\.([^,]+),and\(created_at\.eq\.([^,]+),id\.(lt|gt)\.([^\)]+)\)/);if(!m)return false;return m[1]==='lt'?(row.created_at<m[2]||row.created_at===m[3]&&row.id<m[5]):(row.created_at>m[2]||row.created_at===m[3]&&row.id>m[5]);}
  const at=value.indexOf('.'),op=value.slice(0,at),v=value.slice(at+1);if(op==='eq')return String(row[key])===v;if(op==='neq')return String(row[key])!==v;if(op==='is'&&v==='null')return row[key]==null;return false;
 }));
 const total=result.length,sort=(url.searchParams.get('order')||'id.asc').split(',');result.sort((a,b)=>{for(const term of sort){const [key,dir]=term.split('.'),cmp=String(a[key]).localeCompare(String(b[key]));if(cmp)return dir==='desc'?-cmp:cmp;}return 0;});
 const offset=Number(url.searchParams.get('offset')||0),limit=Number(url.searchParams.get('limit')||1000);result=result.slice(offset,offset+limit);
 const select=url.searchParams.get('select');if(select)result=result.map(row=>Object.fromEntries(select.split(',').map(k=>[k,row[k]])));
 res.setHeader('Content-Range',`${result.length?`${offset}-${offset+result.length-1}`:'*'}/${total}`);
 if(req.method==='HEAD'){res.end();return;}if((req.headers.accept||'').includes('vnd.pgrst.object')){if(result.length!==1){res.writeHead(406);res.end(JSON.stringify({code:'PGRST116'}));return;}res.end(JSON.stringify(result[0]));return;}res.end(JSON.stringify(result));
}
module.exports=async function handle(req,res,url,user){
 const rpc=url.pathname.replace('/rest/v1/rpc/','');
 const names=['makaanx_messaging_contract_v1','makaanx_start_conversation_v1','makaanx_send_message_v1','makaanx_mark_conversation_read_v1','makaanx_mark_notification_read_v1'];
 if(url.pathname.startsWith('/rest/v1/rpc/')&&names.includes(rpc)&&req.method==='POST'){
  const error=(code='42501')=>{res.writeHead(code==='XX000'?500:400);res.end(JSON.stringify({code,message:'PRIVATE_FIXTURE_BACKEND_DETAIL'}));};
  if(!user){error();return true;}if(rpc==='makaanx_messaging_contract_v1'){res.end(JSON.stringify(user.id===unsupported?null:'messaging-notifications-v1'));return true;}
  let body='';for await(const chunk of req){body+=chunk;if(body.length>20000){error('22023');return true;}}let args;try{args=JSON.parse(body);}catch{error('22023');return true;}
  if(rpc==='makaanx_start_conversation_v1'){const c=conversations.find(c=>c.property_id===args.target_property&&c.tenant_id===user.id);if(user.role!=='tenant'||!c){error();return true;}res.end(JSON.stringify(c.id));return true;}
  if(rpc==='makaanx_mark_notification_read_v1'){const n=notifications.find(n=>n.id===args.notification&&n.recipient_id===user.id);if(n)n.read_at=n.read_at||new Date().toISOString();res.end(JSON.stringify(Boolean(n)));return true;}
  const c=conversations.find(c=>c.id===args.chat);if(!c||!eligible(c,user)){error();return true;}
  if(rpc==='makaanx_mark_conversation_read_v1'){const m=messages.find(m=>m.id===args.through_message&&m.conversation_id===c.id);if(!m){error('22023');return true;}const r=reads.find(r=>r.conversation_id===c.id&&r.user_id===user.id);if(!r)reads.push({conversation_id:c.id,user_id:user.id,last_read_at:m.created_at,last_read_id:m.id});else if(r.last_read_at<m.created_at||r.last_read_at===m.created_at&&r.last_read_id<m.id){r.last_read_at=m.created_at;r.last_read_id=m.id;}res.end('true');return true;}
  if(typeof args.message_body!=='string'||!args.message_body.trim()||args.message_body.length>3000){error('22023');return true;}
  const key=`${user.id}:${args.request}`,prior=requests.get(key);if(prior){if(prior.body!==args.message_body||prior.conversation_id!==c.id){error('22023');return true;}res.end(JSON.stringify(prior.id));return true;}
  const message={id:randomUUID(),conversation_id:c.id,sender_id:user.id,body:args.message_body,created_at:new Date().toISOString()};messages.push(message);requests.set(key,message);c.last_message_at=message.created_at;
  notifications.push({id:randomUUID(),recipient_id:user.id===c.tenant_id?c.landlord_id:c.tenant_id,event_type:'new_message',conversation_id:c.id,message_id:message.id,created_at:message.created_at,read_at:null});
  if(args.message_body==='Synthetic retry request'){error('XX000');return true;} // Simulated lost confirmation AFTER mock commit.
  res.end(JSON.stringify(message.id));return true;
 }
 const table=url.pathname.replace('/rest/v1/','');let rows;
 if(table==='conversations')rows=conversations.filter(c=>eligible(c,user));
 else if(table==='messages')rows=messages.filter(m=>conversations.some(c=>c.id===m.conversation_id&&eligible(c,user)));
 else if(table==='conversation_reads_v1')rows=reads.filter(r=>r.user_id===user?.id);
 else if(table==='notifications_v1')rows=notifications.filter(n=>n.recipient_id===user?.id);
 else return false;
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end(JSON.stringify({code:'FIXTURE_DIRECT_WRITE_DENIED'}));return true;}
 if(url.searchParams.get('id')==='eq.90000000-0000-4000-8000-000000000099'){res.writeHead(500);res.end(JSON.stringify({code:'XX000',message:'PRIVATE_FIXTURE_BACKEND_DETAIL'}));return true;}
 reply(req,res,url,rows);return true;
};
