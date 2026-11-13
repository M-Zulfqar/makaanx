import { administratorClient } from "@/lib/admin/server";
import { readAdminAnalytics } from "@/lib/admin/data";
import { AdminCoverage, AdminMetrics, AdminSample } from "@/components/admin/presentation";
export const dynamic = "force-dynamic";
export default async function AdminAnalytics() {
  const client = await administratorClient();
  const result = await readAdminAnalytics(client);
  return <div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-3xl font-bold">Administration analytics</h1><p className="mt-3 text-muted-foreground">Live, read-only counts and timestamp samples. No revenue, growth, fraud or verification outcomes are inferred.</p></header>
    <AdminCoverage/><AdminMetrics metrics={result.metrics}/>
    <p className="text-sm text-muted-foreground">Each count is exact for its permitted query. Separate requests are not an atomic snapshot. Verification metrics include tenant/landlord roles only; a submitted reference does not prove a document is valid or reviewed.</p>
    <div className="grid gap-6 2xl:grid-cols-2"><AdminSample title="Recent property states and activity" sample={result.properties}/><AdminSample title="Recent application states and activity" sample={result.applications}/></div>
  </div>;
}
