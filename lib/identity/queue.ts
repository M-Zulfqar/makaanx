import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { requireAdministrator } from "@/lib/admin/access";
import { type SearchParams } from "@/lib/rentals/schema";
import { readProfileCounts, readProfileProjection } from "@/lib/admin/profiles";
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
  const args = { p_search: filters.q, p_role: filters.role, p_status: filters.status === "all" ? "" : filters.status,
    p_submission: filters.submission, p_eligible: true };
  try {
    const [data, counts] = await Promise.all([
      readProfileProjection(client, args, IDENTITY_QUEUE_SIZE, (filters.page - 1) * IDENTITY_QUEUE_SIZE),
      readProfileCounts(client, args),
    ]);
    const parsed = rowsSchema.safeParse(data);
    if (!parsed.success) throw new Error();
    return { rows: parsed.data, count: counts.total };
  } catch { throw new Error("IDENTITY_QUEUE_UNAVAILABLE"); }
}
export function identityQueueHref(filters: IdentityQueueFilters, page: number) { return `/admin/verifications?${new URLSearchParams({ ...filters, page: String(page) })}`; }
