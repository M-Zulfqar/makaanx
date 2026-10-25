import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export default async function AdminVerifications() {
  const supabase = await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const {data:admin,error:adminError}=await supabase.from("profiles")
    .select("role").eq("id",user.id).maybeSingle();
  if(adminError||admin?.role!=="admin")
    return <main className="p-8" role="alert">Administrator access required.</main>;
  const {data:queue,error}=await supabase.from("profiles")
    .select("id,full_name,role,verification_status")
    .eq("verification_status","pending").order("id").limit(50);
  return <main className="mx-auto max-w-5xl space-y-5 p-6">
    <h1 className="text-3xl font-bold">Identity verification queue</h1>
    <p className="rounded border p-4 text-sm">
      Read-only. This queue shows only profiles your administrator account can read
      under current database policies. Document access and approval actions are
      deliberately disabled until secure review permissions and audit logging are deployed.
    </p>
    {error&&<p role="alert">Unable to load queue: {error.message}</p>}
    {!error&&!queue?.length&&<p>No accessible pending verification requests.</p>}
    <div className="space-y-3">{queue?.map(p=><article key={p.id} className="rounded border p-4">
      <h2 className="font-semibold">{p.full_name||"Unnamed applicant"}</h2>
      <p className="text-sm">Role: {p.role}</p>
      <p className="text-sm">Status: {p.verification_status}</p>
      <p className="text-xs text-muted-foreground">Reference: {p.id}</p>
    </article>)}</div>
  </main>;
}
