import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
type CookieToSet = { name: string; value: string; options?: CookieOptions };

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    if (request.nextUrl.pathname.startsWith("/auth/")) return response;
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth/unauthorized";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }
  function redirectWithCookies(destination: URL) {
    const redirectResponse = NextResponse.redirect(destination);
    response.cookies.getAll().forEach(cookie => redirectResponse.cookies.set(cookie));
    return redirectResponse;
  }
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(toSet: CookieToSet[]) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  if (!user && (/^\/(dashboard|landlord|admin)(\/|$)/).test(pathname)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth/login";
    redirect.searchParams.set("next", pathname);
    return redirectWithCookies(redirect);
  }
  if (user && (/^\/(dashboard|landlord|admin)(\/|$)/).test(pathname)) {
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const expected = pathname.startsWith("/admin") ? "admin" : pathname.startsWith("/landlord") ? "landlord" : "tenant";
    if (error || !profile || profile.role !== expected) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/auth/unauthorized";
      redirect.search = "";
      return redirectWithCookies(redirect);
    }
  }
  return response;
}
export const config = { matcher: ["/dashboard/:path*", "/landlord/:path*", "/admin/:path*", "/auth/:path*"] };
