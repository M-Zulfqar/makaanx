import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { ChatError, conversationSchema, cursorSchema, messageSchema, sendSchema, uuid, type Cursor } from './schema';
export type ChatRole='tenant'|'landlord';
export async function actor(client:SupabaseClient,expected?:ChatRole|'admin') {
  const {data:{user},error}=await client.auth.getUser();if(error||!user)throw new ChatError('AUTH');
  const profile=await client.from('profiles').select('role').eq('id',user.id).maybeSingle();
  if(profile.error)throw new ChatError('UNAVAILABLE');
  const role=profile.data?.role;if(!['tenant','landlord','admin'].includes(role)||expected&&role!==expected)throw new ChatError('FORBIDDEN');
  return {id:user.id,role:role as ChatRole|'admin'};
}
export async function capabilities(client:SupabaseClient) {
  try {const result=await client.rpc('makaanx_messaging_contract_v1');return !result.error&&result.data==='messaging-notifications-v1';}catch{return false;}
}
export async function participant(client:SupabaseClient,id:string,expected?:ChatRole) {
  if(!uuid.safeParse(id).success)throw new ChatError('INVALID');
  const user=await actor(client,expected);if(user.role==='admin')throw new ChatError('FORBIDDEN');
  const result=await client.from('conversations').select('id,tenant_id,landlord_id,property_id,last_message_at').eq('id',id).eq(user.role==='tenant'?'tenant_id':'landlord_id',user.id).maybeSingle();
  const parsed=conversationSchema.safeParse(result.data);
  if(result.error)throw new ChatError('UNAVAILABLE');
  if(!parsed.success||parsed.data.tenant_id===parsed.data.landlord_id||parsed.data[user.role==='tenant'?'tenant_id':'landlord_id']!==user.id)throw new ChatError('FORBIDDEN');
  return {user,conversation:parsed.data};
}
export function pageBefore<T extends {or:(s:string)=>T}>(query:T,cursor:Cursor|null):T {
  if(!cursor)return query;const c=cursorSchema.parse(cursor);
  return query.or(`created_at.lt.${c.at},and(created_at.eq.${c.at},id.lt.${c.id})`);
}
export async function readThread(client:SupabaseClient,id:string,role:ChatRole,cursor:Cursor|null) {
  const access=await participant(client,id,role);
  let query=client.from('messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',id);
  query=pageBefore(query,cursor);
  const result=await query.order('created_at',{ascending:false}).order('id',{ascending:false}).limit(31);
  const parsed=z.array(messageSchema).safeParse(result.data);if(result.error||!parsed.success)throw new ChatError('UNAVAILABLE');
  if(parsed.data.some(m=>m.conversation_id!==id||![access.conversation.tenant_id,access.conversation.landlord_id].includes(m.sender_id)))throw new ChatError('UNAVAILABLE');
  const descending=parsed.data.slice(0,30),last=descending.at(-1);
  return {...access,messages:descending.reverse(),older:parsed.data.length>30&&last?{at:last.created_at,id:last.id}:null,ready:await capabilities(client)};
}
export async function unreadCount(client:SupabaseClient,conversationId:string,userId:string):Promise<number|null> {
  try {
    const read=await client.from('conversation_reads_v1').select('last_read_at,last_read_id').eq('conversation_id',conversationId).eq('user_id',userId).maybeSingle();
    if(read.error)return null;
    let query=client.from('messages').select('id',{count:'exact',head:true}).eq('conversation_id',conversationId).neq('sender_id',userId);
    if(read.data){const c=cursorSchema.safeParse({at:read.data.last_read_at,id:read.data.last_read_id});if(!c.success)return null;query=query.or(`created_at.gt.${c.data.at},and(created_at.eq.${c.data.at},id.gt.${c.data.id})`);}
    const result=await query;return !result.error&&Number.isSafeInteger(result.count)&&result.count!==null&&result.count>=0?result.count:null;
  }catch{return null;}
}
export async function readInbox(client:SupabaseClient,role:ChatRole,page:number) {
  if(!Number.isSafeInteger(page)||page<1||page>10000)throw new ChatError('INVALID');
  const user=await actor(client,role),ready=await capabilities(client);
  const result=await client.from('conversations').select('id,tenant_id,landlord_id,property_id,last_message_at',{count:'exact'}).eq(role==='tenant'?'tenant_id':'landlord_id',user.id).order('last_message_at',{ascending:false,nullsFirst:false}).order('id',{ascending:false}).range((page-1)*12,page*12-1);
  const parsed=z.array(conversationSchema).safeParse(result.data);
  if(result.error||!parsed.success||result.count===null||!Number.isSafeInteger(result.count)||result.count<0)throw new ChatError('UNAVAILABLE');
  const titles=new Map<string,string>();
  if(parsed.data.length){try{const names=await client.from('properties').select('id,title').in('id',[...new Set(parsed.data.map(c=>c.property_id))]);if(!names.error)for(const p of names.data??[])if(typeof p.id==='string'&&typeof p.title==='string')titles.set(p.id,p.title);}catch{/* Property RLS failure must not hide permitted history. */}}
  const conversations=await Promise.all(parsed.data.map(async c=>{
    if(c[role==='tenant'?'tenant_id':'landlord_id']!==user.id||c.tenant_id===c.landlord_id)throw new ChatError('UNAVAILABLE');
    const latest=await client.from('messages').select('id,conversation_id,sender_id,body,created_at').eq('conversation_id',c.id).order('created_at',{ascending:false}).order('id',{ascending:false}).limit(1);
    const rows=z.array(messageSchema).safeParse(latest.data);const valid=!latest.error&&rows.success&&rows.data.every(m=>m.conversation_id===c.id&&[c.tenant_id,c.landlord_id].includes(m.sender_id));
    return {...c,propertyTitle:titles.get(c.property_id)??null,preview:valid&&rows.success?rows.data[0]??null:null,previewUnavailable:!valid,unread:ready?await unreadCount(client,c.id,user.id):null};
  }));
  return {conversations,count:result.count,ready};
}
function rpcFailure(error:{code?:string}|null){if(!error)return;throw new ChatError(error.code==='42501'?'FORBIDDEN':error.code==='22023'?'INVALID':error.code==='P0001'?'THROTTLED':'UNAVAILABLE');}
export async function sendMessage(client:SupabaseClient,input:unknown) {
  const parsed=sendSchema.safeParse(input);if(!parsed.success)throw new ChatError('INVALID');
  await participant(client,parsed.data.conversationId);
  if(!await capabilities(client))throw new ChatError('NOT_READY');
  // Sender/recipient are not RPC parameters. The DB derives auth.uid().
  const result=await client.rpc('makaanx_send_message_v1',{chat:parsed.data.conversationId,request:parsed.data.requestId,message_body:parsed.data.body});rpcFailure(result.error);
  if(!uuid.safeParse(result.data).success)throw new ChatError('UNAVAILABLE');return {id:result.data as string};
}
export async function startConversation(client:SupabaseClient,propertyId:string) {
  if(!uuid.safeParse(propertyId).success)throw new ChatError('INVALID');await actor(client,'tenant');
  if(!await capabilities(client))throw new ChatError('NOT_READY');
  const result=await client.rpc('makaanx_start_conversation_v1',{target_property:propertyId});rpcFailure(result.error);
  if(!uuid.safeParse(result.data).success)throw new ChatError('UNAVAILABLE');return {id:result.data as string};
}
export async function markConversationRead(client:SupabaseClient,chat:string,message:string) {
  if(!uuid.safeParse(message).success)throw new ChatError('INVALID');await participant(client,chat);
  if(!await capabilities(client))throw new ChatError('NOT_READY');
  const result=await client.rpc('makaanx_mark_conversation_read_v1',{chat,through_message:message});rpcFailure(result.error);
  if(result.data!==true)throw new ChatError('UNAVAILABLE');return {id:chat};
}
