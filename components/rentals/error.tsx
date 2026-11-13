"use client";
import { Button } from "@/components/ui/button";
export default function RentalErrorPage({ reset }: { reset: () => void }) {
  return <main className="mx-auto max-w-3xl space-y-4 p-8" role="alert"><h1 className="text-2xl font-bold">Unable to load rental information</h1><p>The request could not be completed. Try again, or check the connection and listing permissions.</p><Button onClick={reset}>Try again</Button></main>;
}
