import { describe, expect, test } from "vitest";
import { requireAdministrator } from "../lib/admin/access";
import { adminPropertyQuery, parseAdminPropertyFilters, readAdminProperties, readAdminAnalytics, metric, summarizeSample, COVERAGE } from "../lib/admin/data";
import { searchHref } from "../lib/rentals/schema";
import { hasOperation, landlordId, propertyId, rentalClient, roleReply, type Reply } from "./helpers/rental-client";
const row = { id: propertyId, landlord_id: landlordId, title: "Permitted listing", address: "Street 1", city: "Lahore", type: "House", status: "occupied", rent: 50000, bedrooms: 2, bathrooms: 1, area: 900, created_at: "2026-11-14T00:00:00Z" };
describe("administrator authorization", () => {
  test("anonymous calls stop before profile or bulk queries", async () => {
    const f = rentalClient([], "tenant", false);
    await expect(requireAdministrator(f.client)).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
    expect(f.calls).toHaveLength(0);
  });
  test.each(["tenant", "landlord"])("%s cannot load administrator data", async role => {
    const f = rentalClient([roleReply(role)]);
    await expect(readAdminProperties(f.client, parseAdminPropertyFilters({}).filters)).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(f.calls.map(c => c.table)).toEqual(["profiles"]);
  });
  test("profile permission errors fail closed instead of trusting metadata", async () => {
    const f = rentalClient([{ data: { role: "admin" }, error: { code: "42501", message: "PRIVATE_DETAIL" } }]);
    await expect(requireAdministrator(f.client)).rejects.toMatchObject({ code: "UNAVAILABLE" });
  });
  test("admin analytics denies non-admin before constructing count queries", async () => {
    const f = rentalClient([roleReply("tenant")]);
    await expect(readAdminAnalytics(f.client)).rejects.toMatchObject({ code: "FORBIDDEN" }); expect(f.calls).toHaveLength(1);
  });
});
describe("administrator properties", () => {
  test("unfiltered reader includes any accessible status without an owner filter", async () => {
    const f = rentalClient([{ data: [row], count: 1 }]);
    await adminPropertyQuery(f.client, parseAdminPropertyFilters({}).filters);
    expect(f.calls[0].operations.filter(op => op.name === "eq")).toHaveLength(0);
  });
  test("literal search, filters, sorting and pagination retain listing status", async () => {
    const filters = parseAdminPropertyFilters({ q: "50%_", city: "Lahore", type: "House", status: "occupied", min: "100", max: "60000", beds: "2", page: "2", sort: "rent_high" }).filters;
    const f = rentalClient([{ data: [], count: 0 }]); await adminPropertyQuery(f.client, filters);
    expect(hasOperation(f.calls[0], "ilike", "title", "%50\\%\\_%")).toBe(true);
    expect(hasOperation(f.calls[0], "eq", "status", "occupied")).toBe(true);
    expect(hasOperation(f.calls[0], "order", "rent", { ascending: false })).toBe(true);
    expect(hasOperation(f.calls[0], "order", "id", { ascending: true })).toBe(true);
    expect(hasOperation(f.calls[0], "range", 12, 23)).toBe(true);
    expect(searchHref("/admin/properties", filters, 3)).toContain("status=occupied");
  });
  test("rejects malformed/repeated filters", () => {
    expect(parseAdminPropertyFilters({ status: ["open", "closed"] }).error).toBeTruthy();
    expect(parseAdminPropertyFilters({ sort: "email" }).error).toBeTruthy();
  });
  test("restricted owner profiles are not invented, and one row is not a global total", async () => {
    const f = rentalClient([roleReply("admin"), { data: [row], count: 1 }, { data: [] }]);
    const result = await readAdminProperties(f.client, parseAdminPropertyFilters({}).filters);
    expect(result.coverage).toBe(COVERAGE); expect(result.count).toBe(1); expect(result.names.size).toBe(0);
    expect(hasOperation(f.calls[2], "select", "id,full_name")).toBe(true);
    expect(JSON.stringify(result)).not.toMatch(/cnic_path|email|phone|signedUrl/);
  });
  test("allowed owner names are mapped using only the permitted profile fields", async () => {
    const f = rentalClient([roleReply("admin"), { data: [row], count: 1 }, { data: [{ id: landlordId, full_name: "Allowed owner", cnic_path: "PRIVATE_SENTINEL" }] }]);
    const result = await readAdminProperties(f.client, parseAdminPropertyFilters({}).filters);
    expect(result.names.get(landlordId)).toBe("Allowed owner"); expect([...result.names.values()]).not.toContain("PRIVATE_SENTINEL");
  });
  test("owner lookup failure preserves permitted listings without leaking errors", async () => {
    const f = rentalClient([roleReply("admin"), { data: [row], count: 1 }, { data: null, error: { code: "42501", message: "PRIVATE_SENTINEL" } }]);
    const result = await readAdminProperties(f.client, parseAdminPropertyFilters({}).filters);
    expect(result.ownerError).toBe(true); expect(result.properties).toHaveLength(1);
  });
  test("database failures are not empty property datasets", async () => {
    const f = rentalClient([roleReply("admin"), { data: null, count: null, error: { code: "42501" } }]);
    await expect(readAdminProperties(f.client, parseAdminPropertyFilters({}).filters)).rejects.toThrow("ADMIN_PROPERTIES_UNAVAILABLE");
  });
});
describe("analytics accuracy and privacy", () => {
  test("successful zero is distinct from unavailable count metadata or errors", () => {
    expect(metric("Zero", { count: 0, error: null })).toMatchObject({ value: 0, unavailable: false });
    expect(metric("Missing", { count: null, error: null })).toMatchObject({ value: null, unavailable: true });
    expect(metric("Denied", { count: 0, error: { message: "PRIVATE" } })).toMatchObject({ value: null, unavailable: true });
  });
  test("sample distributions stay bounded and use Karachi dates", () => {
    const sample = summarizeSample({ data: Array.from({ length: 150 }, () => ({ status: "pending", created_at: "2026-11-13T22:00:00Z" })), error: null });
    expect(sample.size).toBe(100); expect(sample.limit).toBe(100); expect(sample.statuses).toEqual([{ label: "pending", count: 100 }]);
    expect(sample.days).toEqual([{ label: "2026-11-14", count: 100 }]);
  });
  test("invalid timestamps are excluded without inventing activity", () => {
    const sample = summarizeSample({ data: [{ status: null, created_at: "invalid" }], error: null });
    expect(sample.invalidTimestamps).toBe(1); expect(sample.days).toEqual([]); expect(sample.statuses).toEqual([{ label: "Unspecified", count: 1 }]);
    expect(summarizeSample({ data: [], error: { code: "42501" } }).unavailable).toBe(true);
  });
  test("metrics exclude ineligible verification roles and never select private documents", async () => {
    const replies: Reply[] = [roleReply("admin"), ...Array.from({ length: 11 }, () => ({ data: null, count: 1 })), { data: [{ status: "occupied", created_at: "2026-11-14T00:00:00Z" }] }, { data: [], error: { code: "42501", message: "PRIVATE" } }];
    const f = rentalClient(replies); const result = await readAdminAnalytics(f.client);
    expect(result.coverage).toBe("accessible-unverified"); expect(result.metrics).toHaveLength(11);
    expect(result.applications.unavailable).toBe(true);
    const eligible = f.calls.filter(c => hasOperation(c, "eq", "verification_status", "pending"));
    expect(eligible).toHaveLength(2);
    for (const call of eligible) expect(hasOperation(call, "in", "role", ["tenant", "landlord"])).toBe(true);
    const selects = f.calls.flatMap(c => c.operations.filter(op => op.name === "select").map(op => op.args[0]));
    expect(selects.join(" ")).not.toMatch(/cnic|phone|email|storage/);
    expect(JSON.stringify(result)).not.toContain("PRIVATE");
    expect(result.properties.size).toBe(1); expect(result.metrics[4].value).toBe(1);
  });
});
