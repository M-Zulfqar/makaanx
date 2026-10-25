import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreatePropertyForm } from "@/components/landlord/create-property-form";
import { LandlordPropertyActions } from "@/components/landlord/property-actions";
export const dynamic = "force-dynamic";
export default async function ManagePropertiesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <Link href="/auth/login">Sign in</Link>;
  const { data: properties, error } = await supabase.from("properties")
    .select("id,title,address,city,rent").eq("landlord_id", user.id)
    .order("created_at", { ascending: false });
  const { data: applications, error: applicationError } = await supabase.from("applications")
    .select("id,property_id,tenant_id,status,created_at")
    .in("property_id", properties?.map(p => p.id) ?? ["00000000-0000-0000-0000-000000000000"]);
  return <main className="mx-auto max-w-5xl p-6 space-y-8">
    <h1 className="text-3xl font-bold">Manage rental properties</h1>
    <CreatePropertyForm />
    <section className="space-y-4"><h2 className="text-2xl font-semibold">My listings</h2>
      {error && <p role="alert">{error.message}</p>}
      {!error && !properties?.length && <p>No listings yet.</p>}
      {properties?.map(p => <article key={p.id} className="rounded border p-5 space-y-2">
        <h3 className="text-lg font-semibold">{p.title}</h3>
        <p>{[p.address,p.city].filter(Boolean).join(", ")}</p>
        <p>PKR {Number(p.rent ?? 0).toLocaleString()} / month</p>
        <LandlordPropertyActions propertyId={p.id} />
      </article>)}
    </section>
    <section className="space-y-4"><h2 className="text-2xl font-semibold">Rental applications</h2>
      {applicationError && <p role="alert">{applicationError.message}</p>}
      {!applicationError && !applications?.length && <p>No applications received.</p>}
      {applications?.map(a => <article key={a.id} className="rounded border p-4 space-y-2">
        <p>Property: {properties?.find(p => p.id === a.property_id)?.title ?? a.property_id}</p>
        <p>Tenant ID: {a.tenant_id}</p>
        <p>Current status: {a.status}</p>
        <LandlordPropertyActions applicationId={a.id} applicationStatus={a.status} />
      </article>)}
    </section>
  </main>;
}
