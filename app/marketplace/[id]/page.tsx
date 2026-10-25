import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ApplyButton } from "@/components/marketplace/apply-button";
import { FavoriteButton } from "@/components/marketplace/favorite-button";
import { ContactLandlord } from "@/components/marketplace/contact-landlord";

export const dynamic = "force-dynamic";
export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const supabase = await createClient();
  const { data: property, error } = await supabase.from("properties")
    .select("id,title,address,city,rent,landlord_id").eq("id", id).maybeSingle();
  if (error || !property) notFound();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    : { data: null };
  return <main className="mx-auto max-w-3xl p-6 space-y-5">
    <Link href="/marketplace" className="underline">← All properties</Link>
    <h1 className="text-3xl font-bold">{property.title ?? "Rental property"}</h1>
    <p>{[property.address,property.city].filter(Boolean).join(", ")}</p>
    <p className="text-xl font-semibold">PKR {Number(property.rent ?? 0).toLocaleString()} / month</p>
    <FavoriteButton propertyId={property.id} />
    {profile?.role === "tenant" && <ContactLandlord propertyId={property.id} />}
    {!user ? <Link href="/auth/login" className="underline">Sign in to apply</Link>
      : profile?.role === "tenant" ? <ApplyButton propertyId={property.id} />
      : <p>Only tenant accounts can submit rental applications.</p>}
  </main>;
}
