import { z } from "zod";
export const IDENTITY_BUCKET = "cnic-documents";
export const MAX_IDENTITY_BYTES = 10 * 1024 * 1024;
// Release gate: changing this requires approved SQL/storage authorization tests.
// Not an environment flag; neither a browser prop nor metadata can enable it.
export const IDENTITY_SUBMISSION_ENABLED = false;
export class IdentityError extends Error {
  constructor(public code: "AUTH" | "ROLE" | "FILE" | "STATUS" | "UNAVAILABLE" | "RETRY" | "GATED") {
    super({ AUTH: "Sign in again before continuing.", ROLE: "Only tenant and landlord accounts can submit identity documents.", FILE: "Choose exactly one valid JPG or PNG image, no larger than 10 MB.", STATUS: "A submission already exists or this account cannot submit again.", UNAVAILABLE: "Identity information is unavailable. Try again later.", RETRY: "Submission is not confirmed. Retry with the same file; do not upload a replacement.", GATED: "Secure submission is pending database and storage authorization validation. No document was uploaded." }[code]);
  }
}
export const profileIdentitySchema = z.object({ role: z.string(), verification_status: z.string().nullable() });
export function statusDescription(status: string | null) {
  switch (status) {
    case "verified": return "Your profile is marked verified. Human review evidence and document authenticity are not confirmed here; this is not official NADRA verification.";
    case "rejected": return "Your profile is marked rejected. Review evidence is not inspected here. Resubmission is unavailable pending a reviewed recovery process.";
    case "pending": return "Pending status alone does not confirm a submitted document. The administration queue distinguishes submitted and incomplete records.";
    default: return "No recognized review outcome is available. This does not imply approval.";
  }
}
export async function validateIdentityFiles(files: readonly File[]) {
  if (files.length !== 1) throw new IdentityError("FILE");
  const file = files[0];
  if (!["image/jpeg", "image/png"].includes(file.type) || file.size < 8 || file.size > MAX_IDENTITY_BYTES) throw new IdentityError("FILE");
  const bytes = new Uint8Array(await file.slice(0, 8).arrayBuffer());
  const png = [137, 80, 78, 71, 13, 10, 26, 10].every((v, i) => bytes[i] === v);
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if ((file.type === "image/png" && !png) || (file.type === "image/jpeg" && !jpeg)) throw new IdentityError("FILE");
  return file;
}
export const reservationSchema = z.object({ request_id: z.uuid(), object_name: z.string(), state: z.enum(["uploading", "pending"]) });
export const reviewInputSchema = z.object({ request_id: z.uuid(), expected_version: z.number().int().positive(), decision: z.enum(["verified", "rejected"]), reason: z.string().trim().max(1000), notes: z.string().trim().max(1000).default("") }).strict().superRefine((value, ctx) => {
  if (value.decision === "rejected" && value.reason.length < 10) ctx.addIssue({ code: "custom", message: "A rejection reason of at least 10 characters is required.", path: ["reason"] });
});
