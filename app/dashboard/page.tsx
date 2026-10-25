import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="p-8"><Link href="/auth/login">Sign in to continue</Link></main>;
  const [{data: profile, error: profileError}, {data: applications,error: applicationError},
    {data: favorites,error: favoriteError}, {data: payments,error: paymentError}] = await Promise.all([
    supabase.from("profiles").select("full_name,verification_status").eq("id",user.id).maybeSingle(),
    supabase.from("applications").select("id,property_id,status,created_at").eq("tenant_id",user.id)
      .order("created_at",{ascending:false}).limit(5),
    supabase.from("favorites").select("property_id").eq("user_id",user.id),
    supabase.from("payments").select("id").eq("tenant_id",user.id),
  ]);
  const errors=[profileError,applicationError,favoriteError,paymentError].filter(Boolean);
  return <main className="mx-auto max-w-6xl space-y-8 p-6">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold">Welcome{profile?.full_name ? `, ${profile.full_name}` : ""}</h1>
      <p className="text-muted-foreground">Your rental activity, directly from MakaanX.</p>
      <p>Identity verification: <strong>{profile?.verification_status ?? "Not available"}</strong></p>
    </header>
    {errors.length>0 && <div role="alert" className="rounded border p-4">
      Some dashboard information could not be loaded. {errors.map(e=>e?.message).join("; ")}
    </div>}
    <div className="grid gap-4 sm:grid-cols-3">
      <article className="rounded-xl border p-5"><p>Applications</p><p className="text-3xl font-bold">{applicationError?"—":applications?.length??0}</p><p className="text-sm text-muted-foreground">Most recent 5</p></article>
      <article className="rounded-xl border p-5"><p>Saved properties</p><p className="text-3xl font-bold">{favoriteError?"—":favorites?.length??0}</p></article>
      <article className="rounded-xl border p-5"><p>Payment records</p><p className="text-3xl font-bold">{paymentError?"—":payments?.length??0}</p></article>
    </div>
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Recent applications</h2>
        <Link href="/dashboard/applications" className="underline">View all</Link>
      </div>
      {!applicationError && !applications?.length && <p>You have not applied for any properties yet.</p>}
      {applications?.map(a=><article className="rounded border p-4" key={a.id}>
        <Link className="underline" href={`/marketplace/${a.property_id}`}>Property details</Link>
        <p>Status: {a.status}</p>
        <p className="text-sm text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleDateString() : ""}</p>
      </article>)}
    </section>
    <nav className="flex flex-wrap gap-4">
      <Link className="underline" href="/marketplace">Browse properties</Link>
      <Link className="underline" href="/dashboard/favorites">Saved properties</Link>
      <Link className="underline" href="/dashboard/payments">Payments</Link>
    </nav>
  </main>;
}
