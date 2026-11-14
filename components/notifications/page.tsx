import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { actor } from '@/lib/messaging/service';
import { ChatError } from '@/lib/messaging/schema';
import { readNotifications } from '@/lib/notifications/service';
import { MarkNotificationRead } from './mark-read';
import type { SearchParams } from '@/lib/rentals/schema';
export async function NotificationsPage({area,searchParams}:{area:'dashboard'|'landlord'|'admin';searchParams:Promise<SearchParams>}){
 const params=await searchParams,page=typeof params.page==='string'?Number(params.page):params.page===undefined?1:NaN;let data,error;
 try{const client=await createClient();await actor(client,area==='dashboard'?'tenant':area);data=await readNotifications(client,page);}catch(e){if(e instanceof ChatError&&e.code==='AUTH')redirect('/auth/login');error='Notifications are unavailable. Check access or retry.';}
 return <main className="mx-auto max-w-4xl space-y-5"><h1 className="text-3xl font-bold">Notifications</h1><p className="text-sm text-muted-foreground">In-app events for your account only. Email, SMS and push delivery are not connected.</p>
  {error&&<p role="alert">{error}</p>}
  {data&&!data.ready&&<p className="rounded border p-6">Notifications are not configured. No events were fetched and no empty or zero-unread result is implied.</p>}
  {data?.ready&&<><p className="text-sm">{data.count} accessible notifications · Unread: {data.unread===null?'Unavailable':data.unread}</p>
   {!data.rows.length&&<p className="rounded border border-dashed p-6">No accessible notifications on this page.</p>}
   {data.rows.map(n=><article className="space-y-2 rounded-xl border bg-card p-4" key={n.id}><h2 className="font-semibold">New message</h2><p className="text-sm">{n.read_at?'Read':'Unread'}</p><time className="text-xs text-muted-foreground">{n.created_at}</time>
    {area!=='admin'&&<p><Link className="text-sm underline" href={`/${area}/inbox/${n.conversation_id}`}>Open conversation</Link></p>}
    {!n.read_at&&<MarkNotificationRead id={n.id}/>}</article>)}
   <nav className="flex justify-between text-sm" aria-label="Notification pagination">{page>1?<Link href={`/${area}/notifications?page=${page-1}`} className="underline">Previous</Link>:<span/>}<span>Page {page}</span>{page*20<data.count?<Link href={`/${area}/notifications?page=${page+1}`} className="underline">Next</Link>:<span/>}</nav>
  </>}
 </main>;
}
