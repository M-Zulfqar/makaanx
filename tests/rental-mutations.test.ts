import { describe, expect, test } from "vitest";
import { applyToProperty, decideApplication, deleteProperty, saveProperty, setFavorite } from "../lib/rentals/service";
import { applicationId, hasOperation, landlordId, propertyId, rentalClient, roleReply, tenantId } from "./helpers/rental-client";
const input = { title: "New rental", address: "Street 12", city: "Lahore", type: "Apartment", rent: 50000, bedrooms: 2, bathrooms: 1, area: 900 };
const property = { id: propertyId, landlord_id: landlordId, status: "vacant" };

describe("listing writes", () => {
  test("rejects ownership/role injection before touching the database", async () => {
    const f = rentalClient([]);
    await expect(saveProperty(f.client, null, { ...input, landlord_id: tenantId })).rejects.toMatchObject({ code: "INVALID_INPUT" });
    expect(f.calls).toHaveLength(0);
  });
  test("does not trust user metadata for landlord authorization", async () => {
    const f = rentalClient([roleReply("tenant")]);
    await expect(saveProperty(f.client, null, input)).rejects.toMatchObject({ code: "ROLE_REQUIRED" });
    expect(f.calls.map(c => c.table)).toEqual(["profiles"]);
  });
  test("requires a real authenticated session", async () => {
    const f = rentalClient([], "landlord", false);
    await expect(saveProperty(f.client, null, input)).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
    expect(f.calls).toHaveLength(0);
  });
  test("creation supplies only the authenticated landlord and vacant status", async () => {
    const f = rentalClient([roleReply("landlord"), { data: { id: propertyId } }], "landlord");
    expect(await saveProperty(f.client, null, input)).toMatchObject({ changed: true, id: propertyId });
    expect(hasOperation(f.calls[1], "insert", { ...input, landlord_id: landlordId, status: "vacant" })).toBe(true);
    expect(hasOperation(f.calls[1], "select", "id")).toBe(true);
  });
  test("editing scopes the update to the authenticated owner", async () => {
    const f = rentalClient([roleReply("landlord"), { data: { id: propertyId } }], "landlord");
    await saveProperty(f.client, propertyId, input);
    expect(hasOperation(f.calls[1], "eq", "landlord_id", landlordId)).toBe(true);
    expect(hasOperation(f.calls[1], "eq", "id", propertyId)).toBe(true);
    expect(hasOperation(f.calls[1], "update", input)).toBe(true);
  });
  test("a zero-row edit is not success", async () => {
    const f = rentalClient([roleReply("landlord"), { data: null }], "landlord");
    await expect(saveProperty(f.client, propertyId, input)).rejects.toMatchObject({ code: "NOT_CHANGED" });
  });
  test("denied privileges are reported without raw SQL/error details", async () => {
    const f = rentalClient([roleReply("landlord"), { data: null, error: { code: "42501", message: "PRIVATE_DATABASE_DETAIL" } }], "landlord");
    await expect(saveProperty(f.client, propertyId, input)).rejects.toMatchObject({ code: "ACCESS_DENIED" });
    await expect(saveProperty(rentalClient([roleReply("landlord"), { data: null, error: { code: "OTHER", message: "PRIVATE_DATABASE_DETAIL" } }], "landlord").client, propertyId, input)).rejects.not.toThrow("PRIVATE_DATABASE_DETAIL");
  });
  test("does not delete a non-owned listing", async () => {
    const f = rentalClient([roleReply("landlord"), { data: null }], "landlord");
    await expect(deleteProperty(f.client, propertyId)).rejects.toMatchObject({ code: "NOT_CHANGED" });
    expect(f.calls.some(c => hasOperation(c, "delete"))).toBe(false);
  });
  test("does not delete a listing with existing applications", async () => {
    const f = rentalClient([roleReply("landlord"), { data: property }, { data: null, count: 1 }], "landlord");
    await expect(deleteProperty(f.client, propertyId)).rejects.toMatchObject({ code: "HAS_APPLICATIONS" });
    expect(f.calls.some(c => hasOperation(c, "delete"))).toBe(false);
  });
  test("deletion checks owner and returned row", async () => {
    const f = rentalClient([roleReply("landlord"), { data: property }, { data: null, count: 0 }, { data: { id: propertyId } }], "landlord");
    expect(await deleteProperty(f.client, propertyId)).toMatchObject({ changed: true });
    expect(hasOperation(f.calls[3], "eq", "landlord_id", landlordId)).toBe(true);
  });
  test("lost delete race does not report success", async () => {
    const f = rentalClient([roleReply("landlord"), { data: property }, { data: null, count: 0 }, { data: null }], "landlord");
    await expect(deleteProperty(f.client, propertyId)).rejects.toMatchObject({ code: "NOT_CHANGED" });
  });
});

describe("rental applications", () => {
  test("validates IDs before issuing any queries", async () => {
    const f = rentalClient([]);
    await expect(applyToProperty(f.client, "not-a-uuid")).rejects.toMatchObject({ code: "INVALID_ID" }); expect(f.calls).toHaveLength(0);
  });
  test("only tenants can apply", async () => {
    const f = rentalClient([roleReply("landlord")], "landlord");
    await expect(applyToProperty(f.client, propertyId)).rejects.toMatchObject({ code: "ROLE_REQUIRED" });
  });
  test("rejects unavailable properties", async () => {
    const f = rentalClient([roleReply("tenant"), { data: { ...property, status: "occupied" } }]);
    await expect(applyToProperty(f.client, propertyId)).rejects.toMatchObject({ code: "NOT_AVAILABLE" });
  });
  test("existing applications are recognized instead of inserted again", async () => {
    const f = rentalClient([roleReply("tenant"), { data: property }, { data: { id: applicationId } }]);
    await expect(applyToProperty(f.client, propertyId)).rejects.toMatchObject({ code: "ALREADY_APPLIED" });
    expect(hasOperation(f.calls[2], "eq", "tenant_id", tenantId)).toBe(true);
    expect(f.calls.some(c => c.operations.some(op => op.name === "insert"))).toBe(false);
  });
  test("new applications bind tenant and status on the server", async () => {
    const f = rentalClient([roleReply("tenant"), { data: property }, { data: null }, { data: { id: applicationId } }]);
    expect(await applyToProperty(f.client, propertyId)).toMatchObject({ id: applicationId });
    expect(hasOperation(f.calls[3], "insert", { tenant_id: tenantId, property_id: propertyId, status: "pending" })).toBe(true);
  });
  test("handles a uniqueness race when the database constraint exists", async () => {
    const f = rentalClient([roleReply("tenant"), { data: property }, { data: null }, { data: null, error: { code: "23505" } }]);
    await expect(applyToProperty(f.client, propertyId)).rejects.toMatchObject({ code: "DUPLICATE" });
  });
  test("rejects unrecognized status decisions", async () => {
    const f = rentalClient([]);
    await expect(decideApplication(f.client, applicationId, "pending")).rejects.toMatchObject({ code: "INVALID_DECISION" });
    expect(f.calls).toHaveLength(0);
  });
  test("unrelated landlord cannot decide another property's application", async () => {
    const f = rentalClient([roleReply("landlord"), { data: { id: applicationId, property_id: propertyId, status: "pending" } }, { data: null }], "landlord");
    await expect(decideApplication(f.client, applicationId, "approved")).rejects.toMatchObject({ code: "NOT_CHANGED" });
    expect(f.calls.some(c => c.operations.some(op => op.name === "update"))).toBe(false);
  });
  test("settled statuses cannot transition again", async () => {
    const f = rentalClient([roleReply("landlord"), { data: { id: applicationId, property_id: propertyId, status: "approved" } }, { data: property }], "landlord");
    await expect(decideApplication(f.client, applicationId, "rejected")).rejects.toMatchObject({ code: "INVALID_TRANSITION" });
  });
  test("decisions compare-and-set pending status and validate affected rows", async () => {
    const replies = [roleReply("landlord"), { data: { id: applicationId, property_id: propertyId, status: "pending" } }, { data: property }];
    const f = rentalClient([...replies, { data: { id: applicationId } }], "landlord");
    await decideApplication(f.client, applicationId, "approved");
    expect(hasOperation(f.calls[3], "eq", "status", "pending")).toBe(true);
    expect(hasOperation(f.calls[3], "eq", "property_id", propertyId)).toBe(true);
    await expect(decideApplication(rentalClient([...replies, { data: null }], "landlord").client, applicationId, "approved")).rejects.toMatchObject({ code: "NOT_CHANGED" });
  });
});

describe("favorites", () => {
  test("adds only for the authenticated tenant", async () => {
    const f = rentalClient([roleReply("tenant"), { data: property }, { data: null }, { data: { property_id: propertyId } }]);
    expect(await setFavorite(f.client, propertyId, true)).toMatchObject({ changed: true });
    expect(hasOperation(f.calls[3], "insert", { property_id: propertyId, user_id: tenantId })).toBe(true);
  });
  test("recognizes already-saved records without fabricating a write", async () => {
    const f = rentalClient([roleReply("tenant"), { data: property }, { data: { property_id: propertyId } }]);
    expect(await setFavorite(f.client, propertyId, true)).toMatchObject({ changed: false, message: "Listing is already saved." });
    expect(f.calls.some(c => c.operations.some(op => op.name === "insert"))).toBe(false);
  });
  test("removes own records even if the linked property is unavailable", async () => {
    const f = rentalClient([roleReply("tenant"), { data: { property_id: propertyId } }]);
    await setFavorite(f.client, propertyId, false);
    expect(f.calls.map(c => c.table)).toEqual(["profiles", "favorites"]);
    expect(hasOperation(f.calls[1], "eq", "user_id", tenantId)).toBe(true);
  });
  test("zero-row removal is not success", async () => {
    const f = rentalClient([roleReply("tenant"), { data: null }]);
    await expect(setFavorite(f.client, propertyId, false)).rejects.toMatchObject({ code: "NOT_CHANGED" });
  });
  test("rejects non-boolean intents", async () => {
    await expect(setFavorite(rentalClient([]).client, propertyId, "true")).rejects.toMatchObject({ code: "INVALID_INPUT" });
  });
});
