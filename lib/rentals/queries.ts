import type { SupabaseClient } from "@supabase/supabase-js";
import { PAGE_SIZE, PROPERTY_COLUMNS, literalSearch, propertyRowSchema, type RentalSearch, type RentalProperty } from "./schema";
import { checkDatabase, RentalError } from "./service";

export function propertyQuery(client: SupabaseClient, filters: RentalSearch, owner?: string) {
  let query = client.from("properties").select(PROPERTY_COLUMNS, { count: "exact" });
  query = owner ? query.eq("landlord_id", owner) : query.eq("status", "vacant");
  if (filters.q) query = query.ilike("title", literalSearch(filters.q));
  if (filters.city) query = query.ilike("city", literalSearch(filters.city));
  if (filters.type) query = query.eq("type", filters.type);
  if (filters.min !== undefined) query = query.gte("rent", filters.min);
  if (filters.max !== undefined) query = query.lte("rent", filters.max);
  if (filters.beds !== undefined) query = query.gte("bedrooms", filters.beds);
  query = filters.sort === "newest" ? query.order("created_at", { ascending: false })
    : query.order("rent", { ascending: filters.sort === "rent_low" });
  const start = (filters.page - 1) * PAGE_SIZE;
  return query.order("id", { ascending: true }).range(start, start + PAGE_SIZE - 1);
}
export function parseProperties(data: unknown): RentalProperty[] {
  const parsed = propertyRowSchema.array().safeParse(data);
  if (!parsed.success) throw new RentalError("SCHEMA_MISMATCH", "Listing information is incomplete or incompatible. Contact support.");
  return parsed.data;
}
export async function listProperties(client: SupabaseClient, filters: RentalSearch, owner?: string) {
  const result = await propertyQuery(client, filters, owner); checkDatabase(result.error);
  if (result.count === null) throw new RentalError("COUNT_UNAVAILABLE", "Unable to count listings.");
  return { properties: parseProperties(result.data), count: result.count };
}
// Walk every owned ID rather than silently truncating summaries to a page or
// relying on an unverified PostgREST relationship. Each request stays bounded.
export async function ownedPropertyIds(client: SupabaseClient, owner: string) {
  const ids: string[] = [];
  for (let start = 0; ;) {
    const result = await client.from("properties").select("id", { count: "exact" }).eq("landlord_id", owner).order("id").range(start, start + 199);
    checkDatabase(result.error);
    if (!result.data || result.count === null || (!result.data.length && start < result.count)) throw new RentalError("LOAD_FAILED", "Unable to completely load owned listings.");
    ids.push(...result.data.map(row => row.id as string));
    start += result.data.length;
    if (start >= result.count) return ids;
  }
}
export type RentalApplication = { id: string; property_id: string; tenant_id: string; status: string; created_at: string };
export async function landlordApplications(client: SupabaseClient, owner: string) {
  const ids = await ownedPropertyIds(client, owner);
  let total = 0, pending = 0;
  const recent: RentalApplication[] = [];
  // No fabricated total from limited result.length. Count each disjoint scope.
  for (let offset = 0; offset < ids.length; offset += 100) {
    const batch = ids.slice(offset, offset + 100);
    const [rows, waiting] = await Promise.all([
      client.from("applications").select("id,property_id,tenant_id,status,created_at", { count: "exact" })
        .in("property_id", batch).order("created_at", { ascending: false }).order("id", { ascending: false }).limit(100),
      client.from("applications").select("id", { count: "exact", head: true }).in("property_id", batch).eq("status", "pending"),
    ]);
    checkDatabase(rows.error); checkDatabase(waiting.error);
    if (rows.count === null || waiting.count === null) throw new RentalError("COUNT_UNAVAILABLE", "Application counts are unavailable.");
    total += rows.count; pending += waiting.count;
    if (!rows.data) throw new RentalError("LOAD_FAILED", "Unable to load application history.");
    const batchRows = [...rows.data] as RentalApplication[];
    while (batchRows.length < Math.min(100, rows.count)) {
      const more = await client.from("applications").select("id,property_id,tenant_id,status,created_at")
        .in("property_id", batch).order("created_at", { ascending: false }).order("id", { ascending: false }).range(batchRows.length, 99);
      checkDatabase(more.error);
      if (!more.data?.length) throw new RentalError("LOAD_FAILED", "Application history changed or could not be fully loaded. Refresh to retry.");
      batchRows.push(...more.data as RentalApplication[]);
    }
    recent.push(...batchRows);
  }
  recent.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id));
  return { total, pending, recent: recent.slice(0, 100) };
}
export function displayError(error: unknown) {
  return error instanceof RentalError ? error.message : "Unable to load rental information. Please try again.";
}
