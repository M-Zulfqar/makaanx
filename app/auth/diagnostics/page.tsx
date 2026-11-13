"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { collectAccessReport, emptyAccessReport, type AccessReport } from "@/lib/diagnostics/admin-access";

export default function AccessDiagnostics() {
  const [reports, setReports] = useState<{ browser: AccessReport; server: AccessReport } | null>(null);
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  async function run() {
    if (inFlight.current) return;
    inFlight.current = true; setBusy(true);
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    try {
      const browserPromise = (async () => {
        try { return (await collectAccessReport(createClient(), url)).report; }
        catch { const report = emptyAccessReport(url); report.errorCodes.configuration = "DIAGNOSTIC_UNAVAILABLE"; return report; }
      })();
      const serverPromise = (async () => {
        try {
          const response = await fetch("/auth/diagnostics/server", { cache: "no-store", credentials: "same-origin" });
          if (![200, 401, 503].includes(response.status)) throw new Error();
          return await response.json() as AccessReport;
        } catch {
          const report = emptyAccessReport(undefined); report.errorCodes.configuration = "SERVER_DIAGNOSTIC_UNAVAILABLE"; return report;
        }
      })();
      const [browser, server] = await Promise.all([browserPromise, serverPromise]);
      setReports({ browser, server });
    } finally { inFlight.current = false; setBusy(false); }
  }
  return <main className="mx-auto max-w-3xl space-y-5 p-6">
    <h1 className="text-2xl font-bold">Account access diagnostics</h1>
    <p>Run while signed in to compare browser and server access. This reads session authorization and counts only; it does not change profiles or permissions.</p>
    <button className="rounded border px-4 py-2" disabled={busy} onClick={run}>{busy ? "Checking…" : "Run read-only diagnostics"}</button>
    {reports && <div className="space-y-4" aria-live="polite">{(["browser", "server"] as const).map(source => <section key={source}>
      <h2 className="font-semibold capitalize">{source}</h2>
      <pre className="overflow-x-auto rounded border p-4 text-sm">{JSON.stringify(reports[source], null, 2)}</pre>
    </section>)}</div>}
    <Link className="block underline" href="/auth/login">Sign in</Link>
  </main>;
}
