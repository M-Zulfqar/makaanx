import { administratorClient } from "@/lib/admin/server";
import { AdminCoverage } from "@/components/admin/presentation";
import { Card, CardContent } from "@/components/ui/card";
export const dynamic = "force-dynamic";
export default async function AdminReports() {
  await administratorClient();
  // There is no confirmed reports interface. Do not probe a guessed table or
  // interpret absence of a configured schema as an empty report queue.
  return <div className="mx-auto max-w-5xl space-y-6"><header><h1 className="text-3xl font-bold">Reports management</h1><p className="mt-3 text-muted-foreground">Reporting and moderation are not configured.</p></header><AdminCoverage/>
    <Card><CardContent className="space-y-4 p-6"><h2 className="text-xl font-semibold">Pending schema and security review</h2>
      <p>No deployed reports schema, approved reporting API or audit workflow has been confirmed. No reports have been fetched, created, resolved or dismissed.</p>
      <p className="text-sm text-muted-foreground">A separate property-report schema, RLS and creation-audit proposal is prepared for review. Review submission and moderation stay disabled until the database design and role-isolation tests are approved and verified.</p>
      <p className="text-sm font-medium">This is an unavailable workflow, not an empty or zero-report result.</p>
    </CardContent></Card>
  </div>;
}
