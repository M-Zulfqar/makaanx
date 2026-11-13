import { beforeEach, expect, test, vi } from "vitest";
import { rentalClient, roleReply } from "./helpers/rental-client";
const mocks = vi.hoisted(() => ({ create: vi.fn(), redirect: vi.fn((path: string) => { throw new Error(`REDIRECT:${path}`); }) }));
vi.mock("@/lib/supabase/server", () => ({ createClient: mocks.create }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
import { administratorClient } from "../lib/admin/server";
beforeEach(() => vi.clearAllMocks());
test("anonymous server pages redirect to sign-in without data reads", async () => {
  const f = rentalClient([], "tenant", false); mocks.create.mockResolvedValue(f.client);
  await expect(administratorClient()).rejects.toThrow("REDIRECT:/auth/login"); expect(f.calls).toHaveLength(0);
});
test("non-admin profile denies even when user metadata requests admin", async () => {
  const f = rentalClient([roleReply("tenant")]);
  f.getUser.mockResolvedValue({ data: { user: { id: "fixture", user_metadata: { role: "admin" } } }, error: null });
  mocks.create.mockResolvedValue(f.client);
  await expect(administratorClient()).rejects.toThrow("REDIRECT:/auth/unauthorized");
});
test("verified own admin profile permits the cookie-bound client", async () => {
  const f = rentalClient([roleReply("admin")]); mocks.create.mockResolvedValue(f.client);
  expect(await administratorClient()).toBe(f.client); expect(mocks.redirect).not.toHaveBeenCalled();
});
test("verification errors fail closed without redirecting to a successful page", async () => {
  const f = rentalClient([{ data: null, error: { code: "42501" } }]); mocks.create.mockResolvedValue(f.client);
  await expect(administratorClient()).rejects.toMatchObject({ code: "UNAVAILABLE" });
});
