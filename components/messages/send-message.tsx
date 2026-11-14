'use client';
import { useRef,useState,type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { sendMessageAction } from '@/lib/messaging/actions';
import { bodySchema } from '@/lib/messaging/schema';
export function SendMessage({conversationId,ready=false}:{conversationId:string;ready?:boolean}){
 const [body,setBody]=useState(''),[busy,setBusy]=useState(false),[feedback,setFeedback]=useState(''),[retry,setRetry]=useState(false);
 const pending=useRef<{conversationId:string;requestId:string;body:string}|null>(null),lock=useRef(false),router=useRouter();
 async function submit(e:FormEvent){e.preventDefault();if(!ready||lock.current)return;
  if(!pending.current){const parsed=bodySchema.safeParse(body);if(!parsed.success){setFeedback('Enter a message of 1–3000 characters.');return;}pending.current={conversationId,requestId:crypto.randomUUID(),body:parsed.data};}
  lock.current=true;setBusy(true);setFeedback('');
  try{const result=await sendMessageAction(pending.current);if(!result.ok){setFeedback(result.message);if(['INVALID','AUTH','FORBIDDEN','NOT_READY','THROTTLED'].includes(result.code)){pending.current=null;setRetry(false);}else setRetry(true);return;}
   pending.current=null;setRetry(false);setBody('');setFeedback('Message confirmed sent.');router.refresh();
  }catch{setRetry(true);setFeedback('Send not confirmed. Retry the same message to avoid duplicates.');}
  finally{lock.current=false;setBusy(false);}
 }
 return <form onSubmit={submit} className="space-y-3 rounded-xl border p-4"><label className="block text-sm font-medium" htmlFor={`message-${conversationId}`}>New message</label>
  {!ready&&<p className="text-sm text-muted-foreground">Messaging writes are unavailable pending backend configuration and validation. No message has been sent.</p>}
  <textarea id={`message-${conversationId}`} className="w-full rounded border bg-background p-3" value={body} onChange={e=>setBody(e.target.value)} maxLength={3000} rows={3} disabled={!ready||busy||retry}/>
  <button disabled={!ready||busy||!body.trim()} className="rounded bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50">{busy?'Sending...':retry?'Retry same message':'Send message'}</button>
  <p role="status" aria-live="polite" className="text-sm">{feedback}</p>
 </form>;
}
