import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ChatError,encodeCursor,parseCursor,uuid } from '@/lib/messaging/schema';
import { readInbox,readThread,type ChatRole } from '@/lib/messaging/service';
import { SendMessage } from './send-message';
import { MarkConversationRead } from './mark-read';
import { RealtimeStatus } from './realtime-status';
import type { SearchParams } from '@/lib/rentals/schema';
const base=(role:ChatRole)=>role==='tenant'?'/dashboard/inbox':'/landlord/inbox';
function failure(error:unknown){if(error instanceof ChatError&&error.code==='AUTH')redirect('/auth/login');if(error instanceof ChatError&&error.code==='FORBIDDEN')return 'Conversation unavailable to this account.';return 'Messages could not be loaded. Check access or retry. No private details were returned.';}
export async function InboxView({role,searchParams}:{role:ChatRole;searchParams:Promise<SearchParams>}){
 let inbox,error;const params=await searchParams;const page=typeof params.page==='string'?Number(params.page):params.page===undefined?1:NaN;
 try{inbox=await readInbox(await createClient(),role,page);}catch(e){error=failure(e);}
 return <main className="mx-auto max-w-5xl space-y-5"><header><h1 className="text-3xl font-bold">Messages</h1><p className="mt-2 text-sm text-muted-foreground">Your property-linked tenant–landlord conversations. Counts cover accessible rows, not platform totals.</p></header>
  {error&&<p role="alert" className="rounded border p-4">{error}</p>}
  {inbox&&<><p className="text-sm">{inbox.count} accessible conversations. Latest previews and unread counts are per conversation on this page.</p>
   {!inbox.ready&&<p className="rounded border p-4 text-sm">Read-state and reliable message sending are not configured. Existing permitted history remains readable; unread counts are unavailable.</p>}
   {!inbox.conversations.length&&<p className="rounded border border-dashed p-8">No accessible conversations on this page.</p>}
   <div className="space-y-3">{inbox.conversations.map(c=><Link key={c.id} href={`${base(role)}/${c.id}`} className="block space-y-2 rounded-xl border bg-card p-4 hover:bg-muted/50">
    <h2 className="font-semibold">Property conversation</h2>{c.propertyTitle&&<p className="break-words text-sm">{c.propertyTitle}</p>}<p className="break-all text-xs text-muted-foreground">Property reference: {c.property_id}</p>
    <p className="line-clamp-2 break-words text-sm">{c.previewUnavailable?'Latest preview unavailable':c.preview?.body||'No accessible messages yet.'}</p>
    <p className="text-xs text-muted-foreground">Unread: {c.unread===null?'Unavailable':c.unread}{c.preview&&<> · Latest: <time>{c.preview.created_at}</time></>}</p>
   </Link>)}</div>
   <nav className="flex justify-between text-sm" aria-label="Conversation pagination">{page>1?<Link className="underline" href={`${base(role)}?page=${page-1}`}>Previous</Link>:<span/>}<span>Page {page}</span>{page*12<inbox.count?<Link className="underline" href={`${base(role)}?page=${page+1}`}>Next</Link>:<span/>}</nav>
  </>}
 </main>;
}
export async function ThreadView({role,id,searchParams}:{role:ChatRole;id:string;searchParams:Promise<SearchParams>}){
 let thread,error,cursor;try{if(!uuid.safeParse(id).success)throw new ChatError('INVALID');cursor=parseCursor((await searchParams).before);thread=await readThread(await createClient(),id,role,cursor);}catch(e){error=failure(e);}
 return <main className="mx-auto max-w-4xl space-y-5"><Link href={base(role)} className="text-sm underline">← Inbox</Link><h1 className="text-2xl font-bold">Property conversation</h1>
  {error&&<p role="alert" className="rounded border p-4">{error}</p>}
  {thread&&<><p className="text-xs text-muted-foreground">At most 30 messages per page. Earlier pages are ordered oldest to newest within the page. No read/delivery receipt or online presence is inferred.</p>
   <RealtimeStatus chat={id} userId={thread.user.id} latest={!cursor}/>
   <nav className="flex gap-4 text-sm">{thread.older&&<Link className="underline" href={`${base(role)}/${id}?before=${encodeURIComponent(encodeCursor(thread.older))}`}>Older messages</Link>}{cursor&&<Link className="underline" href={`${base(role)}/${id}`}>Latest messages</Link>}</nav>
   {!thread.messages.length&&<p className="rounded border border-dashed p-6">No accessible messages on this page.</p>}
   <section className="space-y-3" aria-label="Conversation messages">{thread.messages.map(m=><article key={m.id} className={`max-w-full rounded-xl border p-4 ${m.sender_id===thread.user.id?'bg-primary/5':'bg-card'}`}><h2 className="text-sm font-medium">{m.sender_id===thread.user.id?'You':'Other participant'}</h2><p className="whitespace-pre-wrap break-words text-sm">{m.body}</p><time className="text-xs text-muted-foreground">{m.created_at}</time></article>)}</section>
   {thread.ready&&thread.messages.length>0&&<MarkConversationRead chat={id} message={thread.messages[thread.messages.length-1].id}/>}
   <SendMessage key={id} conversationId={id} ready={thread.ready}/>
  </>}
 </main>;
}
