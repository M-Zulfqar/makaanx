import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActor, checkDatabase } from "@/lib/rentals/service";
import { parseSearch, PAGE_SIZE, type SearchParams } from "@/lib/rentals/schema";
import { RentalPagination } from "@/components/rentals/presentation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
export default async function ApplicationsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { filters, error } = parseSearch({ page: (await searchParams).page });
  if (error) return <p role="alert">{error}</p>;
  const client = await createClient();
  const user = await requireActor(client, "tenant");
  const start = (filters.page - 1) * PAGE_SIZE;
  const result = await client.from("applications").select("id,property_id,status,created_at", { count: "exact" }).eq("tenant_id", user.id)
    .order("created_at", { ascending: false }).order("id", { ascending: false }).range(start, start + PAGE_SIZE - 1);
  checkDatabase(result.error);
  if (result.count === null) throw new Error("COUNT_UNAVAILABLE");
  return <main className="mx-auto max-w-5xl space-y-5 py-6"><header><h1 className="text-3xl font-bold">My rental applications</h1><Link className="mt-3 inline-block text-primary underline" href="/dashboard/properties">Browse properties</Link></header>
    {!result.data?.length && <p className="rounded-2xl border border-dashed p-8">No applications on this page.</p>}
    <div className="grid gap-4 md:grid-cols-2">{result.data?.map(application => <Card key={application.id}><CardContent className="space-y-3 p-5"><Badge variant="secondary">{application.status}</Badge><h2 className="font-semibold">Application {application.id.slice(0, 8)}</h2><Link className="underline" href={`/dashboard/properties/${application.property_id}`}>View property</Link></CardContent></Card>)}</div>
    <RentalPagination base="/dashboard/applications" filters={filters} count={result.count}/>
  </main>;
}
