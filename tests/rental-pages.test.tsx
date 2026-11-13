import React from "react";
import { expect, test, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { rentalClient, landlordId, propertyId } from "./helpers/rental-client";
const state = vi.hoisted(() => ({ client: undefined as unknown, notFound: vi.fn(() => { throw new Error("NOT_FOUND"); }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => state.client }));
vi.mock("next/navigation", () => ({ notFound: state.notFound, useRouter: () => ({ refresh: vi.fn() }) }));
import { RentalCatalog } from "../components/rentals/catalog";
import { RentalDetail } from "../components/rentals/detail";
const row = { id: propertyId, landlord_id: landlordId, title: "Actual rental", address: "Street 1", city: "Lahore", type: "House", status: "vacant", rent: 45000, bedrooms: 2, bathrooms: 1, area: 900, created_at: "2026-11-14T00:00:00Z" };
test("catalog renders actual returned data, not demo prices or scores", async () => {
  state.client = rentalClient([{ data: [row], count: 1 }], "tenant", false).client;
  const html = renderToStaticMarkup(await RentalCatalog({ params: {} }));
  expect(html).toContain("Actual rental"); expect(html).toContain("45,000");
  expect(html).not.toContain("Trust Score"); expect(html).not.toContain("No matching listings");
});
test("catalog differentiates query failure from a genuine empty result", async () => {
  state.client = rentalClient([{ data: null, error: { code: "42501", message: "PRIVATE_ERROR" } }], "tenant", false).client;
  const failed = renderToStaticMarkup(await RentalCatalog({ params: {} }));
  expect(failed).toContain('role="alert"'); expect(failed).not.toContain("PRIVATE_ERROR"); expect(failed).not.toContain("No matching listings");
  state.client = rentalClient([{ data: [], count: 0 }], "tenant", false).client;
  const empty = renderToStaticMarkup(await RentalCatalog({ params: {} }));
  expect(empty).toContain("No matching listings"); expect(empty).not.toContain('role="alert"');
});
test("invalid listing identifiers produce not-found before a database query", async () => {
  const f = rentalClient([]); state.client = f.client;
  await expect(RentalDetail({ id: "1" })).rejects.toThrow("NOT_FOUND"); expect(f.calls).toHaveLength(0);
});
test("a valid missing listing produces not-found, but database denial does not", async () => {
  state.client = rentalClient([{ data: null }], "tenant", false).client;
  await expect(RentalDetail({ id: propertyId })).rejects.toThrow("NOT_FOUND");
  state.client = rentalClient([{ data: null, error: { code: "42501" } }], "tenant", false).client;
  await expect(RentalDetail({ id: propertyId })).rejects.toMatchObject({ code: "ACCESS_DENIED" });
});
