import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const { data: profile, error: roleError } = await supabase.from("profiles")
    .select("role,full_name").eq("id", user.id).maybeSingle();
  if (roleError || profile?.role !== "admin") {
    return <main className="p-8" role="alert">Administrator access required.</main>;
  }

  const [users, properties, applications, pending] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("properties").select("id", { count: "exact", head: true }),
    supabase.from("applications").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true })
      .eq("verification_status", "pending"),
  ]);
  const stats = [
    { label: "Accessible users", result: users },
    { label: "Accessible properties", result: properties },
    { label: "Accessible applications", result: applications },
    { label: "Accessible pending verifications", result: pending },
  ];
  return <main className="mx-auto max-w-6xl space-y-8 p-6">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold">Administration</h1>
      <p className="text-muted-foreground">Welcome{profile.full_name ? `, ${profile.full_name}` : ""}. Live database overview.</p>
    </header>
    <p className="rounded border p-4 text-sm">
      Counts reflect rows visible under your current Supabase permissions.
      Until administrator RLS policies are reviewed, they may not represent platform-wide totals.
    </p>
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map(({label,result})=><article key={label} className="rounded-xl border p-5">
        <h2 className="text-sm font-medium">{label}</h2>
        <p className="mt-3 text-3xl font-bold">{result.error ? "—" : result.count ?? 0}</p>
        {result.error&&<p role="alert" className="text-xs">{result.error.message}</p>}
      </article>)}
    </section>
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Administration tools</h2>
      <p>Identity approval is disabled until the privileged review workflow and audit log are deployed.</p>
      <Link className="underline" href="/admin/verifications">View verification queue</Link>
    </section>
  </main>;
}
