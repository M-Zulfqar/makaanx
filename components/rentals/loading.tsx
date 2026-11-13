import { Skeleton } from "@/components/ui/skeleton";
export function RentalLoading() {
  return <div role="status" aria-label="Loading rentals" className="mx-auto max-w-7xl space-y-6 p-6"><Skeleton className="h-36 rounded-3xl"/><div className="grid gap-6 md:grid-cols-3">{[1,2,3].map(id => <Skeleton key={id} className="h-80 rounded-2xl"/>)}</div></div>;
}
