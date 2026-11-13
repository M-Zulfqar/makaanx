"use client";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { favoriteAction } from "@/lib/rentals/actions";
import { useRentalMutation } from "@/hooks/use-rental-mutation";
export function FavoriteButton({ propertyId, saved = false, signedIn = false }: { propertyId: string; saved?: boolean; signedIn?: boolean }) {
  const { run, busy, feedback, failed } = useRentalMutation();
  return <div className="space-y-2">
    {signedIn ? <Button type="button" variant="outline" disabled={busy} aria-pressed={saved}
      onClick={() => run(() => favoriteAction(propertyId, !saved))}>
      <Heart className={saved ? "fill-primary text-primary" : ""}/>{busy ? "Saving…" : saved ? "Saved · remove" : "Save property"}
    </Button> : <Link href="/auth/login" className="text-sm underline">Sign in to save</Link>}
    {feedback && <p role={failed ? "alert" : "status"} className="text-sm">{feedback}</p>}
  </div>;
}
