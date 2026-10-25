"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
export function CreatePropertyForm() {
  const router = useRouter();
  const [busy,setBusy] = useState(false);
  const [message,setMessage] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (busy) return;
    const form = new FormData(e.currentTarget);
    const title = String(form.get("title") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const city = String(form.get("city") ?? "").trim();
    const rent = Number(form.get("rent"));
    if (!title || !address || !city || !Number.isFinite(rent) || rent <= 0) {
      setMessage("Enter valid property details."); return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Sign in first.");
      const { data: profile } = await supabase.from("profiles").select("role").eq("id",user.id).single();
      if (profile?.role !== "landlord") throw new Error("Only landlords can list properties.");
      const { error } = await supabase.from("properties").insert({
        title, address, city, rent, landlord_id: user.id,
      });
      if (error) throw error;
      setMessage("Property created.");
      (e.target as HTMLFormElement).reset();
      router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Failed to save property."); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="rounded-xl border p-5 space-y-3">
    <h2 className="text-xl font-semibold">Add a rental listing</h2>
    <label className="block">Title<input name="title" required maxLength={150} className="block w-full rounded border p-2"/></label>
    <label className="block">Street address<input name="address" required className="block w-full rounded border p-2"/></label>
    <label className="block">City<input name="city" required className="block w-full rounded border p-2"/></label>
    <label className="block">Monthly rent (PKR)<input name="rent" type="number" min="1" step="1" required className="block w-full rounded border p-2"/></label>
    <button disabled={busy} className="rounded bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50">
      {busy ? "Saving..." : "Create listing"}</button>
    <p role="status">{message}</p>
  </form>;
}
