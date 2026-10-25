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
    const type = String(form.get("type") ?? "Apartment");
    const bedrooms = Number(form.get("bedrooms") ?? 0);
    const bathrooms = Number(form.get("bathrooms") ?? 0);
    const area = Number(form.get("area") ?? 0);
    if (!title || !address || !city || !["Apartment","House","Room","Commercial"].includes(type) ||
      !Number.isFinite(rent) || rent <= 0 ||
      ![bedrooms,bathrooms,area].every(n => Number.isFinite(n) && n >= 0) ||
      !Number.isInteger(bedrooms) || !Number.isInteger(bathrooms)) {
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
        title, address, city, rent, type, bedrooms, bathrooms, area,
        status: "vacant", landlord_id: user.id,
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
    <label className="block">Property type<select name="type" className="block w-full rounded border p-2">
      <option>Apartment</option><option>House</option><option>Room</option><option>Commercial</option>
    </select></label>
    <div className="grid grid-cols-3 gap-3">
      <label>Bedrooms<input name="bedrooms" type="number" min="0" step="1" defaultValue="1" className="block w-full rounded border p-2"/></label>
      <label>Bathrooms<input name="bathrooms" type="number" min="0" step="1" defaultValue="1" className="block w-full rounded border p-2"/></label>
      <label>Area (sq ft)<input name="area" type="number" min="0" step="1" defaultValue="500" className="block w-full rounded border p-2"/></label>
    </div>
    <label className="block">Monthly rent (PKR)<input name="rent" type="number" min="1" step="1" required className="block w-full rounded border p-2"/></label>
    <button disabled={busy} className="rounded bg-primary px-5 py-3 text-primary-foreground disabled:opacity-50">
      {busy ? "Saving..." : "Create listing"}</button>
    <p role="status">{message}</p>
  </form>;
}
