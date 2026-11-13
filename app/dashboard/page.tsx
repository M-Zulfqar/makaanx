import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActor } from "@/lib/rentals/service";
import { Card, CardContent } from "@/components/ui/card";
export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const client = await createClient();
  const user = await requireActor(client, "tenant");
  const [profile, applications, favorites, pending, recent] = await Promise.all([
    client.from("profiles").select("full_name,verification_status").eq("id", user.id).maybeSingle(),
    client.from("applications").select("id", { count: "exact", head: true }).eq("tenant_id", user.id),
    client.from("favorites").select("property_id", { count: "exact", head: true }).eq("user_id", user.id),
    client.from("applications").select("id", { count: "exact", head: true }).eq("tenant_id", user.id).eq("status", "pending"),
    client.from("applications").select("id,property_id,status,created_at").eq("tenant_id", user.id).order("created_at", { ascending: false }).order("id").limit(5),
  ]);
  const errors = [profile.error, applications.error, favorites.error, pending.error, recent.error].some(Boolean);
  return <main className="mx-auto max-w-6xl space-y-7 py-6"><header className="rounded-3xl bg-primary/5 p-7"><h1 className="text-3xl font-bold">Welcome{profile.data?.full_name ? `, ${profile.data.full_name}` : ""}</h1><p className="mt-3 text-muted-foreground">Your rental activity, directly from MakaanX.</p><p className="mt-2 text-sm">Identity verification: {profile.data?.verification_status ?? "Unavailable"}</p></header>
    {errors && <p role="alert" className="rounded-xl border p-4">Some activity could not be loaded. Unavailable statistics are shown as —.</p>}
    <section className="grid gap-4 sm:grid-cols-3">{[["Applications", applications], ["Saved properties", favorites], ["Pending applications", pending]].map(([label, result]) => {
      const stat = result as typeof applications;
      return <Card key={String(label)}><CardContent className="p-5"><h2 className="text-sm text-muted-foreground">{String(label)}</h2><p className="mt-2 text-3xl font-bold">{stat.error ? "—" : stat.count ?? "—"}</p></CardContent></Card>;
    })}</section>
    <section className="space-y-4"><h2 className="text-xl font-semibold">Recent applications</h2><p className="text-sm text-muted-foreground">Latest five; summary counts include all your accessible records.</p>
      {!recent.error && !recent.data?.length && <p>No applications yet.</p>}
      {recent.data?.map(application => <Card key={application.id}><CardContent className="space-y-2 p-5"><Link href={`/dashboard/properties/${application.property_id}`} className="underline">View property</Link><p>Status: {application.status}</p></CardContent></Card>)}
    </section>
    <nav className="flex flex-wrap gap-5"><Link className="underline" href="/dashboard/properties">Find a home</Link><Link className="underline" href="/dashboard/favorites">Saved properties</Link><Link className="underline" href="/dashboard/applications">All applications</Link></nav>
  </main>;
}
