"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function IdentityReviewForm({ profileId }: { profileId: string }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function review(decision: "verified" | "rejected") {
    if (busy || reason.trim().length < 10 || reason.trim().length > 1000) return;
    if (!window.confirm(`Confirm ${decision === "verified" ? "approval" : "rejection"} of this identity?`)) return;
    setBusy(true); setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please sign in again.");
      const { error: rpcError } = await supabase.rpc("makaanx_review_identity", {
        target_user: profileId, decision, review_reason: reason.trim(),
      });
      if (rpcError) throw rpcError;
      setReason("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review could not be saved.");
    } finally { setBusy(false); }
  }
  return <div className="mt-4 space-y-2">
    <label className="block text-sm font-medium" htmlFor={`review-${profileId}`}>
      Review justification (10–1000 characters)
    </label>
    <textarea id={`review-${profileId}`} className="w-full rounded border bg-background p-2"
      value={reason} onChange={e => setReason(e.target.value)} maxLength={1000}
      placeholder="Record what was checked and why this decision is justified." rows={3} />
    <div className="flex gap-2">
      <button type="button" disabled={busy || reason.trim().length < 10}
        className="rounded border px-4 py-2 disabled:opacity-50" onClick={() => review("verified")}>
        {busy ? "Saving..." : "Approve"}
      </button>
      <button type="button" disabled={busy || reason.trim().length < 10}
        className="rounded border px-4 py-2 disabled:opacity-50" onClick={() => review("rejected")}>
        Reject
      </button>
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}
