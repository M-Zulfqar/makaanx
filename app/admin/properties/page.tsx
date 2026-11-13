import Link from "next/link";
import { administratorClient } from "@/lib/admin/server";
import { parseAdminPropertyFilters, readAdminProperties } from "@/lib/admin/data";
import type { SearchParams } from "@/lib/rentals/schema";
import { AdminCoverage } from "@/components/admin/presentation";
import { RentalFailure, RentalFilters, RentalPagination, amount } from "@/components/rentals/presentation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
export const dynamic = "force-dynamic";
export default async function AdminProperties({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const client = await administratorClient();
  const { filters, error } = parseAdminPropertyFilters(await searchParams);
  let listings, failure = error;
  if (!failure) {
    try { listings = await readAdminProperties(client, filters); }
    catch { failure = "Unable to load permitted property records. Check access or try again."; }
  }
  return <div className="mx-auto max-w-7xl space-y-6">
    <header><p className="text-sm font-semibold text-destructive">Read-only administration</p><h1 className="mt-2 text-3xl font-bold">Properties</h1><p className="mt-3 text-muted-foreground">Inspect permitted listings. Moderation and owner reassignment are disabled pending authorization and audit review.</p></header>
    <AdminCoverage/>
    <RentalFilters base="/admin/properties" filters={filters}><label className="space-y-1 text-sm">Listing status<input className="h-10 w-full rounded-lg border bg-background px-3" name="status" maxLength={40} placeholder="Any status" defaultValue={filters.status}/></label></RentalFilters>
    {failure && <RentalFailure message={failure}/>}
    {listings && <>
      {!listings.properties.length && <p className="rounded-2xl border border-dashed p-8">No accessible properties match this page and filter. This does not establish that the platform has no properties.</p>}
      {listings.ownerError && <p role="alert" className="rounded-xl border p-4">Owner details could not be loaded. Listing records remain visible where permitted.</p>}
      <div className="grid gap-5 md:grid-cols-2">{listings.properties.map(property => <Card key={property.id}><CardContent className="space-y-3 p-5">
        <Badge variant="secondary">{property.status || "Unspecified status"}</Badge><h2 className="break-words text-xl font-semibold">{property.title || "Untitled listing"}</h2>
        <p className="break-words text-sm text-muted-foreground">{[property.address, property.city].filter(Boolean).join(", ") || "Address not provided"}</p>
        <p className="font-semibold">PKR {amount(property.rent)} / month</p><p className="text-sm">{property.type || "Type unavailable"} · {property.bedrooms ?? "—"} beds · {property.bathrooms ?? "—"} baths · {amount(property.area)} sq ft</p>
        <p className="text-sm">Owner: {listings.names.get(property.landlord_id) || (listings.ownerError ? "Details unavailable" : "Name unavailable in permitted profile records")}</p>
        <Link className="inline-block text-sm underline" href={`/properties/${property.id}`}>View permitted listing details</Link>
      </CardContent></Card>)}</div>
      <RentalPagination base="/admin/properties" filters={filters} count={listings.count}/>
    </>}
  </div>;
}
