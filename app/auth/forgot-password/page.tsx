"use client";
import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/browser";
export default function ForgotPassword() {
 const [email,setEmail]=useState(""); const [message,setMessage]=useState(""); const [busy,setBusy]=useState(false);
 async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);try {const supabase=createClient(); await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${window.location.origin}/auth/callback?next=reset-password`});setMessage("If an account exists for this email, a reset link has been sent.");} catch {setMessage("Unable to request reset. Try again later.");}finally{setBusy(false)}}
 return <main className="min-h-screen flex items-center justify-center p-6"><form onSubmit={submit} className="w-full max-w-md space-y-4"><h1 className="text-2xl font-bold">Reset password</h1><label className="block">Email<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded border p-3"/></label><button disabled={busy} className="rounded bg-primary px-5 py-3 text-primary-foreground">Send reset link</button><p role="status">{message}</p><Link href="/auth/login" className="underline">Back to login</Link></form></main>;
}
