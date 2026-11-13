import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminAccessError, requireAdministrator } from "./access";
export const administratorClient = cache(async () => {
  const client = await createClient();
  try { await requireAdministrator(client); }
  catch (error) {
    if (error instanceof AdminAccessError && error.code === "AUTH_REQUIRED") redirect("/auth/login");
    if (error instanceof AdminAccessError && error.code === "FORBIDDEN") redirect("/auth/unauthorized");
    throw error;
  }
  return client;
});
