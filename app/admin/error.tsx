"use client";
import { Button } from "@/components/ui/button";
export default function AdminErrorPage({ reset }: { reset: () => void }) {
  return <div className="mx-auto max-w-3xl space-y-4 p-6" role="alert"><h1 className="text-2xl font-bold">Administration data unavailable</h1><p>The request or permission check could not be completed. No empty dataset or successful operation is inferred.</p><Button onClick={reset}>Try again</Button></div>;
}
