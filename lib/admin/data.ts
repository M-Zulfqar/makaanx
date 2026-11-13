import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdministrator } from "./access";
import { PAGE_SIZE, PROPERTY_COLUMNS, literalSearch, parseSearch, type RentalSearch, type SearchParams } from "@/lib/rentals/schema";
import { parseProperties } from "@/lib/rentals/queries";

export const COVERAGE = "accessible-unverified" as const;
export type AdminPropertyFilters = RentalSearch & { status: string };
export function parseAdminPropertyFilters(params: SearchParams) {
  const rental = parseSearch(params);
  const status = z.string().trim().max(40).safeParse(params.status ?? "");
  return { filters: { ...rental.filters, status: status.success ? status.data : "" }, error: rental.error || (!status.success ? "Check the listing status filter." : null) };
}
export function adminPropertyQuery(client: SupabaseClient, filters: AdminPropertyFilters) {
  let query = client.from("properties").select(PROPERTY_COLUMNS, { count: "exact" });
  // No owner or vacant-only predicate: RLS alone bounds administrator coverage.
  if (filters.q) query = query.ilike("title", literalSearch(filters.q));
  if (filters.city) query = query.ilike("city", literalSearch(filters.city));
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.min !== undefined) query = query.gte("rent", filters.min);
  if (filters.max !== undefined) query = query.lte("rent", filters.max);
  if (filters.beds !== undefined) query = query.gte("bedrooms", filters.beds);
  query = filters.sort === "newest" ? query.order("created_at", { ascending: false }) : query.order("rent", { ascending: filters.sort === "rent_low" });
  const start = (filters.page - 1) * PAGE_SIZE;
  return query.order("id", { ascending: true }).range(start, start + PAGE_SIZE - 1);
}
export async function readAdminProperties(client: SupabaseClient, filters: AdminPropertyFilters) {
  await requireAdministrator(client);
  const result = await adminPropertyQuery(client, filters);
  if (result.error || result.count === null) throw new Error("ADMIN_PROPERTIES_UNAVAILABLE");
  const properties = parseProperties(result.data);
  const names = new Map<string, string>();
  let ownerError = false;
  const ids = [...new Set(properties.map(row => row.landlord_id))];
  if (ids.length) {
    try {
      // No email, phone, CNIC paths, storage objects or other profile columns.
      const owners = await client.from("profiles").select("id,full_name").in("id", ids);
      ownerError = Boolean(owners.error || !owners.data);
      if (!ownerError) for (const owner of owners.data ?? []) {
        if (typeof owner.id === "string" && typeof owner.full_name === "string" && owner.full_name.trim()) names.set(owner.id, owner.full_name);
      }
    } catch { ownerError = true; }
  }
  return { properties, count: result.count, names, ownerError, coverage: COVERAGE };
}
export type Metric = { label: string; value: number | null; unavailable: boolean };
export function metric(label: string, result: { count: number | null; error: unknown }): Metric {
  const valid = !result.error && typeof result.count === "number" && Number.isSafeInteger(result.count) && result.count >= 0;
  return { label, value: valid ? result.count : null, unavailable: !valid };
}
const SAMPLE_LIMIT = 100;
export type ActivitySample = { size: number; limit: number; unavailable: boolean; statuses: { label: string; count: number }[]; days: { label: string; count: number }[]; invalidTimestamps: number };
export function summarizeSample(result: { data: unknown; error: unknown }): ActivitySample {
  const parsed = z.array(z.object({ status: z.string().nullable(), created_at: z.string().nullable() })).safeParse(result.data);
  const summary: ActivitySample = { size: 0, limit: SAMPLE_LIMIT, unavailable: Boolean(result.error || !parsed.success), statuses: [], days: [], invalidTimestamps: 0 };
  if (summary.unavailable || !parsed.success) return summary;
  const statuses = new Map<string, number>(), days = new Map<string, number>();
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Karachi", year: "numeric", month: "2-digit", day: "2-digit" });
  for (const row of parsed.data.slice(0, SAMPLE_LIMIT)) {
    const status = row.status?.trim() || "Unspecified";
    statuses.set(status, (statuses.get(status) ?? 0) + 1);
    const timestamp = row.created_at === null ? NaN : Date.parse(row.created_at);
    if (!Number.isFinite(timestamp)) { summary.invalidTimestamps++; continue; }
    const label = day.format(new Date(timestamp)); days.set(label, (days.get(label) ?? 0) + 1);
  }
  summary.size = Math.min(parsed.data.length, SAMPLE_LIMIT);
  summary.statuses = [...statuses].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
  summary.days = [...days].map(([label, count]) => ({ label, count })).sort((a, b) => a.label.localeCompare(b.label));
  return summary;
}
export async function readAdminAnalytics(client: SupabaseClient) {
  await requireAdministrator(client);
  // Every count is exact for its own RLS-scoped request, never a global guarantee.
  const queries = [
    ["Accessible users", client.from("profiles").select("id", { count: "exact", head: true })],
    ...["admin", "landlord", "tenant"].map(role => [`Accessible ${role} profiles`, client.from("profiles").select("id", { count: "exact", head: true }).eq("role", role)] as const),
    ["Accessible properties", client.from("properties").select("id", { count: "exact", head: true })],
    ["Accessible applications", client.from("applications").select("id", { count: "exact", head: true })],
    ...["pending", "approved", "rejected"].map(status => [`Accessible ${status} applications`, client.from("applications").select("id", { count: "exact", head: true }).eq("status", status)] as const),
    ["Pending eligible profiles", client.from("profiles").select("id", { count: "exact", head: true }).in("role", ["tenant", "landlord"]).eq("verification_status", "pending")],
    ["Submitted pending verification requests", client.from("profiles").select("id", { count: "exact", head: true }).in("role", ["tenant", "landlord"]).eq("verification_status", "pending").not("cnic_path", "is", null)],
  ] as const;
  const [metrics, properties, applications] = await Promise.all([
    Promise.all(queries.map(async ([label, query]) => {
      try { return metric(label, await query); } catch { return metric(label, { count: null, error: true }); }
    })),
    (async () => { try { return summarizeSample(await client.from("properties").select("status,created_at").order("created_at", { ascending: false }).order("id").limit(SAMPLE_LIMIT)); } catch { return summarizeSample({ data: null, error: true }); } })(),
    (async () => { try { return summarizeSample(await client.from("applications").select("status,created_at").order("created_at", { ascending: false }).order("id").limit(SAMPLE_LIMIT)); } catch { return summarizeSample({ data: null, error: true }); } })(),
  ]);
  return { metrics, properties, applications, coverage: COVERAGE };
}
