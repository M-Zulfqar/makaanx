"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { applyAction } from "@/lib/rentals/actions";
import { useRentalMutation } from "@/hooks/use-rental-mutation";
export function ApplyButton({ propertyId, applied = false }: { propertyId: string; applied?: boolean }) {
  const { run, busy, feedback, failed } = useRentalMutation();
  return <div className="space-y-2">
    <Button disabled={busy || applied} onClick={() => run(() => applyAction(propertyId))}>
      {busy ? "Submitting…" : applied ? "Application already submitted" : "Apply for this property"}
    </Button>
    <Link className="ml-3 text-sm underline" href="/dashboard/applications">My applications</Link>
    {feedback && <p role={failed ? "alert" : "status"} className="text-sm">{feedback}</p>}
  </div>;
}
