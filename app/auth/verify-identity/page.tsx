"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export default function VerifyIdentityPage() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Loading your verification status...");
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      if (!user) { setMessage("Please sign in before submitting your CNIC."); return; }
      const { data: profile, error } = await supabase.from("profiles")
        .select("cnic_path,verification_status").eq("id", user.id).single();
      if (!active) return;
      if (error) { setMessage("Unable to load your profile. Please contact support."); return; }
      if (profile?.cnic_path) {
        setComplete(true);
        setMessage(profile.verification_status === "verified"
          ? "Your identity has been verified."
          : "Your CNIC has been submitted and is awaiting admin review.");
      } else setMessage("Upload a clear CNIC image for manual admin review. No automatic verification score is assigned.");
    })();
    return () => { active = false; };
  }, []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || busy) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setMessage("Choose a JPG or PNG image under 10 MB.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("Please sign in again.");
      const extension = file.type === "image/png" ? "png" : "jpg";
      const path = `${user.id}/cnic-${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from("cnic-documents")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;
      const { error: submitError } = await supabase.rpc("makaanx_submit_cnic", { document_path: path });
      if (submitError) throw submitError;
      setComplete(true);
      setMessage("CNIC submitted. An administrator must review it before verification is approved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed. Please retry.");
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen flex items-center justify-center bg-background p-6">
    <div className="w-full max-w-lg rounded-xl border bg-card p-8 space-y-5">
      <h1 className="text-2xl font-bold">Identity verification</h1>
      <p className="text-sm text-muted-foreground">Your CNIC is sensitive personal information. Only upload your own document. It will be stored in a private bucket for authorized review.</p>
      <p role="status" className="text-sm">{message}</p>
      {!complete && <form onSubmit={submit} className="space-y-4">
        <label className="block text-sm font-medium">CNIC image (JPG or PNG, max 10 MB)
          <input className="mt-2 block w-full" type="file" accept="image/jpeg,image/png"
            onChange={e => setFile(e.target.files?.[0] ?? null)} required />
        </label>
        <button disabled={!file || busy} className="rounded bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50">
          {busy ? "Submitting..." : "Submit for review"}
        </button>
      </form>}
      <Link href="/auth/login" className="block text-sm underline">Return to login</Link>
    </div>
  </main>;
}
