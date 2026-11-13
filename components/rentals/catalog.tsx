import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { parseSearch, type SearchParams } from "@/lib/rentals/schema";
import { displayError, listProperties } from "@/lib/rentals/queries";
import { RentalCard, RentalFailure, RentalFilters, RentalPagination } from "./presentation";
export async function RentalCatalog({ params, base = "/marketplace" }: { params: SearchParams; base?: string }) {
  const { filters, error } = parseSearch(params);
  let result, signedIn = false, showSave = true, saved = new Set<string>(), savedError = false;
  let failure = error;
  if (!failure) {
    try {
      const client = await createClient();
      result = await listProperties(client, filters);
      const { data: { user } } = await client.auth.getUser();
      signedIn = Boolean(user);
      if (user) {
        const profile = await client.from("profiles").select("role").eq("id", user.id).maybeSingle();
        showSave = !profile.error && profile.data?.role === "tenant";
        if (showSave && result.properties.length) {
          const favorites = await client.from("favorites").select("property_id").eq("user_id", user.id).in("property_id", result.properties.map(p => p.id));
          savedError = Boolean(favorites.error); showSave = !savedError;
          saved = new Set(favorites.data?.map(row => row.property_id) ?? []);
        }
      }
    } catch (error) { failure = displayError(error); }
  }
  return <main className="mx-auto max-w-7xl space-y-7 px-4 py-8 sm:px-6">
    <header className="rounded-3xl bg-primary/5 p-7 sm:p-10"><p className="text-sm font-semibold uppercase tracking-wide text-primary">MakaanX rentals</p>
      <h1 className="mt-2 text-3xl font-bold sm:text-4xl">Find your next home</h1><p className="mt-3 text-muted-foreground">Explore live vacant listings. Search by title, city, budget and space.</p>
      <Link href="/" className="mt-3 inline-block text-sm underline">Home</Link></header>
    <RentalFilters base={base} filters={filters}/>
    {failure && <RentalFailure message={failure}/>}
    {savedError && <p role="alert">Saved status is unavailable. Refresh before saving a listing.</p>}
    {!failure && result && <>
      {!result.properties.length && <div className="rounded-2xl border border-dashed p-10 text-center"><h2 className="text-xl font-semibold">No matching listings on this page</h2><p className="mt-2 text-muted-foreground">Change your filters or return to the first page.</p><Link href={base} className="mt-4 inline-block underline">Browse all listings</Link></div>}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">{result.properties.map(property => <RentalCard key={property.id} property={property} base={base} signedIn={signedIn} showSave={showSave} saved={saved.has(property.id)}/>)}</div>
      <RentalPagination base={base} filters={filters} count={result.count}/>
    </>}
  </main>;
}
