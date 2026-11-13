import Link from "next/link";
import type { ReactNode } from "react";
import { Bath, BedDouble, Building2, MapPin, Ruler } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { searchHref, type RentalProperty, type RentalSearch } from "@/lib/rentals/schema";
export function amount(value: number | string | null) {
  return value !== null && Number.isFinite(Number(value)) ? new Intl.NumberFormat("en-PK").format(Number(value)) : "Not provided";
}
export function RentalCard({ property, base = "/marketplace", signedIn = false, saved = false, showSave = true }: {
  property: RentalProperty; base?: string; signedIn?: boolean; saved?: boolean; showSave?: boolean;
}) {
  return <Card className="group h-full gap-0 overflow-hidden rounded-2xl py-0 transition-shadow hover:shadow-xl">
    <Link href={`${base}/${property.id}`} className="relative flex h-44 items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
      <Building2 className="h-16 w-16 text-primary/60" aria-hidden/>
      <Badge className="absolute left-4 top-4" variant="secondary">{property.type || "Rental listing"}</Badge>
      <span className="absolute bottom-3 text-xs text-muted-foreground">Property photo not provided</span>
    </Link>
    <CardContent className="space-y-4 p-5">
      <div><h2 className="text-lg font-semibold"><Link href={`${base}/${property.id}`}>{property.title || "Untitled listing"}</Link></h2>
        <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4"/>{[property.address, property.city].filter(Boolean).join(", ") || "Address not provided"}</p></div>
      <p className="text-2xl font-bold text-primary">PKR {amount(property.rent)}<span className="text-xs font-normal text-muted-foreground"> / month</span></p>
      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        <span className="flex gap-1"><BedDouble className="h-4 w-4"/>{property.bedrooms ?? "—"} beds</span>
        <span className="flex gap-1"><Bath className="h-4 w-4"/>{property.bathrooms ?? "—"} baths</span>
        <span className="flex gap-1"><Ruler className="h-4 w-4"/>{amount(property.area)} sq ft</span>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-2"><Button variant="secondary" asChild><Link href={`${base}/${property.id}`}>View listing</Link></Button>
        {showSave && <FavoriteButton propertyId={property.id} signedIn={signedIn} saved={saved}/>}</div>
    </CardContent>
  </Card>;
}
export function RentalFailure({ message }: { message: string }) {
  return <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-5"><p className="font-medium">Rental information is unavailable</p><p className="mt-1 text-sm">{message}</p></div>;
}
export function RentalPagination({ base, filters, count }: { base: string; filters: RentalSearch; count: number }) {
  const pages = Math.ceil(count / 12);
  return <nav aria-label="Listing pages" className="flex flex-wrap items-center justify-between gap-3 border-t pt-5">
    <p className="text-sm text-muted-foreground">{count} matching {count === 1 ? "record" : "records"}{count > 0 ? ` · Page ${filters.page} of ${pages}` : ""}</p>
    <div className="flex gap-2">{filters.page > 1 && <Button asChild variant="outline"><Link href={searchHref(base, filters, filters.page - 1)}>Previous</Link></Button>}
      {filters.page < pages && <Button asChild variant="outline"><Link href={searchHref(base, filters, filters.page + 1)}>Next</Link></Button>}</div>
  </nav>;
}
export function RentalFilters({ base, filters, children }: { base: string; filters: RentalSearch; children?: ReactNode }) {
  const input = "h-10 min-w-0 w-full rounded-lg border bg-background px-3 text-sm";
  return <form action={base} method="get" className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-4">
    <label className="space-y-1 text-sm">Search title<input className={input} name="q" maxLength={100} defaultValue={filters.q} placeholder="Apartment, house…"/></label>
    <label className="space-y-1 text-sm">City<input className={input} name="city" maxLength={80} defaultValue={filters.city} placeholder="Any city"/></label>
    <label className="space-y-1 text-sm">Property type<select className={input} name="type" defaultValue={filters.type}><option value="">All types</option>{["Apartment", "House", "Room", "Commercial"].map(type => <option key={type}>{type}</option>)}</select></label>
    <label className="space-y-1 text-sm">Minimum bedrooms<input className={input} name="beds" type="number" min={0} max={100} defaultValue={filters.beds ?? ""}/></label>
    <label className="space-y-1 text-sm">Minimum rent (PKR)<input className={input} name="min" type="number" min={0} max={1_000_000_000} defaultValue={filters.min ?? ""}/></label>
    <label className="space-y-1 text-sm">Maximum rent (PKR)<input className={input} name="max" type="number" min={0} max={1_000_000_000} defaultValue={filters.max ?? ""}/></label>
    <label className="space-y-1 text-sm">Sort by<select className={input} name="sort" defaultValue={filters.sort}><option value="newest">Newest first</option><option value="rent_low">Rent: low to high</option><option value="rent_high">Rent: high to low</option></select></label>
    {children}
    <div className="flex items-end gap-3"><Button type="submit">Search</Button><Link href={base} className="pb-2 text-sm underline">Reset</Link></div>
  </form>;
}
