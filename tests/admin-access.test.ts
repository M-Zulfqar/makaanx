import { describe, expect, test, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { collectAccessReport, projectReference } from "../lib/diagnostics/admin-access";

const url = "https://ficudncgevvxsxbjscrk.supabase.co";
function fixture() {
  const getUser = vi.fn().mockResolvedValue({ data: { user: { id: "PRIVATE_ID", email: "PRIVATE_EMAIL" } }, error: null });
  const getClaims = vi.fn().mockResolvedValue({ data: { claims: { role: "authenticated", iss: `${url}/auth/v1`, sub: "PRIVATE_ID", access_token: "PRIVATE_TOKEN" } }, error: null });
  const rpc = vi.fn().mockResolvedValueOnce({ data: true, error: null }).mockResolvedValue({ data: [{total:6,admins:1,landlords:1,tenants:4,pending:5,submitted:1}], error: null });
  const select = vi.fn().mockResolvedValue({ count: 1, error: null, data: [{ id: "NEVER_SERIALIZE" }] });
  const from = vi.fn().mockReturnValue({ select });
  const client = { auth: { getUser, getClaims }, rpc, from } as unknown as SupabaseClient;
  return { client, getUser, getClaims, rpc, select, from };
}

describe("privacy-safe access diagnostics", () => {
  test("admin count uses the restricted projection, never the direct RLS count", async () => {
    const f = fixture();
    const { report, authenticated } = await collectAccessReport(f.client, url);
    expect(authenticated).toBe(true);
    expect(report).toEqual({ projectReference: "ficudncgevvxsxbjscrk", authenticatedRole: "authenticated", adminRpcResult: true, accessibleProfileCount: 6, accessibleProfileCountScope: "admin-projection", errorCodes: {} });
    expect(f.rpc).toHaveBeenCalledWith("makaanx_is_admin");
    expect(f.rpc).toHaveBeenCalledWith("makaanx_admin_profile_counts", {});
    expect(f.select).not.toHaveBeenCalled();
    expect(JSON.stringify(report)).not.toMatch(/PRIVATE|NEVER_SERIALIZE/);
  });
  test("preserves a false helper result and zero count", async () => {
    const f = fixture(); f.rpc.mockReset().mockResolvedValue({ data: false, error: null }); f.select.mockResolvedValue({ count: 0, error: null });
    const { report } = await collectAccessReport(f.client, url);
    expect(report.adminRpcResult).toBe(false); expect(report.accessibleProfileCount).toBe(0);
    expect(report.accessibleProfileCountScope).toBe("own-rls");
    expect(f.select).toHaveBeenCalledWith("id", { count: "exact", head: true });
  });
  test("unauthenticated callers cannot invoke the helper or profile query", async () => {
    const f = fixture(); f.getUser.mockResolvedValue({ data: { user: null }, error: null });
    const { report, authenticated } = await collectAccessReport(f.client, url);
    expect(authenticated).toBe(false); expect(report.errorCodes.auth).toBe("AUTH_REQUIRED");
    expect(f.rpc).not.toHaveBeenCalled(); expect(f.from).not.toHaveBeenCalled();
  });
  test("wrong-project JWT is flagged without echoing issuer/claims or querying data", async () => {
    const f = fixture(); f.getClaims.mockResolvedValue({ data: { claims: { role: "authenticated", iss: "https://aaaaaaaaaaaaaaaaaaaa.supabase.co/auth/v1" } }, error: null });
    const { report } = await collectAccessReport(f.client, url);
    expect(report.errorCodes.claims).toBe("JWT_PROJECT_MISMATCH"); expect(f.from).not.toHaveBeenCalled();
    expect(JSON.stringify(report)).not.toContain("aaaaaaaaaaaaaaaaaaaa");
  });
  test("unverified claims cannot drive further queries", async () => {
    const f = fixture(); f.getClaims.mockResolvedValue({ data: null, error: { code: "bad_jwt", message: "PRIVATE_TOKEN" } });
    const { report } = await collectAccessReport(f.client, url);
    expect(report.errorCodes.claims).toBe("bad_jwt"); expect(f.rpc).not.toHaveBeenCalled();
  });
  test("query errors expose codes only and never become zero counts", async () => {
    const f = fixture(); f.rpc.mockReset().mockResolvedValue({ data: null, error: { code: "42501", message: "PRIVATE_EMAIL", details: "PRIVATE_TOKEN" } });
    f.select.mockRejectedValue(new Error("PRIVATE_TOKEN"));
    const { report } = await collectAccessReport(f.client, url);
    expect(report.adminRpcResult).toBeNull(); expect(report.accessibleProfileCount).toBeNull();
    expect(report.errorCodes).toEqual({ adminRpc: "42501" });
    expect(JSON.stringify(report)).not.toContain("PRIVATE");
  });
  test("malformed RPC result and missing count stay unavailable", async () => {
    const f = fixture(); f.rpc.mockReset().mockResolvedValue({ data: { token: "PRIVATE_TOKEN" }, error: null }); f.select.mockResolvedValue({ count: null, error: null });
    const { report } = await collectAccessReport(f.client, url);
    expect(report.errorCodes).toEqual({ adminRpc: "UNEXPECTED_RPC_RESULT" });
  });
  test("missing admin counts remain unavailable without falling back to own rows", async () => {
    const f=fixture(); f.rpc.mockReset().mockResolvedValueOnce({data:true,error:null}).mockResolvedValueOnce({data:null,error:{code:"PGRST202",message:"PRIVATE"}});
    const {report}=await collectAccessReport(f.client,url);
    expect(report.accessibleProfileCountScope).toBe("admin-projection"); expect(report.accessibleProfileCount).toBeNull();
    expect(report.errorCodes.profiles).toBe("PGRST202"); expect(f.select).not.toHaveBeenCalled();
  });
  test("unsafe/malformed aggregates are not accepted as valid counts", async () => {
    const f=fixture(); f.rpc.mockReset().mockResolvedValueOnce({data:true,error:null}).mockResolvedValueOnce({data:[{total:-1}],error:null});
    const {report}=await collectAccessReport(f.client,url); expect(report.errorCodes.profiles).toBe("COUNT_UNAVAILABLE");
    expect(report.accessibleProfileCount).toBeNull(); expect(f.select).not.toHaveBeenCalled();
  });
  test("only HTTPS Supabase project hostnames are reported", () => {
    expect(projectReference(undefined)).toBeNull(); expect(projectReference("https://example.com/PRIVATE_TOKEN")).toBeNull();
    expect(projectReference("http://ficudncgevvxsxbjscrk.supabase.co")).toBeNull();
  });
});
