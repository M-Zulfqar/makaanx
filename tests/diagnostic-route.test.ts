import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ createClient: vi.fn(), collect: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("@/lib/diagnostics/admin-access", async (original) => ({ ...await original<typeof import("../lib/diagnostics/admin-access")>(), collectAccessReport: mocks.collect }));
import { GET } from "../app/auth/diagnostics/server/route";
import { emptyAccessReport } from "../lib/diagnostics/admin-access";
beforeEach(() => { vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://ficudncgevvxsxbjscrk.supabase.co"); mocks.createClient.mockResolvedValue({}); });
test("anonymous diagnostic is private, uncached and denied", async () => {
  const report = emptyAccessReport(process.env.NEXT_PUBLIC_SUPABASE_URL);
  mocks.collect.mockResolvedValue({ report, authenticated: false });
  const response = await GET();
  expect(response.status).toBe(401); expect(await response.json()).toEqual(report);
  expect(response.headers.get("cache-control")).toBe("private, no-store"); expect(response.headers.get("vary")).toBe("Cookie");
});
test("authenticated diagnostic returns only its allowlisted report", async () => {
  const report = emptyAccessReport(process.env.NEXT_PUBLIC_SUPABASE_URL);
  mocks.collect.mockResolvedValue({ report, authenticated: true });
  const response = await GET(); expect(response.status).toBe(200); expect(await response.json()).toEqual(report);
});
test("unexpected configuration errors do not expose secrets", async () => {
  mocks.createClient.mockRejectedValue(new Error("PRIVATE_SECRET"));
  const response = await GET(); expect(response.status).toBe(503);
  expect(await response.text()).not.toContain("PRIVATE_SECRET");
});
