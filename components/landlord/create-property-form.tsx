"use client";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { savePropertyAction } from "@/lib/rentals/actions";
import { propertyInputSchema, type PropertyInput } from "@/lib/rentals/schema";
import { useRentalMutation } from "@/hooks/use-rental-mutation";
export function CreatePropertyForm({ id = null, initial }: { id?: string | null; initial?: PropertyInput }) {
  const formRef = useRef<HTMLFormElement>(null);
  const { run, busy, feedback, failed } = useRentalMutation();
  const fields = [
    ["title", "Title", "text", 150], ["address", "Street address", "text", 500], ["city", "City", "text", 80],
    ["rent", "Monthly rent (PKR)", "number", 1_000_000_000], ["bedrooms", "Bedrooms", "number", 100],
    ["bathrooms", "Bathrooms", "number", 100], ["area", "Area (sq ft)", "number", 10_000_000],
  ] as const;
  return <form id={id ? "edit-listing" : "new-listing"} ref={formRef} onSubmit={async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map(([name, , type]) => [name, type === "number" ? (String(form.get(name)).trim() === "" ? NaN : Number(form.get(name))) : form.get(name)]));
    values.type = form.get("type");
    // Shared schema is also enforced on the server; browser validation is convenience only.
    const parsed = propertyInputSchema.safeParse(values);
    const result = await run(async () => parsed.success ? savePropertyAction(id, parsed.data) : { ok: false, code: "INVALID_INPUT", message: "Check the required fields and numeric limits." });
    if (result?.ok && id === null) formRef.current?.reset();
  }} className="rounded-2xl border bg-card p-6 shadow-sm">
    <h2 className="mb-5 text-xl font-semibold">{id ? "Edit rental listing" : "Add a rental listing"}</h2>
    <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
      {fields.map(([name, label, type, limit]) => <label key={name} className="space-y-2 text-sm font-medium">
        <span>{label}</span><Input name={name} type={type} required defaultValue={initial?.[name] ?? (type === "number" && name !== "rent" ? 0 : "")}
          {...(type === "text" ? { maxLength: limit, minLength: name === "city" ? 2 : 3 } : { min: name === "rent" ? 1 : 0, max: limit, step: 1 })}/>
      </label>)}
      <label className="space-y-2 text-sm font-medium"><span>Property type</span>
        <select name="type" defaultValue={initial?.type ?? "Apartment"} className="h-9 w-full rounded-md border bg-background px-3">
          {propertyInputSchema.shape.type.options.map(type => <option key={type}>{type}</option>)}
        </select></label>
    </fieldset>
    <Button className="mt-5" type="submit" disabled={busy}>{busy ? "Saving…" : id ? "Save changes" : "Create listing"}</Button>
    {feedback && <p role={failed ? "alert" : "status"} className="mt-3 text-sm">{feedback}</p>}
  </form>;
}
