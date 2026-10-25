import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("properties")
    .select("id,title,address,city,rent,landlord_id")
    .order("created_at", { ascending: false }).limit(100);
  return <main className="mx-auto max-w-6xl p-6 space-y-6">
    <div className="flex justify-between items-center"><h1 className="text-3xl font-bold">Browse rentals</h1>
    <Link href="/" className="underline">Home</Link></div>
    <p className="text-muted-foreground">Live listings from MakaanX. No demonstration properties.</p>
    {error && <p role="alert">Unable to load listings: {error.message}</p>}
    {!error && !data?.length && <p>No properties have been listed yet.</p>}
    <div className="grid gap-4 md:grid-cols-3">{data?.map(p =>
      <article key={p.id} className="rounded-xl border p-5 space-y-3">
        <h2 className="text-xl font-semibold">{p.title ?? "Rental property"}</h2>
        <p>{[p.address,p.city].filter(Boolean).join(", ")}</p>
        <p className="font-semibold">PKR {Number(p.rent ?? 0).toLocaleString()} / month</p>
        <Link className="inline-block underline" href={`/marketplace/${p.id}`}>View & apply</Link>
      </article>)}</div>
  </main>;
}
