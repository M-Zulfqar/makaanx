import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreatePropertyForm } from "@/components/landlord/create-property-form";
import { LandlordPropertyActions } from "@/components/landlord/property-actions";
import { Card, CardContent } from "@/components/ui/card";
import { parseSearch, type SearchParams } from "@/lib/rentals/schema";
import { requireActor } from "@/lib/rentals/service";
import { displayError, landlordApplications, listProperties } from "@/lib/rentals/queries";
import { amount, RentalFailure, RentalFilters, RentalPagination } from "./presentation";
export async function LandlordManager({ params, base = "/landlord/properties", overview = false }: { params: SearchParams; base?: string; overview?: boolean }) {
  const { filters, error } = parseSearch(params);
  let listings, applications, applicationError, listingError = error;
  let authorized = false;
  try {
    const client = await createClient();
    const user = await requireActor(client, "landlord");
    authorized = true;
    if (!error) {
      const [propertyResult, applicationResult] = await Promise.allSettled([listProperties(client, filters, user.id), landlordApplications(client, user.id)]);
      if (propertyResult.status === "fulfilled") listings = propertyResult.value;
      else listingError = displayError(propertyResult.reason);
      if (applicationResult.status === "fulfilled") applications = applicationResult.value;
      else applicationError = displayError(applicationResult.reason);
    }
  } catch (error) { listingError = displayError(error); applicationError = listingError; }
  return <main className="mx-auto max-w-7xl space-y-7 py-4">
    <header className="rounded-3xl bg-primary/5 p-7"><p className="text-sm font-semibold text-primary">Your rental portfolio</p><h1 className="mt-2 text-3xl font-bold">{overview ? "Landlord overview" : "Manage rental properties"}</h1><p className="mt-3 text-muted-foreground">Real listings and application activity. No estimated revenue or demonstration totals.</p></header>
    <section className="grid gap-4 sm:grid-cols-3" aria-label="Rental summary">
      {[["Matching owned listings", listings?.count], ["Applications across all owned listings", applications?.total], ["Pending decisions across all owned listings", applications?.pending]].map(([label, value]) => <Card key={label}><CardContent className="p-5"><h2 className="text-sm text-muted-foreground">{label}</h2><p className="mt-2 text-3xl font-bold">{value ?? "—"}</p></CardContent></Card>)}
    </section>
    {listingError && <RentalFailure message={listingError}/>}
    {applicationError && <RentalFailure message={applicationError}/>}
    {!overview && authorized && <CreatePropertyForm/>}
    <RentalFilters base={base} filters={filters}/>
    <section className="space-y-4"><div className="flex flex-wrap justify-between gap-3"><h2 className="text-2xl font-semibold">Your listings</h2>{overview && <Link className="underline" href="/landlord/properties">Add or edit listings</Link>}</div>
      {listings && !listings.properties.length && <p className="rounded-xl border border-dashed p-8">No owned listings match these filters on this page.</p>}
      <div className="grid gap-5 md:grid-cols-2">{listings?.properties.map(property => <Card key={property.id}><CardContent className="space-y-4 p-5"><h3 className="text-xl font-semibold"><Link href={`/properties/${property.id}`}>{property.title || "Untitled listing"}</Link></h3><p className="text-sm text-muted-foreground">{[property.address, property.city].filter(Boolean).join(", ")}</p><p className="text-lg font-semibold">PKR {amount(property.rent)} / month</p><p className="text-sm">Status: {property.status ?? "Unavailable"}</p><LandlordPropertyActions propertyId={property.id}/></CardContent></Card>)}</div>
      {listings && <RentalPagination base={base} filters={filters} count={listings.count}/>}
    </section>
    <section className="space-y-4"><h2 className="text-2xl font-semibold">Rental applications</h2><p className="text-sm text-muted-foreground">Latest 100 applications across all owned listings. Summary counts include all accessible applications, independently of listing filters.</p>
      {applications && !applications.recent.length && <p>No applications received.</p>}
      {applications?.recent.map(application => <Card key={application.id}><CardContent className="space-y-3 p-5"><Link className="font-semibold underline" href={`/properties/${application.property_id}`}>View property</Link><p className="text-sm">Application reference: {application.id}</p><p className="text-sm">Status: {application.status}</p><LandlordPropertyActions applicationId={application.id} applicationStatus={application.status}/></CardContent></Card>)}
    </section>
  </main>;
}
