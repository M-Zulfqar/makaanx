import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.redirect(new URL("/auth/login?error=missing_code", origin));
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/auth/login?error=callback_failed", origin));
  if (request.nextUrl.searchParams.get("next") === "reset-password") return NextResponse.redirect(new URL("/auth/reset-password", origin));
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/auth/login", origin));
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const destination = profile?.role === "admin" ? "/admin" : profile?.role === "landlord" ? "/landlord" : profile?.role === "tenant" ? "/dashboard" : "/auth/unauthorized";
  return NextResponse.redirect(new URL(destination, origin));
}
