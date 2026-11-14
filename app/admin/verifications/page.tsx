import Link from "next/link";
import { administratorClient } from "@/lib/admin/server";
import { AdminCoverage } from "@/components/admin/presentation";
import { IdentityReviewForm } from "@/components/admin/identity-review-form";
import { IDENTITY_QUEUE_SIZE, identityQueueHref, parseIdentityQueue, readIdentityQueue } from "@/lib/identity/queue";
import type { SearchParams } from "@/lib/rentals/schema";
export const dynamic = "force-dynamic";
export default async function AdminVerifications({ searchParams = Promise.resolve({}) }: { searchParams?: Promise<SearchParams> } = {}) {
  const supabase = await administratorClient();
  const { filters, error } = parseIdentityQueue(await searchParams);
  let queue, failure = error;
  if (!failure) try { queue = await readIdentityQueue(supabase, filters); } catch { failure = "Unable to load permitted verification records. Check access or try again."; }
  const input = "mt-1 h-10 w-full rounded border bg-background px-3";
  return <main className="mx-auto max-w-6xl space-y-5">
    <header className="space-y-2"><h1 className="text-3xl font-bold">Identity verification queue</h1><p className="text-sm text-muted-foreground">Read-only human review overview. No official identity-authenticity result is implied.</p></header>
    <AdminCoverage/>
    <p className="rounded border p-4 text-sm">Only tenant and landlord profiles are eligible. A saved document reference does not establish that an object exists or that it is authentic. Blank or invalid saved references need repair through an approved workflow. No document paths or files are fetched here.</p>
    <form className="grid gap-4 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5" method="get">
      <label className="text-sm">Applicant name<input className={input} name="q" maxLength={100} defaultValue={filters.q}/></label>
      <label className="text-sm">Account role<select className={input} name="role" defaultValue={filters.role}><option value="">All eligible roles</option><option value="tenant">Tenant</option><option value="landlord">Landlord</option></select></label>
      <label className="text-sm">Review status<select className={input} name="status" defaultValue={filters.status}><option value="pending">Pending</option><option value="verified">Verified status (audit not inspected)</option><option value="rejected">Rejected</option><option value="all">All statuses</option></select></label>
      <label className="text-sm">Submission<select className={input} name="submission" defaultValue={filters.submission}><option value="submitted">Saved document reference</option><option value="incomplete">No document reference</option><option value="all">Submitted and incomplete</option></select></label>
      <div className="flex items-end gap-3"><button className="rounded bg-primary px-4 py-2 text-primary-foreground">Filter queue</button><Link href="/admin/verifications" className="py-2 text-sm underline">Reset</Link></div>
    </form>
    <IdentityReviewForm/>
    {failure && <p role="alert" className="rounded border p-4">{failure}</p>}
    {queue && <><p className="text-sm">Exact accessible matching profiles: <strong>{queue.count}</strong>. Showing at most {IDENTITY_QUEUE_SIZE} on this page, ordered by profile reference. Counts do not prove platform-wide access.</p>
      {!queue.rows.length && <p className="rounded border border-dashed p-6">No accessible profiles match this page and filter.</p>}
      <section className="grid gap-3 sm:grid-cols-2" aria-label="Verification requests">{queue.rows.map(person => <article key={person.id} className="space-y-2 rounded border p-4">
        <h2 className="break-words font-semibold">{person.full_name || "Unnamed applicant"}</h2><p className="text-sm">Role: {person.role}</p>
        <p className="text-sm">Review status: {person.verification_status === "verified" ? "Verified status (audit not inspected)" : person.verification_status || "Unspecified"}</p>
        <p className="text-sm">Submission: {filters.submission === "submitted" ? "Saved reference (object not inspected)" : filters.submission === "incomplete" ? "No reference saved" : "Not classified in this mixed view"}</p>
        <p className="break-all text-xs text-muted-foreground">Profile reference: {person.id}</p>
      </article>)}</section>
      <nav className="flex items-center justify-between gap-3 text-sm" aria-label="Verification pagination">{filters.page > 1 ? <Link className="underline" href={identityQueueHref(filters, filters.page - 1)}>Previous</Link> : <span/>}<span>Page {filters.page}</span>{filters.page * IDENTITY_QUEUE_SIZE < queue.count ? <Link className="underline" href={identityQueueHref(filters, filters.page + 1)}>Next</Link> : <span/>}</nav>
    </>}
  </main>;
}
