import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listProperties, displayError } from "@/lib/rentals/queries";
import { parseSearch } from "@/lib/rentals/schema";
import { RentalCard, RentalFailure } from "@/components/rentals/presentation";
export async function FeaturedProperties() {
  let properties, failure;
  try { properties = (await listProperties(await createClient(), parseSearch({}).filters)).properties.slice(0, 3); }
  catch (error) { failure = displayError(error); }
  return <section className="bg-muted/30 py-16"><div className="mx-auto max-w-7xl space-y-7 px-4 sm:px-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">Discover MakaanX</p><h2 className="mt-2 text-3xl font-bold">Latest rental listings</h2><p className="mt-2 text-muted-foreground">Real listings, directly from landlords.</p></div><Link className="font-medium text-primary underline" href="/properties">Browse all rentals →</Link></div>
    {failure && <RentalFailure message={failure}/>}
    {properties && !properties.length && <p className="rounded-2xl border border-dashed p-8">No vacant listings have been published yet.</p>}
    <div className="grid gap-6 md:grid-cols-3">{properties?.map(property => <RentalCard key={property.id} property={property} base="/properties" showSave={false}/>)}</div>
  </div></section>;
}
