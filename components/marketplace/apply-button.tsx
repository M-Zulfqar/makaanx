"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
export function ApplyButton({ propertyId }: { propertyId: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function apply() {
    if (busy) return;
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Sign in first.");
      const { error } = await supabase.from("applications").insert({
        property_id: propertyId, tenant_id: user.id, status: "pending",
      });
      if (error) throw error;
      setMessage("Application submitted. You can check your application status later.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit application.");
    } finally { setBusy(false); }
  }
  return <div className="space-y-3">
    <button type="button" onClick={apply} disabled={busy}
      className="rounded bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50">
      {busy ? "Submitting..." : "Apply for this property"}
    </button>
    <p role="status">{message}</p>
  </div>;
}
