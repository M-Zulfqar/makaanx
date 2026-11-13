import type { ReactNode } from "react";
import { Navbar } from "@/components/marketing/navbar";
import { Footer } from "@/components/marketing/footer";
export function PublicRentalFrame({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-background"><Navbar/><div className="pt-24">{children}</div><Footer/></div>;
}
