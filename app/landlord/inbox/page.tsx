import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function LandlordInboxPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <Link href="/auth/login">Sign in</Link>;
  const {data:profile}=await supabase.from("profiles").select("role").eq("id",user.id).maybeSingle();
  if(profile?.role!=="landlord")return <p role="alert">Landlord access required.</p>;
  const {data:conversations,error}=await supabase.from("conversations")
    .select("id,property_id,last_message_at").eq("landlord_id",user.id)
    .order("last_message_at",{ascending:false}).limit(100);
  return <main className="mx-auto max-w-4xl space-y-5 p-6">
    <h1 className="text-3xl font-bold">Tenant messages</h1>
    {error&&<p role="alert">{error.message}</p>}
    {!error&&!conversations?.length&&<p>No tenant conversations yet.</p>}
    {conversations?.map((c,i)=><Link className="block rounded border p-4 underline"
      key={c.id} href={`/landlord/inbox/${c.id}`}>Conversation {i+1}</Link>)}
  </main>;
}
