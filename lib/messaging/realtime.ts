import type { SupabaseClient } from '@supabase/supabase-js';
import { uuid } from './schema';
export const REALTIME_ENABLED=false; // Publication/RLS acceptance is a separate release gate.
// Low-level lifecycle adapter, used only after participant authorization. It
// invalidates bounded server queries; no message content is cached or logged.
export function attachConversationChannel(client:SupabaseClient,chat:string,userId:string,refresh:()=>void,status:(s:string)=>void) {
  if(!uuid.safeParse(chat).success||!uuid.safeParse(userId).success)throw Error('Invalid subscription reference');
  let active=true,timer:ReturnType<typeof setTimeout>|undefined;
  const invalidate=()=>{if(active&&!timer)timer=setTimeout(()=>{timer=undefined;if(active)refresh();},250);};
  const channel=client.channel(`conversation:${chat}:${crypto.randomUUID()}`).on('postgres_changes',{event:'INSERT',schema:'public',table:'messages',filter:`conversation_id=eq.${chat}`},payload=>{
    if(payload.new?.conversation_id===chat&&uuid.safeParse(payload.new?.id).success)invalidate();
  }).subscribe(value=>{if(!active)return;status(value==='SUBSCRIBED'?'Connected':value==='CHANNEL_ERROR'||value==='TIMED_OUT'||value==='CLOSED'?'Connection unavailable; refresh manually':'Connecting');if(value==='SUBSCRIBED')invalidate();});
  let authStop=()=>{};
  const stop=()=>{if(!active)return;active=false;if(timer)clearTimeout(timer);authStop();void client.removeChannel(channel).catch(()=>{});};
  const auth=client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||session?.user.id!==userId)stop();});authStop=()=>auth.data.subscription.unsubscribe();if(!active)authStop();
  return stop;
}
