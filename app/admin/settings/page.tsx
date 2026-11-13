import Link from "next/link";
import { administratorClient } from "@/lib/admin/server";
import { Card, CardContent } from "@/components/ui/card";
export const dynamic = "force-dynamic";
export default async function AdminSettings() {
  await administratorClient();
  return <div className="mx-auto max-w-5xl space-y-6"><h1 className="text-3xl font-bold">Administration settings</h1><p className="text-muted-foreground">Read-only configuration readiness. Theme controls remain available in the header.</p>
    <div className="grid gap-4 sm:grid-cols-2">{[
      ["Account security", "Session and role checks run on the server. Privileged account changes are not available here."],
      ["Moderation", "Property moderation and identity decisions remain disabled pending database authorization and audit review."],
      ["Monitoring and backups", "No monitoring or backup provider is connected. Uptime, storage, backup and response-time figures are unavailable."],
      ["Notifications", "Delivery, alert recipients and notification preferences are not connected. No settings have been saved."],
    ].map(([title, message]) => <Card key={title}><CardContent className="space-y-3 p-5"><h2 className="font-semibold">{title}</h2><p className="text-sm text-muted-foreground">{message}</p></CardContent></Card>)}</div>
    <Link className="inline-block underline" href="/auth/diagnostics">Read-only session diagnostics</Link>
  </div>;
}
