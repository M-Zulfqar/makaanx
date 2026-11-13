import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { collectAccessReport, emptyAccessReport } from "@/lib/diagnostics/admin-access";

export const dynamic = "force-dynamic";
export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const headers = { "Cache-Control": "private, no-store", "Vary": "Cookie", "X-Robots-Tag": "noindex" };
  try {
    const { report, authenticated } = await collectAccessReport(await createClient(), url);
    return NextResponse.json(report, { status: authenticated ? 200 : 401, headers });
  } catch {
    const report = emptyAccessReport(url);
    report.errorCodes.configuration = "DIAGNOSTIC_UNAVAILABLE";
    return NextResponse.json(report, { status: 503, headers });
  }
}
