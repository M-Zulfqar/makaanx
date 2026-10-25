import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function LandlordDashboard() {
  const supabase = await createClient();
  const {data:{user}} = await supabase.auth.getUser();
  if(!user)return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const {data:profile,error:profileError}=await supabase.from("profiles")
    .select("full_name,role").eq("id",user.id).maybeSingle();
  if(profileError || profile?.role!=="landlord")
    return <main className="p-8" role="alert">Landlord account required.</main>;
  const {data:properties,error:propertyError}=await supabase.from("properties")
    .select("id,title,address,city,rent").eq("landlord_id",user.id)
    .order("created_at",{ascending:false}).limit(100);
  const {data:applications,error:applicationError}=properties?.length
    ? await supabase.from("applications").select("id,property_id,status")
      .in("property_id",properties.map(p=>p.id))
    : {data:[],error:null};
  const pending=applications?.filter(a=>a.status==="pending").length??0;
  return <main className="mx-auto max-w-6xl space-y-8 p-6">
    <header className="space-y-2"><h1 className="text-3xl font-bold">Landlord overview</h1>
      <p className="text-muted-foreground">Welcome{profile.full_name?`, ${profile.full_name}`:""}. Your real listing activity.</p></header>
    {(propertyError||applicationError)&&<p role="alert" className="rounded border p-4">
      {propertyError?.message??applicationError?.message}</p>}
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-xl border p-5"><p>Properties</p><p className="text-3xl font-bold">{propertyError?"—":properties?.length??0}</p><p className="text-sm">Latest 100 listings</p></article>
      <article className="rounded-xl border p-5"><p>Applications</p><p className="text-3xl font-bold">{applicationError?"—":applications?.length??0}</p></article>
      <article className="rounded-xl border p-5"><p>Pending decisions</p><p className="text-3xl font-bold">{applicationError?"—":pending}</p></article>
    </div>
    <section className="space-y-4"><div className="flex justify-between gap-4">
      <h2 className="text-2xl font-semibold">Recent listings</h2>
      <Link className="underline" href="/landlord/manage">Manage properties</Link></div>
      {!propertyError&&!properties?.length&&<p>Add your first property to get started.</p>}
      {properties?.slice(0,5).map(p=><article key={p.id} className="rounded border p-4">
        <h3 className="font-semibold">{p.title}</h3>
        <p>{[p.address,p.city].filter(Boolean).join(", ")}</p>
        <p>PKR {Number(p.rent??0).toLocaleString()} / month</p>
      </article>)}
    </section>
  </main>;
}
