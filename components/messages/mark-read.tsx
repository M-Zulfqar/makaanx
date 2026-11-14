'use client';
import { useState,useRef } from 'react';
import { useRouter } from 'next/navigation';
import { markConversationReadAction } from '@/lib/messaging/actions';
export function MarkConversationRead({chat,message}:{chat:string;message:string}){
 const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState(''),lock=useRef(false),router=useRouter();
 async function mark(){if(lock.current)return;lock.current=true;setBusy(true);try{const result=await markConversationReadAction(chat,message);setFeedback(result.ok?'Read position updated.':result.message);if(result.ok)router.refresh();}catch{setFeedback('Read state not confirmed. Retry.');}finally{lock.current=false;setBusy(false);}}
 return <div><button disabled={busy} onClick={mark} className="text-sm underline disabled:opacity-50">Mark read through this page</button><p className="text-xs text-muted-foreground">Includes all earlier messages in this conversation.</p><p role="status" className="text-sm">{feedback}</p></div>;
}
