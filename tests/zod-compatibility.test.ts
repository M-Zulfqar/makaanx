import { expect, test } from "vitest";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Resolver, ResolverOptions } from "react-hook-form";

const schema = z.object({
  name: z.string().trim().min(2),
  contact: z.object({ email: z.email() }),
  tags: z.array(z.string().min(2)).max(3),
});
const resolver: Resolver<z.input<typeof schema>, unknown, z.output<typeof schema>> = zodResolver(schema);
const options: ResolverOptions<z.input<typeof schema>> = { fields: {}, shouldUseNativeValidation: false, criteriaMode: "all" };

test("Zod 4 resolver returns transformed values for existing form APIs", async () => {
  const result = await resolver({ name: "  Ali  ", contact: { email: "test@example.test" }, tags: ["home"] }, undefined, options);
  expect(result.errors).toEqual({}); expect(result.values).toEqual({ name: "Ali", contact: { email: "test@example.test" }, tags: ["home"] });
});
test("invalid nested fields become React Hook Form field errors", async () => {
  const result = await resolver({ name: " ", contact: { email: "invalid" }, tags: [""] }, undefined, options);
  expect(result.values).toEqual({}); expect(result.errors.name?.message).toBeTruthy();
  expect(result.errors.contact?.email?.type).toBe("invalid_format");
  expect(result.errors.tags?.[0]?.message).toBeTruthy();
});
test("oversized constrained arrays fail with bounded errors", () => {
  // Reproduces the advisory's constrained-collection shape without risking OOM.
  const result = z.array(z.object({ value: z.string() })).max(3).safeParse(Array.from({ length: 20_000 }, () => ({ value: "valid" })));
  expect(result.success).toBe(false);
  if (!result.success) { expect(result.error.issues).toHaveLength(1); expect(result.error.issues[0].code).toBe("too_big"); }
});
test("async schema refinements remain supported", async () => {
  const asyncResolver = zodResolver(z.object({ name: z.string().refine(async value => value !== "taken", "Unavailable") }));
  const result = await asyncResolver({ name: "taken" }, undefined, { fields: {}, shouldUseNativeValidation: false });
  expect(result.errors.name?.message).toBe("Unavailable");
});
