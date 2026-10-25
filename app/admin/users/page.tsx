import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="p-8"><Link href="/auth/login">Sign in</Link></main>;
  const { data: admin, error: roleError } = await supabase.from("profiles")
    .select("role").eq("id", user.id).maybeSingle();
  if (roleError || admin?.role !== "admin") {
    return <main className="p-8" role="alert">Administrator access required.</main>;
  }
  const { data: users, error } = await supabase.from("profiles")
    .select("id,full_name,role,verification_status")
    .order("id").limit(100);
  return <main className="mx-auto max-w-6xl space-y-5 p-6">
    <h1 className="text-3xl font-bold">User directory</h1>
    <p className="rounded border p-4 text-sm">
      Read-only. Displays up to 100 accounts visible to your administrator
      under the current database policies. Platform-wide access requires
      reviewed administrator RLS rules.
    </p>
    {error && <p role="alert">Unable to load users: {error.message}</p>}
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
