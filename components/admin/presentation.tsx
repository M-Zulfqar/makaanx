import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { ActivitySample, Metric } from "@/lib/admin/data";
export function AdminCoverage() {
  return <aside className="space-y-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-5" aria-label="Data coverage">
    <h2 className="font-semibold">Accessible data · platform coverage unverified</h2>
    <p className="text-sm text-muted-foreground">Exact counts cover rows visible to this session under RLS. Successful queries, zero rows, or a true admin helper do not prove platform-wide access. Restricted datasets can succeed without an error.</p>
    <Link href="/auth/diagnostics" className="inline-block text-sm underline">Compare browser/server access diagnostics</Link>
  </aside>;
}
export function AdminMetrics({ metrics }: { metrics: Metric[] }) {
  return <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Accessible counts">{metrics.map(metric => <Card key={metric.label}><CardContent className="p-5"><h2 className="text-sm text-muted-foreground">{metric.label}</h2><p className="mt-2 text-3xl font-bold">{metric.value ?? "—"}</p>{metric.unavailable && <p role="alert" className="mt-2 text-xs">Count unavailable. No zero or global total is inferred.</p>}</CardContent></Card>)}</section>;
}
export function AdminSample({ title, sample }: { title: string; sample: ActivitySample }) {
  return <Card><CardContent className="space-y-4 p-5"><h2 className="text-xl font-semibold">{title}</h2>
    <p className="text-sm text-muted-foreground">Limited sample: {sample.unavailable ? "unavailable" : `${sample.size} returned records`} (latest {sample.limit} requested). These distributions and daily activity are not totals. Dates use Asia/Karachi; a day may contain additional records outside the sample.</p>
    {sample.unavailable ? <p role="alert">Unable to load this sample.</p> : <>
      {!sample.size && <p>No accessible sample records.</p>}
      <div className="grid gap-6 sm:grid-cols-2"><section><h3 className="mb-2 font-medium">States in this sample</h3><dl className="space-y-2">{sample.statuses.map(bucket => <div className="flex justify-between gap-3" key={bucket.label}><dt className="break-words">{bucket.label}</dt><dd>{bucket.count}</dd></div>)}</dl></section>
        <section><h3 className="mb-2 font-medium">Daily activity in this sample</h3><dl className="space-y-2">{sample.days.map(bucket => <div className="flex justify-between gap-3" key={bucket.label}><dt>{bucket.label}</dt><dd>{bucket.count}</dd></div>)}</dl>{sample.invalidTimestamps > 0 && <p className="mt-2 text-sm">{sample.invalidTimestamps} records have unavailable timestamps and are excluded from daily grouping.</p>}</section></div>
    </>}
  </CardContent></Card>;
}
