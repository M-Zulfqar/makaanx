import { RentalCatalog } from "@/components/rentals/catalog";
import type { SearchParams } from "@/lib/rentals/schema";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<SearchParams> }) {
  return <RentalCatalog params={await searchParams} base="/properties"/>;
}
