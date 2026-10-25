"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export function SendMessage({conversationId}:{conversationId:string}) {
  const [body,setBody]=useState("");
  const [busy,setBusy]=useState(false);
  const [feedback,setFeedback]=useState("");
  const router=useRouter();
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if(busy||!body.trim())return;
    setBusy(true);setFeedback("");
    try {
      const supabase=createClient();
      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError||!user)throw new Error("Sign in to send messages.");
      const {data:conversation,error:conversationError}=await supabase.from("conversations")
        .select("id").eq("id",conversationId).eq("user_id",user.id).maybeSingle();
      if(conversationError)throw conversationError;
      if(!conversation)throw new Error("Conversation not available to this account.");
      const {error}=await supabase.from("messages").insert({
        conversation_id:conversationId,sender_id:user.id,content:body.trim(),
      });
      if(error)throw error;
      setBody("");
      router.refresh();
    }catch(error){setFeedback(error instanceof Error?error.message:"Unable to send message.");}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit} className="space-y-3">
    <label className="block font-medium" htmlFor="message-body">New message</label>
    <textarea id="message-body" className="w-full rounded border p-3" value={body}
      onChange={e=>setBody(e.target.value)} maxLength={3000} rows={3} required/>
    <button disabled={busy||!body.trim()} type="submit" className="rounded bg-primary px-5 py-2 text-primary-foreground disabled:opacity-50">
      {busy?"Sending...":"Send message"}
    </button>
    <p role="status">{feedback}</p>
  </form>;
}
