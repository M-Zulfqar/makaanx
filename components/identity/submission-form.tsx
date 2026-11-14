"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
import { IDENTITY_SUBMISSION_ENABLED, IdentityError, statusDescription, validateIdentityFiles } from "@/lib/identity/contract";
import { readOwnIdentity, submitIdentity } from "@/lib/identity/submission";
export function IdentitySubmissionForm() {
  const [profile, setProfile] = useState<Awaited<ReturnType<typeof readOwnIdentity>> | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState("Loading your verification status...");
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  const selection = useRef(0);
  useEffect(() => {
    let active = true;
    (async () => readOwnIdentity(createClient()))().then(own => {
      if (active) { setProfile(own); setMessage(statusDescription(own.verification_status)); }
    }).catch(error => { if (active) setMessage(error instanceof IdentityError ? error.message : "Identity information is unavailable."); });
    return () => { active = false; };
  }, []);
  async function choose(files: FileList | null) {
    const current = ++selection.current;
    setFile(null);
    try { const valid = await validateIdentityFiles(Array.from(files ?? [])); if (current === selection.current) { setFile(valid); setMessage("Image selected locally. Nothing has been uploaded."); } }
    catch (error) { if (current === selection.current) setMessage(error instanceof IdentityError ? error.message : "Unable to read this image."); }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!file || inFlight.current || !IDENTITY_SUBMISSION_ENABLED) return;
    inFlight.current = true; setBusy(true);
    try {
      await submitIdentity(createClient(), [file], phase => setMessage({ validating: "Validating image...", reserving: "Reserving private upload...", uploading: "Uploading image...", confirming: "Confirming submission...", submitted: "Document submitted for human review. No authenticity result is implied." }[phase]));
      setFile(null); setProfile(null);
    } catch (error) { setMessage(error instanceof IdentityError ? error.message : "Submission could not be confirmed."); }
    finally { inFlight.current = false; setBusy(false); }
  }
  const eligible = profile && [null, "pending", "unverified"].includes(profile.verification_status);
  return <main className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-6"><div className="w-full max-w-lg space-y-5 rounded-xl border bg-card p-5 sm:p-8">
    <h1 className="text-2xl font-bold">Identity verification</h1>
    <p className="text-sm text-muted-foreground">Human document review only. MakaanX has no official NADRA or automatic AI identity verification integration.</p>
    <p role="status" aria-live="polite" className="text-sm">{message}</p>
    {!IDENTITY_SUBMISSION_ENABLED && <p className="rounded-lg border p-4 text-sm">Secure submission is pending database and storage authorization validation. No document can be uploaded from this build. Existing review status remains visible.</p>}
    {eligible && <form onSubmit={submit} className="space-y-4"><label className="block text-sm font-medium">One CNIC image (JPG or PNG, max 10 MB)<input className="mt-2 block w-full max-w-full text-sm" type="file" accept="image/jpeg,image/png" disabled={busy} onChange={e => void choose(e.target.files)}/></label>
      <p className="text-xs text-muted-foreground">File selection and validation happen locally. Do not select another person’s document. Rejected or approved submissions cannot be replaced here.</p>
      <button disabled={!IDENTITY_SUBMISSION_ENABLED || !file || busy} className="rounded bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50">{busy ? "Submitting..." : "Submit for human review"}</button></form>}
    <Link href="/auth/login" className="block text-sm underline">Return to login</Link>
  </div></main>;
}
