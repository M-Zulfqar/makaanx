// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../components/ui/form";
const schema = z.object({ name: z.string().min(2), age: z.coerce.number<string>().int().min(18) });
function Example({ onSubmit }: { onSubmit: (values: z.output<typeof schema>) => void }) {
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { name: "", age: "" } });
  return <Form {...form}><form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField control={form.control} name="name" render={({ field }) => <FormItem><FormLabel>Name</FormLabel><FormControl><input {...field}/></FormControl><FormMessage/></FormItem>}/>
    <FormField control={form.control} name="age" render={({ field }) => <FormItem><FormLabel>Age</FormLabel><FormControl><input {...field}/></FormControl><FormMessage/></FormItem>}/>
    <button type="submit">Save</button>
  </form></Form>;
}
afterEach(cleanup);
test("shadcn form validates and submits transformed Zod 4 values", async () => {
  const submit = vi.fn(); render(<Example onSubmit={submit}/>);
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(screen.getByLabelText("Name").getAttribute("aria-invalid")).toBe("true"));
  expect(submit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: "Ali" } });
  fireEvent.change(screen.getByLabelText("Age"), { target: { value: "21" } });
  fireEvent.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() => expect(submit).toHaveBeenCalledWith({ name: "Ali", age: 21 }, expect.anything()));
});
