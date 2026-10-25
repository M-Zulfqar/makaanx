"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
type Props = { propertyId?: string; applicationId?: string; applicationStatus?: string };
export function LandlordPropertyActions({propertyId,applicationId,applicationStatus}:Props) {
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function run(action:"delete"|"approved"|"rejected") {
    if (busy) return;
    if (action==="delete" && !window.confirm("Delete this property and related applications?")) return;
    setBusy(true);
    try {
      const supabase=createClient();
      const { data:{user},error:authError }=await supabase.auth.getUser();
      if (authError || !user) throw new Error("Sign in first.");
      if (action==="delete" && propertyId) {
        const {error}=await supabase.from("properties").delete().eq("id",propertyId).eq("landlord_id",user.id);
        if(error) throw error;
      } else if (applicationId && action!=="delete") {
        const {error}=await supabase.from("applications").update({status:action}).eq("id",applicationId);
        if(error) throw error;
      } else throw new Error("Invalid operation.");
      setMessage("Saved.");
      router.refresh();
    } catch(error) { setMessage(error instanceof Error?error.message:"Operation failed."); }
    finally {setBusy(false);}
  }
  return <div className="flex flex-wrap gap-2 items-center">
    {propertyId && <button type="button" disabled={busy} onClick={()=>run("delete")}
      className="rounded border px-3 py-2">Delete listing</button>}
    {applicationId && applicationStatus==="pending" && <>
      <button type="button" disabled={busy} onClick={()=>run("approved")}
        className="rounded border px-3 py-2">Approve</button>
      <button type="button" disabled={busy} onClick={()=>run("rejected")}
        className="rounded border px-3 py-2">Reject</button>
    </>}
    <span role="status" className="text-sm">{message}</span>
  </div>;
}
