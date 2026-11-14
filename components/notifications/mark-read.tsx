'use client';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import { markNotificationReadAction } from '@/lib/notifications/actions';
export function MarkNotificationRead({id}:{id:string}){
 const [busy,setBusy]=useState(false),[feedback,setFeedback]=useState(''),lock=useRef(false),router=useRouter();
 async function mark(){if(lock.current)return;lock.current=true;setBusy(true);try{const r=await markNotificationReadAction(id);setFeedback(r.ok?'Notification marked read.':r.message);if(r.ok)router.refresh();}catch{setFeedback('Read state could not be confirmed.');}finally{lock.current=false;setBusy(false);}}
 return <div><button disabled={busy} className="text-sm underline" onClick={mark}>Mark notification read</button><p role="status" className="text-sm">{feedback}</p></div>;
}
