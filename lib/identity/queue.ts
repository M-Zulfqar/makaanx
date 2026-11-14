import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdministrator } from "@/lib/admin/access";
import { literalSearch, type SearchParams } from "@/lib/rentals/schema";
export const IDENTITY_QUEUE_SIZE = 12;
const filterSchema = z.object({
  q: z.string().trim().max(100).default(""), role: z.enum(["", "tenant", "landlord"]).default(""),
  status: z.enum(["pending", "verified", "rejected", "all"]).default("pending"),
  submission: z.enum(["submitted", "incomplete", "all"]).default("submitted"),
  page: z.preprocess(v => v === undefined || v === "" ? 1 : Number(v), z.number().int().min(1).max(10000)),
});
export type IdentityQueueFilters = z.infer<typeof filterSchema>;
export function parseIdentityQueue(params: SearchParams) {
  const parsed = filterSchema.safeParse(params);
  return parsed.success ? { filters: parsed.data, error: null } : { filters: filterSchema.parse({}), error: "Check the queue filters and page number." };
}
const rowsSchema = z.array(z.object({ id: z.uuid(), full_name: z.string().nullable(), role: z.enum(["tenant", "landlord"]), verification_status: z.string().nullable() }));
export async function readIdentityQueue(client: SupabaseClient, filters: IdentityQueueFilters) {
  await requireAdministrator(client);
  let query = client.from("profiles").select("id,full_name,role,verification_status", { count: "exact" }).in("role", ["tenant", "landlord"]);
  if (filters.q) query = query.ilike("full_name", literalSearch(filters.q));
  if (filters.role) query = query.eq("role", filters.role);
  if (filters.status !== "all") query = query.eq("verification_status", filters.status);
  if (filters.submission === "submitted") query = query.not("cnic_path", "is", null);
  if (filters.submission === "incomplete") query = query.is("cnic_path", null);
  const start = (filters.page - 1) * IDENTITY_QUEUE_SIZE;
  const result = await query.order("id").range(start, start + IDENTITY_QUEUE_SIZE - 1);
  const parsed = rowsSchema.safeParse(result.data);
  if (result.error || !parsed.success || !Number.isSafeInteger(result.count) || result.count === null || result.count < 0) throw new Error("IDENTITY_QUEUE_UNAVAILABLE");
  // Parsed allowlist intentionally strips any unexpected/private response fields.
  return { rows: parsed.data, count: result.count };
}
export function identityQueueHref(filters: IdentityQueueFilters, page: number) { return `/admin/verifications?${new URLSearchParams({ ...filters, page: String(page) })}`; }
