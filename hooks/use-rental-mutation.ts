"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/lib/rentals/actions";
export function useRentalMutation() {
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [failed, setFailed] = useState(false);
  const router = useRouter();
  async function run(action: () => Promise<ActionResult>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setFeedback(""); setFailed(false);
    try {
      const result = await action(); setFeedback(result.message); setFailed(!result.ok);
      router.refresh();
      return result;
    } catch {
      setFeedback("Unable to confirm the operation. Refresh before retrying."); setFailed(true);
    } finally { lock.current = false; setBusy(false); }
  }
  return { run, busy, feedback, failed };
}
