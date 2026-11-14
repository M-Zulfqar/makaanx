import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

// Cross-profile reads use only the guarded RPC contract. No base-table fallback.
const profileSchema = z.object({
  id: z.uuid(), full_name: z.string().nullable(), role: z.enum(["admin", "tenant", "landlord"]),
  verification_status: z.string().nullable(), has_document: z.boolean(),
});
const count = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
const countsSchema = z.array(z.object({ total: count, admins: count, landlords: count, tenants: count, pending: count, submitted: count })).length(1);
export type ProfileFilters = {
  p_search?: string; p_role?: string; p_status?: string; p_submission?: string;
  p_eligible?: boolean; p_ids?: string[];
};
type RpcClient = Pick<SupabaseClient, "rpc">;
export async function readProfileProjection(client: RpcClient, filters: ProfileFilters = {}, limit = 100, offset = 0) {
  const result = await client.rpc("makaanx_admin_profiles", { ...filters, p_limit: limit, p_offset: offset });
  const parsed = z.array(profileSchema).max(limit).safeParse(result.data);
  if (result.error || !parsed.success) throw new Error("ADMIN_PROFILES_UNAVAILABLE");
  return parsed.data;
}
export function parseProfileCounts(data: unknown) { return countsSchema.safeParse(data); }
export async function readProfileCounts(client: RpcClient, filters: ProfileFilters = {}) {
  const result = await client.rpc("makaanx_admin_profile_counts", filters);
  const parsed = parseProfileCounts(result.data);
  if (result.error || !parsed.success) throw new Error("ADMIN_PROFILE_COUNTS_UNAVAILABLE");
  return parsed.data[0];
}
