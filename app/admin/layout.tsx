import type { ReactNode } from "react";
import AdminShell from "@/components/admin/shell";
import { administratorClient } from "@/lib/admin/server";
export const dynamic = "force-dynamic";
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await administratorClient();
  return <AdminShell>{children}</AdminShell>;
}
