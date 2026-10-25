"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";

export function FavoriteButton({ propertyId }: { propertyId: string }) {
  const [favorite,setFavorite] = useState(false);
  const [signedIn,setSignedIn] = useState<boolean|null>(null);
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  useEffect(() => {
    let active=true;
    async function load() {
      try {
        const supabase=createClient();
        const {data:{user}}=await supabase.auth.getUser();
        if(!active)return;
        setSignedIn(Boolean(user));
        if(!user)return;
        const {data,error}=await supabase.from("favorites")
          .select("property_id").eq("user_id",user.id).eq("property_id",propertyId).maybeSingle();
        if(error)throw error;
        if(active)setFavorite(Boolean(data));
      } catch(e) {if(active)setError(e instanceof Error?e.message:"Unable to load favorites.");}
    }
    void load();
    return ()=>{active=false;};
  },[propertyId]);
  async function toggle() {
    if(busy)return;
    setBusy(true);setError("");
    try {
      const supabase=createClient();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user)throw new Error("Sign in first.");
      const {error}=favorite
        ? await supabase.from("favorites").delete().eq("user_id",user.id).eq("property_id",propertyId)
        : await supabase.from("favorites").insert({user_id:user.id,property_id:propertyId});
      if(error)throw error;
      setFavorite(!favorite);
    } catch(e){setError(e instanceof Error?e.message:"Unable to save favorite.");}
    finally{setBusy(false);}
  }
  return <div className="space-y-2">
    {signedIn===false ? <Link href="/auth/login" className="underline">Sign in to save</Link>
      : <button type="button" disabled={busy||signedIn===null} onClick={toggle}
        aria-pressed={favorite} className="rounded border px-4 py-2">
        {favorite?"♥ Saved":"♡ Save property"}</button>}
    {error&&<p role="alert" className="text-sm">{error}</p>}
  </div>;
}
