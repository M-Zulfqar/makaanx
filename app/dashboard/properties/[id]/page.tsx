import { RentalDetail } from "@/components/rentals/detail";
export const dynamic = "force-dynamic";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RentalDetail id={(await params).id} base="/dashboard/properties"/>;
}
