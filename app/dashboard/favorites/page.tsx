import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActor, checkDatabase } from "@/lib/rentals/service";
import { parseProperties } from "@/lib/rentals/queries";
import { PAGE_SIZE, PROPERTY_COLUMNS, parseSearch, type SearchParams } from "@/lib/rentals/schema";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { RentalCard, RentalPagination } from "@/components/rentals/presentation";
export const dynamic = "force-dynamic";
export default async function FavoritesPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const { filters, error } = parseSearch({ page: (await searchParams).page });
  if (error) return <p role="alert">{error}</p>;
  const client = await createClient();
  const user = await requireActor(client, "tenant");
  const start = (filters.page - 1) * PAGE_SIZE;
  const favorites = await client.from("favorites").select("property_id", { count: "exact" }).eq("user_id", user.id).order("property_id").range(start, start + PAGE_SIZE - 1);
  checkDatabase(favorites.error);
  if (favorites.count === null) throw new Error("COUNT_UNAVAILABLE");
  const ids = favorites.data?.map(row => row.property_id) ?? [];
  const rows = ids.length ? await client.from("properties").select(PROPERTY_COLUMNS).in("id", ids) : { data: [], error: null };
  checkDatabase(rows.error);
  const properties = parseProperties(rows.data);
  return <main className="mx-auto max-w-7xl space-y-6 py-6"><header><h1 className="text-3xl font-bold">Saved properties</h1><Link href="/dashboard/properties" className="mt-3 inline-block text-primary underline">Explore rentals</Link></header>
    {favorites.count === 0 && <p className="rounded-2xl border border-dashed p-10">You have no saved properties yet.</p>}
    {ids.filter(id => !properties.some(property => property.id === id)).map(id => <article key={id} className="space-y-3 rounded-xl border p-5"><p>This saved listing is no longer accessible.</p><FavoriteButton propertyId={id} signedIn saved/></article>)}
    {favorites.count > 0 && !ids.length && <p>No saved records on this page. Return to a previous page.</p>}
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{properties.map(property => <RentalCard key={property.id} property={property} base="/dashboard/properties" signedIn saved/>)}</div>
    <RentalPagination base="/dashboard/favorites" filters={filters} count={favorites.count}/>
  </main>;
}
