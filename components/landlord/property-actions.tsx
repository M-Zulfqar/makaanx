"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deletePropertyAction, decideAction } from "@/lib/rentals/actions";
import { useRentalMutation } from "@/hooks/use-rental-mutation";
type Props = { propertyId?: string; applicationId?: string; applicationStatus?: string };
export function LandlordPropertyActions({ propertyId, applicationId, applicationStatus }: Props) {
  const { run, busy, feedback, failed } = useRentalMutation();
  return <div className="flex flex-wrap items-center gap-2">
    {propertyId && <><Button variant="outline" asChild><Link href={`/landlord/properties/${propertyId}/edit`}>Edit listing</Link></Button>
      <Button variant="destructive" disabled={busy} onClick={() => {
        if (window.confirm("Delete this listing? Listings with applications must be kept for rental history.")) void run(() => deletePropertyAction(propertyId));
      }}>{busy ? "Saving…" : "Delete listing"}</Button></>}
    {applicationId && applicationStatus === "pending" && <>
      <Button disabled={busy} onClick={() => run(() => decideAction(applicationId, "approved"))}>Approve</Button>
      <Button disabled={busy} variant="outline" onClick={() => run(() => decideAction(applicationId, "rejected"))}>Reject</Button>
    </>}
    {feedback && <p role={failed ? "alert" : "status"} className="w-full text-sm">{feedback}</p>}
  </div>;
}
