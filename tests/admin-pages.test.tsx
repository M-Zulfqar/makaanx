import React from "react";
import { beforeEach, expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { rentalClient, roleReply, propertyId, landlordId, hasOperation } from "./helpers/rental-client";
const mocks = vi.hoisted(() => ({ client: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));
vi.mock("@/lib/admin/server", () => ({ administratorClient: mocks.client }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
import Properties from "../app/admin/properties/page";
import Reports from "../app/admin/reports/page";
import Verifications from "../app/admin/verifications/page";
import Settings from "../app/admin/settings/page";
beforeEach(() => vi.clearAllMocks());
test("reports page states unavailable configuration without probing an invented table", async () => {
  const f = rentalClient([]); mocks.client.mockResolvedValue(f.client);
  const html = renderToStaticMarkup(await Reports());
  expect(html).toContain("Pending schema and security review"); expect(html).toContain("not an empty or zero-report result");
  expect(f.calls).toHaveLength(0); expect(html).not.toContain("No reports found");
});
test("server property page cannot load data before authorization", async () => {
  const f = rentalClient([]); mocks.client.mockRejectedValue(new Error("DENIED"));
  await expect(Properties({ searchParams: Promise.resolve({}) })).rejects.toThrow("DENIED"); expect(f.calls).toHaveLength(0);
});
test("restricted properties render coverage caveat and honest owner absence", async () => {
  const row = { id: propertyId, landlord_id: landlordId, title: "Permitted property", address: "Street 1", city: "Lahore", type: "House", status: "occupied", rent: 50000, bedrooms: 2, bathrooms: 1, area: 900, created_at: "2026-11-14T00:00:00Z" };
  const f = rentalClient([roleReply("admin"), { data: [row], count: 1 }, { data: [] }]); mocks.client.mockResolvedValue(f.client);
  const html = renderToStaticMarkup(await Properties({ searchParams: Promise.resolve({}) }));
  expect(html).toContain("platform coverage unverified"); expect(html).toContain("Permitted property");
  expect(html).toContain("Name unavailable in permitted profile records"); expect(html).not.toContain("Delete listing");
  expect(html).not.toContain("Edit listing"); expect(html).not.toMatch(/cnic-|signedUrl|PRIVATE/);
});
test("invalid property filters do not query listings", async () => {
  const f = rentalClient([]); mocks.client.mockResolvedValue(f.client);
  const html = renderToStaticMarkup(await Properties({ searchParams: Promise.resolve({ page: "-1" }) }));
  expect(html).toContain('role="alert"'); expect(f.calls).toHaveLength(0);
});
test("verification queue excludes admins and counts all submitted rows, not just a sample", async () => {
  const f = rentalClient([{ data: [{ id: propertyId, full_name: "Applicant", role: "tenant", verification_status: "pending" }], count: 99 }, { data: null, count: 4 }]); mocks.client.mockResolvedValue(f.client);
  const html = renderToStaticMarkup(await Verifications()); expect(html).toContain(">99<");
  for (const call of f.calls) expect(hasOperation(call, "in", "role", ["tenant", "landlord"])).toBe(true);
  expect(f.calls.flatMap(c => c.operations.filter(op => op.name === "select").map(op => String(op.args[0]))).join()).not.toContain("cnic_path");
});
test("settings no longer pretends to save, back up or monitor services", async () => {
  mocks.client.mockResolvedValue(rentalClient([]).client);
  const html = renderToStaticMarkup(await Settings());
  expect(html).toContain("No monitoring or backup provider is connected"); expect(html).not.toContain("Backup started"); expect(html).not.toContain("234 GB");
});
