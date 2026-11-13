import type { SupabaseClient } from "@supabase/supabase-js";
import { applicationDecisionSchema, idSchema, propertyInputSchema } from "./schema";

export class RentalError extends Error {
  constructor(public code: string, message: string) { super(message); }
}
export type MutationOutcome = { id: string; changed: boolean; message: string };
function fail(code: string, message: string): never { throw new RentalError(code, message); }
export function checkDatabase(error: { code?: string } | null) {
  if (!error) return;
  if (error.code === "23505") fail("DUPLICATE", "This record already exists. Refresh to see its current state.");
  if (error.code === "42501") fail("ACCESS_DENIED", "Your database permissions do not allow this operation.");
  if (error.code === "23503") fail("RELATED_RECORDS", "This listing has related records and cannot be deleted.");
  fail("DATABASE_ERROR", "The operation could not be confirmed. Refresh before retrying.");
}
function validId(value: unknown) {
  const id = idSchema.safeParse(value);
  if (!id.success) fail("INVALID_ID", "Invalid record reference.");
  return id.data;
}
function affected(data: { id?: string } | null) {
  if (!data?.id) fail("NOT_CHANGED", "No record changed. It may be unavailable, already changed, or outside your permissions.");
  return data.id;
}
export async function requireActor(client: SupabaseClient, role: "landlord" | "tenant") {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) fail("AUTH_REQUIRED", "Sign in to continue.");
  const profile = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  checkDatabase(profile.error);
  if (profile.data?.role !== role) fail("ROLE_REQUIRED", `A ${role} account is required.`);
  return user;
}
export async function saveProperty(client: SupabaseClient, target: unknown, input: unknown): Promise<MutationOutcome> {
  const parsed = propertyInputSchema.safeParse(input);
  if (!parsed.success) fail("INVALID_INPUT", "Enter valid property details. Required fields and numeric limits must be satisfied.");
  const id = target === null ? null : validId(target);
  const user = await requireActor(client, "landlord");
  const result = id
    ? await client.from("properties").update(parsed.data).eq("id", id).eq("landlord_id", user.id).select("id").maybeSingle()
    : await client.from("properties").insert({ ...parsed.data, landlord_id: user.id, status: "vacant" }).select("id").maybeSingle();
  checkDatabase(result.error);
  return { id: affected(result.data), changed: true, message: id ? "Listing updated." : "Listing created." };
}
export async function deleteProperty(client: SupabaseClient, target: unknown): Promise<MutationOutcome> {
  const id = validId(target);
  const user = await requireActor(client, "landlord");
  const owned = await client.from("properties").select("id").eq("id", id).eq("landlord_id", user.id).maybeSingle();
  checkDatabase(owned.error); affected(owned.data);
  const applications = await client.from("applications").select("id", { count: "exact", head: true }).eq("property_id", id);
  checkDatabase(applications.error);
  if (applications.count === null) fail("COUNT_UNAVAILABLE", "Unable to confirm whether this listing has applications.");
  if (applications.count) fail("HAS_APPLICATIONS", "Listings with applications cannot be deleted. Keep the rental history and edit the listing instead.");
  const result = await client.from("properties").delete().eq("id", id).eq("landlord_id", user.id).select("id").maybeSingle();
  checkDatabase(result.error);
  return { id: affected(result.data), changed: true, message: "Listing deleted." };
}
export async function applyToProperty(client: SupabaseClient, target: unknown): Promise<MutationOutcome> {
  const id = validId(target);
  const user = await requireActor(client, "tenant");
  const property = await client.from("properties").select("id,status,landlord_id").eq("id", id).maybeSingle();
  checkDatabase(property.error);
  if (!property.data) fail("NOT_CHANGED", "Listing is unavailable or outside your permissions.");
  affected(property.data);
  if (property.data.status !== "vacant" || property.data.landlord_id === user.id) fail("NOT_AVAILABLE", "This listing is not available for applications.");
  const existing = await client.from("applications").select("id").eq("property_id", id).eq("tenant_id", user.id).maybeSingle();
  checkDatabase(existing.error);
  if (existing.data) fail("ALREADY_APPLIED", "You have already applied to this listing. Check My applications.");
  const result = await client.from("applications").insert({ property_id: id, tenant_id: user.id, status: "pending" }).select("id").maybeSingle();
  checkDatabase(result.error);
  return { id: affected(result.data), changed: true, message: "Application submitted." };
}
export async function decideApplication(client: SupabaseClient, target: unknown, decision: unknown): Promise<MutationOutcome> {
  const id = validId(target);
  const parsed = applicationDecisionSchema.safeParse(decision);
  if (!parsed.success) fail("INVALID_DECISION", "Choose approval or rejection.");
  const user = await requireActor(client, "landlord");
  const application = await client.from("applications").select("id,property_id,status").eq("id", id).maybeSingle();
  checkDatabase(application.error);
  if (!application.data) fail("NOT_CHANGED", "Application is unavailable.");
  affected(application.data);
  const property = await client.from("properties").select("id").eq("id", application.data.property_id).eq("landlord_id", user.id).maybeSingle();
  checkDatabase(property.error);
  if (!property.data) fail("NOT_CHANGED", "Listing is unavailable or outside your permissions.");
  affected(property.data);
  if (application.data.status !== "pending") fail("INVALID_TRANSITION", "Only pending applications can be decided.");
  // Compare-and-set prevents concurrent decisions from overwriting a settled state.
  const result = await client.from("applications").update({ status: parsed.data })
    .eq("id", id).eq("property_id", property.data.id).eq("status", "pending").select("id").maybeSingle();
  checkDatabase(result.error);
  return { id: affected(result.data), changed: true, message: `Application ${parsed.data}.` };
}
export async function setFavorite(client: SupabaseClient, target: unknown, desired: unknown): Promise<MutationOutcome> {
  const id = validId(target);
  if (typeof desired !== "boolean") fail("INVALID_INPUT", "Invalid saved-property request.");
  const user = await requireActor(client, "tenant");
  if (desired) {
    const property = await client.from("properties").select("id").eq("id", id).maybeSingle();
    checkDatabase(property.error);
    if (!property.data) fail("NOT_CHANGED", "Listing is unavailable or outside your permissions.");
    affected(property.data);
    const existing = await client.from("favorites").select("property_id").eq("user_id", user.id).eq("property_id", id).maybeSingle();
    checkDatabase(existing.error);
    if (existing.data) return { id, changed: false, message: "Listing is already saved." };
  }
  const result = desired
    ? await client.from("favorites").insert({ property_id: id, user_id: user.id }).select("property_id").maybeSingle()
    : await client.from("favorites").delete().eq("property_id", id).eq("user_id", user.id).select("property_id").maybeSingle();
  checkDatabase(result.error);
  if (!result.data?.property_id) fail("NOT_CHANGED", "Saved properties did not change. Refresh and try again.");
  return { id, changed: true, message: desired ? "Listing saved." : "Listing removed from saved properties." };
}
