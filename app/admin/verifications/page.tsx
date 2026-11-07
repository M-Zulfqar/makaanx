import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminVerifications() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;

  const { data: admin, error: adminError } = await supabase.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (adminError || admin?.role !== "admin") {
    return <main className="p-8" role="alert">Administrator access required.</main>;
  }

  // A pending profile without cnic_path has not completed document submission.
  // Query only references, never the private document bytes or signed URLs.
  const [submitted, awaiting] = await Promise.all([
    supabase.from("profiles")
      .select("id,full_name,role,verification_status")
      .eq("verification_status", "pending")
      .not("cnic_path", "is", null)
      .order("id").limit(50),
    supabase.from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("verification_status", "pending")
      .is("cnic_path", null),
  ]);

  return <main className="mx-auto max-w-5xl space-y-5 p-6">
    <header className="space-y-2">
      <h1 className="text-3xl font-bold">Identity verification queue</h1>
      <p className="text-sm text-muted-foreground">Read-only staging review overview.</p>
    </header>
    <p className="rounded border p-4 text-sm">
      Only pending profiles with a saved document reference appear in this queue.
      Counts and records are limited by the current Supabase row-level security policies.
      A saved reference does not prove the file is a valid CNIC.
      Approval, rejection, and private document viewing are disabled until audited
      administrator permissions and storage access are deployed and tested.
    </p>
    <section className="grid gap-3 sm:grid-cols-2" aria-label="Verification status summary">
      <article className="rounded border p-4">
        <h2 className="text-sm font-medium">Submitted documents visible</h2>
        <p className="mt-2 text-2xl font-bold">{submitted.error ? "—" : submitted.data?.length ?? 0}</p>
        <p className="text-xs text-muted-foreground">Up to 50 records shown</p>
      </article>
      <article className="rounded border p-4">
        <h2 className="text-sm font-medium">Pending profiles without a document</h2>
        <p className="mt-2 text-2xl font-bold">{awaiting.error ? "—" : awaiting.count ?? 0}</p>
      </article>
    </section>
    {submitted.error && <p role="alert">Unable to load submitted requests: {submitted.error.message}</p>}
    {awaiting.error && <p role="alert">Unable to count incomplete submissions: {awaiting.error.message}</p>}
    {!submitted.error && !submitted.data?.length && <p>No accessible submitted documents awaiting review.</p>}
    <section className="space-y-3" aria-label="Submitted verification requests">
      {submitted.data?.map(person => <article key={person.id} className="rounded border p-4">
        <h2 className="font-semibold">{person.full_name || "Unnamed applicant"}</h2>
        <p className="text-sm">Role: {person.role}</p>
        <p className="text-sm">Verification: {person.verification_status}</p>
        <p className="text-sm">Document: Submitted (not yet reviewed)</p>
        <p className="text-xs text-muted-foreground">Reference: {person.id}</p>
      </article>)}
    </section>
  </main>;
}
