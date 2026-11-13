import { Skeleton } from "@/components/ui/skeleton";
export default function AdminLoading() {
  return <div role="status" aria-label="Loading administration" className="mx-auto max-w-7xl space-y-5 p-6"><Skeleton className="h-28 rounded-2xl"/><div className="grid gap-5 sm:grid-cols-3">{[1,2,3].map(id => <Skeleton key={id} className="h-44 rounded-2xl"/>)}</div></div>;
}
