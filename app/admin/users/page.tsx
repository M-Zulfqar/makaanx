import { administratorClient } from "@/lib/admin/server";
import { readProfileProjection } from "@/lib/admin/profiles";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await administratorClient();
  let users: Awaited<ReturnType<typeof readProfileProjection>> = [], error = false;
  try { users = await readProfileProjection(supabase); } catch { error = true; }
  return <main className="mx-auto max-w-6xl space-y-5 p-6">
    <h1 className="text-3xl font-bold">User directory</h1>
    <p className="rounded border p-4 text-sm">
      Read-only. Displays up to 100 accounts through the restricted administrator directory,
      ordered by profile reference. Contact information and document paths are excluded.
    </p>
    {error && <p role="alert">Unable to load users: {"Check profile permissions or try again."}</p>}
    {!error && !users?.length && <p>No accessible user profiles found.</p>}
    <div className="space-y-3">
      {users?.map(person => <article key={person.id} className="rounded border p-4">
        <h2 className="font-semibold">{person.full_name || "Unnamed account"}</h2>
        <p>Role: {person.role}</p>
        <p>Identity status: {person.verification_status}</p>
        <p className="text-xs text-muted-foreground">User ID: {person.id}</p>
      </article>)}
    </div>
  </main>;
}
