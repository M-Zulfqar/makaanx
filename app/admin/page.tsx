import Link from "next/link";
import { administratorClient } from "@/lib/admin/server";
import { readAdminAnalytics } from "@/lib/admin/data";
import { AdminCoverage, AdminMetrics } from "@/components/admin/presentation";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const client = await administratorClient();
  const data = await readAdminAnalytics(client);
  const labels = ["Accessible users", "Accessible properties", "Accessible applications", "Submitted pending verification requests"];
  return <div className="mx-auto max-w-7xl space-y-6"><header><h1 className="text-3xl font-bold">Administration</h1><p className="mt-3 text-muted-foreground">Read-only management and staging readiness.</p></header><AdminCoverage/><AdminMetrics metrics={data.metrics.filter(metric => labels.includes(metric.label))}/>
    <section className="grid gap-4 sm:grid-cols-2">{[["Properties", "/admin/properties"], ["Analytics", "/admin/analytics"], ["Reports readiness", "/admin/reports"], ["Verification queue", "/admin/verifications"]].map(([label, href]) => <Link key={href} className="rounded-2xl border bg-card p-6 font-semibold transition-colors hover:bg-muted" href={href}>{label} →</Link>)}</section>
  </div>;
}
