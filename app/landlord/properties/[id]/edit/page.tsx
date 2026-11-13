import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireActor, checkDatabase } from "@/lib/rentals/service";
import { idSchema, PROPERTY_COLUMNS, propertyInputSchema } from "@/lib/rentals/schema";
import { CreatePropertyForm } from "@/components/landlord/create-property-form";
export const dynamic = "force-dynamic";
export default async function EditListing({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!idSchema.safeParse(id).success) notFound();
  const client = await createClient();
  const user = await requireActor(client, "landlord");
  const result = await client.from("properties").select(PROPERTY_COLUMNS).eq("id", id).eq("landlord_id", user.id).maybeSingle();
  checkDatabase(result.error);
  if (!result.data) notFound();
  // Reject incompatible/partial records instead of silently overwriting unknown values.
  const { title, address, city, type, rent, bedrooms, bathrooms, area } = result.data;
  const initial = propertyInputSchema.safeParse({ title, address, city, type, rent: rent === null ? NaN : Number(rent), bedrooms, bathrooms, area: area === null ? NaN : Number(area) });
  return <main className="mx-auto max-w-3xl space-y-5 py-6"><Link className="underline" href="/landlord/properties">← Your listings</Link>
    {initial.success ? <CreatePropertyForm id={id} initial={initial.data}/> : <p role="alert">This listing has incomplete or unsupported fields. Contact support before editing; no values have been changed.</p>}
  </main>;
}
