"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { applyToProperty, decideApplication, deleteProperty, RentalError, saveProperty, setFavorite, type MutationOutcome } from "./service";
export type ActionResult = ({ ok: true } & MutationOutcome) | { ok: false; code: string; message: string };
async function perform(run: (client: Awaited<ReturnType<typeof createClient>>) => Promise<MutationOutcome>): Promise<ActionResult> {
  try {
    const result = await run(await createClient());
    for (const path of ["/", "/marketplace", "/properties", "/dashboard", "/dashboard/properties", "/dashboard/favorites", "/dashboard/applications", "/landlord", "/landlord/properties", "/landlord/manage", "/landlord/analytics"]) revalidatePath(path);
    for (const path of ["/marketplace/[id]", "/properties/[id]", "/dashboard/properties/[id]", "/landlord/properties/[id]/edit"]) revalidatePath(path, "page");
    return { ok: true, ...result };
  } catch (error) {
    return error instanceof RentalError ? { ok: false, code: error.code, message: error.message }
      : { ok: false, code: "UNAVAILABLE", message: "Unable to confirm the operation. Refresh before retrying." };
  }
}
export async function savePropertyAction(id: string | null, input: unknown) { return perform(client => saveProperty(client, id, input)); }
export async function deletePropertyAction(id: string) { return perform(client => deleteProperty(client, id)); }
export async function applyAction(id: string) { return perform(client => applyToProperty(client, id)); }
export async function decideAction(id: string, decision: string) { return perform(client => decideApplication(client, id, decision)); }
export async function favoriteAction(id: string, desired: boolean) { return perform(client => setFavorite(client, id, desired)); }
