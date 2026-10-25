import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function InboxPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const {data:conversations,error}=await supabase.from("conversations")
    .select("id").eq("user_id",user.id).limit(100);
  return <main className="mx-auto max-w-4xl p-6 space-y-5">
    <h1 className="text-3xl font-bold">Messages</h1>
    <p className="text-muted-foreground">Your private conversations. Messages are stored in Supabase.</p>
    {error&&<p role="alert">{error.message}</p>}
    {!error&&!conversations?.length&&<p>No conversations yet.</p>}
    <div className="space-y-3">{conversations?.map((c,index)=>
      <Link className="block rounded border p-4 underline" key={c.id} href={`/dashboard/inbox/${c.id}`}>
        Conversation {index+1}
      </Link>)}</div>
  </main>;
}
