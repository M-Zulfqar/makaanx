import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SendMessage } from "@/components/messages/send-message";
export const dynamic="force-dynamic";
export default async function LandlordConversationPage({params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <Link href="/auth/login">Sign in</Link>;
  const {data:conversation,error:conversationError}=await supabase.from("conversations")
    .select("id").eq("id",id).eq("landlord_id",user.id).maybeSingle();
  if(conversationError||!conversation)notFound();
  const {data:messages,error}=await supabase.from("messages")
    .select("id,sender_id,body,created_at").eq("conversation_id",id)
    .order("created_at",{ascending:true}).limit(100);
  return <main className="mx-auto max-w-4xl space-y-6 p-6">
    <Link href="/landlord/inbox" className="underline">← Inbox</Link>
    <h1 className="text-2xl font-bold">Tenant conversation</h1>
    {error&&<p role="alert">{error.message}</p>}
    {!error&&!messages?.length&&<p>No messages yet.</p>}
    <div className="space-y-3">{messages?.map(m=><article key={m.id} className="rounded border p-4">
      <p className="text-sm font-medium">{m.sender_id===user.id?"You":"Tenant"}</p>
      <p className="whitespace-pre-wrap break-words">{m.body}</p>
      <time className="text-xs text-muted-foreground">{m.created_at?new Date(m.created_at).toLocaleString():""}</time>
    </article>)}</div>
    <SendMessage conversationId={id}/>
  </main>;
}
