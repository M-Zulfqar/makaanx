import { expect, test } from "vitest";
import { parseSearch, literalSearch, searchHref, propertyInputSchema } from "../lib/rentals/schema";
import { listProperties, ownedPropertyIds, landlordApplications } from "../lib/rentals/queries";
import { hasOperation, landlordId, propertyId, rentalClient } from "./helpers/rental-client";
export const row = { id: propertyId, landlord_id: landlordId, title: "A home", address: "Street 1", city: "Lahore", type: "House", status: "vacant", rent: "45000", bedrooms: 2, bathrooms: 1, area: 900, created_at: "2026-11-14T00:00:00Z" };
test("rejects reversed rent filters, repeated query values and invalid sort/page", () => {
  for (const params of [{ min: "20", max: "10" }, { page: "0" }, { page: ["1", "2"] }, { sort: "landlord_id" }, { beds: "-1" }]) expect(parseSearch(params).error).toBeTruthy();
});
test("numeric inputs do not accept zero rent, infinity or owner/status injection", () => {
  const input = { title: "Home", address: "Road 1", city: "Lahore", type: "House", rent: 1, bedrooms: 1, bathrooms: 1, area: 1 };
  expect(propertyInputSchema.safeParse(input).success).toBe(true);
  for (const bad of [{ ...input, rent: 0 }, { ...input, rent: Infinity }, { ...input, bedrooms: 1.5 }, { ...input, status: "occupied" }]) expect(propertyInputSchema.safeParse(bad).success).toBe(false);
});
test("search uses literal patterns and bounded, stable pagination", async () => {
  const filters = parseSearch({ q: "50%_off", city: "Lahore", min: "10", max: "50000", beds: "2", type: "House", sort: "rent_low", page: "2" }).filters;
  const f = rentalClient([{ data: [row], count: 20 }]);
  expect((await listProperties(f.client, filters)).count).toBe(20);
  expect(hasOperation(f.calls[0], "ilike", "title", "%50\\%\\_off%")).toBe(true);
  expect(hasOperation(f.calls[0], "range", 12, 23)).toBe(true);
  expect(hasOperation(f.calls[0], "order", "id", { ascending: true })).toBe(true);
  expect(hasOperation(f.calls[0], "eq", "status", "vacant")).toBe(true);
  expect(literalSearch("x),id.eq.secret")).toBe("%x),id.eq.secret%");
  expect(f.calls[0].operations.some(op => op.name === "or")).toBe(false);
  expect(searchHref("/properties", filters, 3)).toContain("page=3");
  expect(searchHref("/properties", filters, 3)).toContain("min=10");
});
test("owner search is scoped without hiding occupied owned listings", async () => {
  const f = rentalClient([{ data: [], count: 0 }]); await listProperties(f.client, parseSearch({}).filters, landlordId);
  expect(hasOperation(f.calls[0], "eq", "landlord_id", landlordId)).toBe(true);
  expect(hasOperation(f.calls[0], "eq", "status", "vacant")).toBe(false);
});
test("schema incompatibility and database failures do not become empty results", async () => {
  await expect(listProperties(rentalClient([{ data: [{ id: propertyId }], count: 1 }]).client, parseSearch({}).filters)).rejects.toMatchObject({ code: "SCHEMA_MISMATCH" });
  await expect(listProperties(rentalClient([{ data: null, error: { code: "42501" } }]).client, parseSearch({}).filters)).rejects.toMatchObject({ code: "ACCESS_DENIED" });
});
test("owned ID scan follows actual returned rows if the API caps a page", async () => {
  const f = rentalClient([{ data: [{ id: propertyId }], count: 2 }, { data: [{ id: "other" }], count: 2 }]);
  expect(await ownedPropertyIds(f.client, landlordId)).toEqual([propertyId, "other"]);
  expect(hasOperation(f.calls[1], "range", 1, 200)).toBe(true);
});
test("an incomplete owner scan fails instead of returning partial totals", async () => {
  const f = rentalClient([{ data: [], count: 2 }]);
  await expect(ownedPropertyIds(f.client, landlordId)).rejects.toMatchObject({ code: "LOAD_FAILED" });
});
test("application totals use exact counts, not the recent-row array length", async () => {
  const applications = Array.from({ length: 100 }, (_, i) => ({ id: String(i), property_id: propertyId, tenant_id: "tenant", status: "pending", created_at: "2026-11-14T00:00:00Z" }));
  const f = rentalClient([{ data: [{ id: propertyId }], count: 1 }, { data: applications, count: 500 }, { data: null, count: 150 }]);
  const summary = await landlordApplications(f.client, landlordId);
  expect(summary.total).toBe(500); expect(summary.pending).toBe(150); expect(summary.recent).toHaveLength(100);
  expect(hasOperation(f.calls[1], "in", "property_id", [propertyId])).toBe(true);
});
test("no owned listings means no cross-owner application reads", async () => {
  const f = rentalClient([{ data: [], count: 0 }]);
  expect(await landlordApplications(f.client, landlordId)).toEqual({ total: 0, pending: 0, recent: [] });
  expect(f.calls).toHaveLength(1);
});
