import type { SupabaseClient } from "@supabase/supabase-js";
import { IDENTITY_BUCKET, IDENTITY_SUBMISSION_ENABLED, IdentityError, profileIdentitySchema, reservationSchema, validateIdentityFiles } from "./contract";
export async function readOwnIdentity(client: SupabaseClient) {
  try {
    const { data: { user }, error } = await client.auth.getUser();
    if (error || !user) throw new IdentityError("AUTH");
    const profile = await client.from("profiles").select("role,verification_status").eq("id", user.id).maybeSingle();
    const parsed = profileIdentitySchema.safeParse(profile.data);
    if (profile.error || !parsed.success) throw new IdentityError("UNAVAILABLE");
    if (!["tenant", "landlord"].includes(parsed.data.role)) throw new IdentityError("ROLE");
    return { userId: user.id, ...parsed.data };
  } catch (error) { throw error instanceof IdentityError ? error : new IdentityError("UNAVAILABLE"); }
}
export type SubmissionPhase = "validating" | "reserving" | "uploading" | "confirming" | "submitted";
// This coordinator uses the PROPOSED v1 API only. Public entry stays gated below.
// Exported separately for isolated contract tests; no UI can pass an enable flag.
export async function submitReservedIdentity(client: SupabaseClient, files: readonly File[], onPhase: (phase: SubmissionPhase) => void = () => {}) {
  try {
    onPhase("validating");
    const own = await readOwnIdentity(client);
    if (![null, "pending", "unverified"].includes(own.verification_status)) throw new IdentityError("STATUS");
    const file = await validateIdentityFiles(files);
    const digest = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
    const fileHash = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, "0")).join("");
    onPhase("reserving");
    const begin = await client.rpc("makaanx_begin_identity_v1", { file_mime: file.type, file_bytes: file.size, file_sha256: fileHash });
    const parsed = reservationSchema.safeParse(begin.data);
    if (begin.error || !parsed.success) throw new IdentityError("RETRY");
    const reservation = parsed.data;
    const extension = file.type === "image/png" ? "png" : "jpg";
    if (reservation.object_name !== `${own.userId}/cnic-${reservation.request_id}.${extension}`) throw new IdentityError("UNAVAILABLE");
    if (reservation.state === "uploading") {
      onPhase("uploading");
      // Never overwrite/remove or create a second path after an uncertain response.
      // A retry can encounter 409 from a previous successful upload; finalize checks
      // the reserved object independently, without trusting the upload response.
      try { await client.storage.from(IDENTITY_BUCKET).upload(reservation.object_name, file, { contentType: file.type, upsert: false }); } catch { /* Reconcile through finalize below. */ }
    }
    onPhase("confirming");
    const result = await client.rpc("makaanx_finalize_identity_v1", { request_id: reservation.request_id });
    if (result.error || result.data !== "pending") throw new IdentityError("RETRY");
    onPhase("submitted");
    return { status: "pending" as const }; // No private object path leaves coordinator.
  } catch (error) { throw error instanceof IdentityError ? error : new IdentityError("RETRY"); }
}
export async function submitIdentity(client: SupabaseClient, files: readonly File[], onPhase?: (phase: SubmissionPhase) => void) {
  if (!IDENTITY_SUBMISSION_ENABLED) throw new IdentityError("GATED");
  return submitReservedIdentity(client, files, onPhase);
}
