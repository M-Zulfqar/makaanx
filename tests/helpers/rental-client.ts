import { isDeepStrictEqual } from "node:util";
import { vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
export const tenantId = "10000000-0000-4000-8000-000000000001";
export const landlordId = "20000000-0000-4000-8000-000000000001";
export const propertyId = "30000000-0000-4000-8000-000000000001";
export const applicationId = "40000000-0000-4000-8000-000000000001";
export type Reply = { data: unknown; error?: { code: string; message?: string } | null; count?: number | null };
export type Call = { table: string; operations: { name: string; args: unknown[] }[] };
export function rentalClient(replies: Reply[], role = "tenant", authenticated = true) {
  const calls: Call[] = [];
  const queue = [...replies];
  const resolve = () => {
    const reply = queue.shift();
    if (!reply) throw new Error("Unexpected database query in test fixture");
    return { error: null, count: null, ...reply };
  };
  const from = vi.fn((table: string) => {
    const call: Call = { table, operations: [] }; calls.push(call);
    const query: Record<string, unknown> = {};
    for (const name of ["select", "insert", "update", "delete", "eq", "in", "ilike", "gte", "lte", "order", "limit", "range", "not", "is", "neq", "or"]) {
      query[name] = (...args: unknown[]) => { call.operations.push({ name, args }); return query; };
    }
    query.maybeSingle = () => Promise.resolve(resolve());
    query.then = (onfulfilled: (value: ReturnType<typeof resolve>) => unknown) => Promise.resolve(resolve()).then(onfulfilled);
    return query;
  });
  const getUser = vi.fn().mockResolvedValue({ data: { user: authenticated ? { id: role === "landlord" ? landlordId : tenantId } : null }, error: null });
  return { client: { auth: { getUser }, from } as unknown as SupabaseClient, calls, getUser, remaining: () => queue.length };
}
export const roleReply = (role: string): Reply => ({ data: { role } });
export const hasOperation = (call: Call, name: string, ...args: unknown[]) => call.operations.some(op => op.name === name && isDeepStrictEqual(op.args, args));
