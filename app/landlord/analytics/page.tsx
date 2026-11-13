import { LandlordManager } from "@/components/rentals/landlord-manager";
import type { SearchParams } from "@/lib/rentals/schema";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <LandlordManager params={await searchParams} base="/landlord/analytics" overview={true}/>;
}
