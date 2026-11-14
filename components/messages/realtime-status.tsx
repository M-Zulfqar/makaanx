'use client';
import { useEffect,useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';
import { participant } from '@/lib/messaging/service';
import { attachConversationChannel,REALTIME_ENABLED } from '@/lib/messaging/realtime';
export function RealtimeStatus({chat,userId,latest}:{chat:string;userId:string;latest:boolean}){
 const router=useRouter(),[status,setStatus]=useState('Manual refresh available');
 useEffect(()=>{if(!REALTIME_ENABLED||!latest)return;let active=true,stop:(()=>void)|undefined;
  void (async()=>{const client=createClient();const access=await participant(client,chat);if(!active||access.user.id!==userId)return;stop=attachConversationChannel(client,chat,userId,()=>router.refresh(),setStatus);})().catch(()=>{if(active)setStatus('Connection unavailable; refresh manually');});
  return()=>{active=false;stop?.();};
 },[chat,userId,latest,router]);
 return <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground"><span>{REALTIME_ENABLED&&latest?status:'Realtime is pending publication and authorization validation.'}</span><button className="underline" onClick={()=>router.refresh()}>Refresh messages</button></div>;
}
