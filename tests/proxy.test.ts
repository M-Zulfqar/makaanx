import { beforeEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";

const state = vi.hoisted(() => ({ user: null as null | { id: string }, role: "admin", roleError: null as null | Error }));
vi.mock("@supabase/ssr", () => ({
  createServerClient: (_url: string, _key: string, options: { cookies: { setAll: (cookies: unknown[]) => void } }) => ({
    auth: { getUser: async () => {
      options.cookies.setAll([{ name: "sb-session", value: "refreshed", options: { httpOnly: true, path: "/", sameSite: "lax" } }]);
      return { data: { user: state.user } };
    } },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: { role: state.role }, error: state.roleError }) }) }) }),
  }),
}));

beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-only");
  state.user = null; state.role = "admin"; state.roleError = null;
});

test("anonymous protected redirect carries refreshed session cookies", async () => {
  const response = await proxy(new NextRequest("https://makaanx.test/admin/users"));
  expect(response.headers.get("location")).toBe("https://makaanx.test/auth/login?next=%2Fadmin%2Fusers");
  expect(response.cookies.get("sb-session")).toMatchObject({ value: "refreshed", httpOnly: true, path: "/", sameSite: "lax" });
});

test("wrong-role redirect preserves cookie options", async () => {
  state.user = { id: "test-user" }; state.role = "tenant";
  const response = await proxy(new NextRequest("https://makaanx.test/admin?secret=discard"));
  expect(response.headers.get("location")).toBe("https://makaanx.test/auth/unauthorized");
  expect(response.cookies.get("sb-session")).toMatchObject({ value: "refreshed", httpOnly: true });
});

test("authorized requests retain refreshed cookies", async () => {
  state.user = { id: "test-admin" };
  const response = await proxy(new NextRequest("https://makaanx.test/admin"));
  expect(response.headers.get("location")).toBeNull();
  expect(response.cookies.get("sb-session")?.value).toBe("refreshed");
});

test("profile query errors deny access", async () => {
  state.user = { id: "test-user" }; state.roleError = new Error("unavailable");
  const response = await proxy(new NextRequest("https://makaanx.test/admin"));
  expect(response.headers.get("location")).toBe("https://makaanx.test/auth/unauthorized");
});

test("missing configuration fails closed for protected routes", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  const response = await proxy(new NextRequest("https://makaanx.test/admin"));
  expect(response.headers.get("location")).toBe("https://makaanx.test/auth/unauthorized");
});

test("missing configuration still permits auth pages", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  const response = await proxy(new NextRequest("https://makaanx.test/auth/login"));
  expect(response.headers.get("location")).toBeNull();
});
