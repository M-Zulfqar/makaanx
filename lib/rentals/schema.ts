import { z } from "zod";

export const idSchema = z.uuid();
export const propertyInputSchema = z.object({
  title: z.string().trim().min(3).max(150),
  address: z.string().trim().min(3).max(500),
  city: z.string().trim().min(2).max(80),
  type: z.enum(["Apartment", "House", "Room", "Commercial"]),
  rent: z.number().finite().positive().max(1_000_000_000),
  bedrooms: z.number().int().min(0).max(100),
  bathrooms: z.number().int().min(0).max(100),
  area: z.number().finite().min(0).max(10_000_000),
}).strict();
export type PropertyInput = z.infer<typeof propertyInputSchema>;
export const propertyRowSchema = z.object({
  id: idSchema, landlord_id: idSchema,
  title: z.string().nullable(), address: z.string().nullable(), city: z.string().nullable(),
  type: z.string().nullable(), status: z.string().nullable(),
  rent: z.union([z.number(), z.string()]).nullable(),
  bedrooms: z.number().nullable(), bathrooms: z.number().nullable(),
  area: z.union([z.number(), z.string()]).nullable(), created_at: z.string(),
});
export type RentalProperty = z.infer<typeof propertyRowSchema>;
export const PROPERTY_COLUMNS = "id,landlord_id,title,address,city,type,status,rent,bedrooms,bathrooms,area,created_at";
export type SearchParams = Record<string, string | string[] | undefined>;
const optionalNumber = z.preprocess(value => value === "" || value === undefined ? undefined : Number(value), z.number().finite().min(0).max(1_000_000_000).optional());
const searchSchema = z.object({
  q: z.string().trim().max(100).default(""), city: z.string().trim().max(80).default(""),
  type: z.union([z.literal(""), propertyInputSchema.shape.type]).default(""),
  min: optionalNumber, max: optionalNumber,
  beds: z.preprocess(value => value === "" || value === undefined ? undefined : Number(value), z.number().int().min(0).max(100).optional()),
  sort: z.enum(["newest", "rent_low", "rent_high"]).default("newest"),
  page: z.preprocess(value => value === undefined || value === "" ? 1 : Number(value), z.number().int().min(1).max(10_000)),
}).refine(value => value.min === undefined || value.max === undefined || value.min <= value.max, { message: "Minimum rent must not exceed maximum rent." });
export type RentalSearch = z.infer<typeof searchSchema>;
export const PAGE_SIZE = 12;
export function parseSearch(params: SearchParams) {
  const parsed = searchSchema.safeParse(params);
  if (!parsed.success) return { filters: searchSchema.parse({}), error: "Check your search filters and page number." };
  return { filters: parsed.data, error: null };
}
// A literal ILIKE value, never interpolated PostgREST OR/filter syntax.
export const literalSearch = (text: string) => `%${text.replace(/[\\%_]/g, "\\$&")}%`;
export function searchHref(base: string, filters: RentalSearch, page: number) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries({ ...filters, page })) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `${base}?${params}`;
}
export const applicationDecisionSchema = z.enum(["approved", "rejected"]);
