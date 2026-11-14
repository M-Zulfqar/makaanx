'use client';
import { useRef,useState } from 'react';
import { useRouter } from 'next/navigation';
import { startConversationAction } from '@/lib/messaging/actions';
export function ContactLandlord({propertyId}:{propertyId:string}){
 const router=useRouter(),lock=useRef(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function start(){if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const result=await startConversationAction(propertyId);if(!result.ok){if(result.code==='AUTH')router.push('/auth/login');setError(result.message);return;}router.push(`/dashboard/inbox/${result.id}`);}catch{setError('Conversation could not be confirmed. Retry safely.');}finally{lock.current=false;setBusy(false);}}
 return <div className="space-y-2"><button type="button" disabled={busy} onClick={start} className="rounded border px-5 py-3 disabled:opacity-50">{busy?'Opening chat...':'Message landlord'}</button>{error&&<p role="alert" className="text-sm">{error}</p>}</div>;
}
