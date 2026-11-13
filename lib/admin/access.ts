import type { SupabaseClient } from "@supabase/supabase-js";
export class AdminAccessError extends Error {
  constructor(public code: "AUTH_REQUIRED" | "FORBIDDEN" | "UNAVAILABLE", message: string) { super(message); }
}
export async function requireAdministrator(client: SupabaseClient) {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) throw new AdminAccessError("AUTH_REQUIRED", "Sign in to continue.");
  // Application role comes from the protected own profile, never user metadata.
  const profile = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (profile.error) throw new AdminAccessError("UNAVAILABLE", "Unable to verify administrator permissions.");
  if (profile.data?.role !== "admin") throw new AdminAccessError("FORBIDDEN", "Administrator access required.");
  return user;
}
