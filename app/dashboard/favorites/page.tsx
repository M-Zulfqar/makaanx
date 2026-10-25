import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function FavoritesPage() {
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return <Link href="/auth/login">Sign in</Link>;
  const {data:favorites,error}=await supabase.from("favorites")
    .select("property_id").eq("user_id",user.id);
  const ids=favorites?.map(f=>f.property_id)??[];
  const {data:properties,error:propertiesError}=ids.length
    ? await supabase.from("properties").select("id,title,address,city,rent").in("id",ids)
    : {data:[],error:null};
  return <main className="mx-auto max-w-5xl p-8 space-y-5">
    <h1 className="text-3xl font-bold">Saved properties</h1>
    <Link className="underline" href="/marketplace">Explore rentals</Link>
    {(error||propertiesError)&&<p role="alert">{error?.message??propertiesError?.message}</p>}
    {!error&&!propertiesError&&!properties?.length&&<p>You have no saved properties yet.</p>}
    <div className="grid gap-4 md:grid-cols-2">{properties?.map(p=>
      <article className="rounded border p-5 space-y-2" key={p.id}>
        <h2 className="font-semibold">{p.title}</h2>
        <p>{[p.address,p.city].filter(Boolean).join(", ")}</p>
        <p>PKR {Number(p.rent??0).toLocaleString()} / month</p>
        <Link className="underline" href={`/marketplace/${p.id}`}>View listing</Link>
      </article>)}</div>
  </main>;
}
