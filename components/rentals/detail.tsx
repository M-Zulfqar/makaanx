import Link from "next/link";
import { notFound } from "next/navigation";
import { Building2, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { idSchema, PROPERTY_COLUMNS, propertyRowSchema } from "@/lib/rentals/schema";
import { checkDatabase } from "@/lib/rentals/service";
import { ApplyButton } from "@/components/marketplace/apply-button";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ContactLandlord } from "@/components/marketplace/contact-landlord";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { amount } from "./presentation";
export async function RentalDetail({ id, base = "/marketplace" }: { id: string; base?: string }) {
  if (!idSchema.safeParse(id).success) notFound();
  const client = await createClient();
  const result = await client.from("properties").select(PROPERTY_COLUMNS).eq("id", id).maybeSingle();
  checkDatabase(result.error);
  if (!result.data) notFound();
  const property = propertyRowSchema.parse(result.data);
  const { data: { user } } = await client.auth.getUser();
  const profile = user ? await client.from("profiles").select("role").eq("id", user.id).maybeSingle() : null;
  const tenant = profile?.data?.role === "tenant" && !profile.error;
  const [favorite, application] = user && tenant ? await Promise.all([
    client.from("favorites").select("property_id").eq("user_id", user.id).eq("property_id", id).maybeSingle(),
    client.from("applications").select("id").eq("tenant_id", user.id).eq("property_id", id).maybeSingle(),
  ]) : [null, null];
  return <main className="mx-auto max-w-6xl space-y-6 p-4 py-8 sm:p-8">
    <Link className="text-sm underline" href={base}>← Back to listings</Link>
    <div className="flex h-60 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 sm:h-80"><div className="text-center"><Building2 className="mx-auto h-24 w-24 text-primary/60"/><p className="mt-4 text-sm text-muted-foreground">Property photo not provided</p></div></div>
    <div className="grid gap-7 lg:grid-cols-[1fr_360px]"><section className="space-y-5">
      <Badge variant="secondary">{property.type || "Rental listing"} · {property.status || "Status unavailable"}</Badge>
      <h1 className="text-3xl font-bold sm:text-4xl">{property.title || "Untitled listing"}</h1>
      <p className="flex gap-2 text-muted-foreground"><MapPin className="h-5 w-5"/>{[property.address, property.city].filter(Boolean).join(", ") || "Address not provided"}</p>
      <div className="grid grid-cols-3 gap-3">{[["Bedrooms", property.bedrooms ?? "—"], ["Bathrooms", property.bathrooms ?? "—"], ["Area (sq ft)", amount(property.area)]].map(([label, value]) => <Card key={label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></CardContent></Card>)}</div>
      <p className="rounded-xl border p-4 text-sm text-muted-foreground">Listing information is supplied by the landlord. No inspection, trust score or identity approval is implied.</p>
    </section><Card className="h-fit"><CardContent className="space-y-5 p-6">
      <div><p className="text-sm text-muted-foreground">Monthly rent</p><p className="text-3xl font-bold text-primary">PKR {amount(property.rent)}</p></div>
      {!user && <Link href="/auth/login" className="underline">Sign in to apply or save</Link>}
      {user && profile?.error && <p role="alert">Unable to check account permissions. Refresh to try again.</p>}
      {user && tenant && <>
        {favorite?.error ? <p role="alert">Unable to load saved status.</p> : <FavoriteButton propertyId={id} signedIn saved={Boolean(favorite?.data)}/>}
        {application?.error ? <p role="alert">Unable to check existing applications.</p> : property.status === "vacant" ? <ApplyButton propertyId={id} applied={Boolean(application?.data)}/> : <p>This listing is not accepting applications.</p>}
        <ContactLandlord propertyId={id}/>
      </>}
      {user && !tenant && !profile?.error && <p className="text-sm">A tenant account is required to save or apply.</p>}
    </CardContent></Card></div>
  </main>;
}
