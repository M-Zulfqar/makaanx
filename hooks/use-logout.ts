"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/browser";
import { signOutAndRedirect } from "@/lib/auth/sign-out";

export function useLogout() {
  const inFlight = useRef(false);
  const [loggingOut, setLoggingOut] = useState(false);
  async function logout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setLoggingOut(true);
    try {
      await signOutAndRedirect(createClient(), () => window.location.replace("/auth/login"));
    } catch {
      toast.error("Unable to log out. Please try again.");
    } finally {
      inFlight.current = false;
      setLoggingOut(false);
    }
  }
  return { logout, loggingOut };
}
