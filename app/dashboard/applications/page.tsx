import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";
export default async function ApplicationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const { data, error } = await supabase.from("applications")
    .select("id,property_id,status,created_at")
    .eq("tenant_id", user.id).order("created_at", { ascending: false });
  return <main className="mx-auto max-w-4xl p-8 space-y-5">
    <h1 className="text-3xl font-bold">My rental applications</h1>
    <Link href="/marketplace" className="underline">Browse properties</Link>
    {error && <p role="alert">{error.message}</p>}
    {!error && !data?.length && <p>No applications yet.</p>}
    {data?.map(a => <article className="rounded border p-4" key={a.id}>
      <Link className="underline" href={`/marketplace/${a.property_id}`}>View property</Link>
      <p>Status: <strong>{a.status}</strong></p>
    </article>)}
  </main>;
}
