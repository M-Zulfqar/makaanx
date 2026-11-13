import { beforeEach, expect, test, vi } from "vitest";
const mocks = vi.hoisted(() => ({ createClient: vi.fn(), save: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.createClient }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
vi.mock("@/lib/rentals/service", async original => ({ ...await original<typeof import("../lib/rentals/service")>(), saveProperty: mocks.save }));
import { savePropertyAction } from "../lib/rentals/actions";
import { RentalError } from "../lib/rentals/service";
import { propertyId } from "./helpers/rental-client";
beforeEach(() => { vi.clearAllMocks(); mocks.createClient.mockResolvedValue({}); });
test("confirmed writes invalidate all related views and detail routes", async () => {
  mocks.save.mockResolvedValue({ id: propertyId, changed: true, message: "Listing updated." });
  expect(await savePropertyAction(propertyId, {})).toMatchObject({ ok: true });
  for (const path of ["/", "/properties", "/marketplace", "/dashboard/favorites", "/dashboard/applications", "/landlord/properties"]) expect(mocks.revalidate).toHaveBeenCalledWith(path);
  expect(mocks.revalidate).toHaveBeenCalledWith("/properties/[id]", "page");
});
test("denied writes retain controlled failure without claiming success or invalidating", async () => {
  mocks.save.mockRejectedValue(new RentalError("NOT_CHANGED", "No record changed."));
  expect(await savePropertyAction(propertyId, {})).toEqual({ ok: false, code: "NOT_CHANGED", message: "No record changed." });
  expect(mocks.revalidate).not.toHaveBeenCalled();
});
test("unexpected exceptions never reveal private SDK messages", async () => {
  mocks.save.mockRejectedValue(new Error("PRIVATE_SECRET"));
  const result = await savePropertyAction(propertyId, {});
  expect(result.ok).toBe(false); expect(JSON.stringify(result)).not.toContain("PRIVATE_SECRET");
});
