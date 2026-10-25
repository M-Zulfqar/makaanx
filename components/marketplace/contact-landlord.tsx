"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function ContactLandlord({propertyId}:{propertyId:string}) {
  const router=useRouter();
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  async function start() {
    if(busy)return;
    setBusy(true);setError("");
    try {
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){router.push("/auth/login");return;}
      const {data:chatId,error:rpcError}=await supabase.rpc("makaanx_start_conversation",{
        target_property:propertyId,
      });
      if(rpcError)throw rpcError;
      if(typeof chatId!=="string")throw new Error("Unable to open conversation.");
      router.push(`/dashboard/inbox/${chatId}`);
    }catch(e){setError(e instanceof Error?e.message:"Unable to contact landlord.");}
    finally{setBusy(false);}
  }
  return <div className="space-y-2">
    <button type="button" disabled={busy} onClick={start}
      className="rounded border px-5 py-3 disabled:opacity-50">
      {busy?"Opening chat...":"Message landlord"}
    </button>
    {error&&<p role="alert" className="text-sm">{error}</p>}
  </div>;
}
