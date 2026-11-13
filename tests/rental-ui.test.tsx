// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
const mocks = vi.hoisted(() => ({ save: vi.fn(), favorite: vi.fn(), refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
vi.mock("@/lib/rentals/actions", () => ({ savePropertyAction: mocks.save, favoriteAction: mocks.favorite }));
import { CreatePropertyForm } from "../components/landlord/create-property-form";
import { FavoriteButton } from "../components/marketplace/favorite-button";
import { propertyId } from "./helpers/rental-client";
afterEach(() => { cleanup(); vi.clearAllMocks(); });
test("editor sends a validated payload and handles denied updates truthfully", async () => {
  mocks.save.mockResolvedValue({ ok: false, code: "NOT_CHANGED", message: "No record changed." });
  render(<CreatePropertyForm id={propertyId} initial={{ title: "Existing home", address: "Street 1", city: "Lahore", type: "House", rent: 40000, bedrooms: 2, bathrooms: 1, area: 900 }}/>);
  fireEvent.change(screen.getByLabelText("Title"), { target: { value: "Edited home" } });
  fireEvent.click(screen.getByRole("button", { name: "Save changes" }));
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "No record changed.");
  expect(mocks.save).toHaveBeenCalledWith(propertyId, expect.objectContaining({ title: "Edited home", rent: 40000 }));
  expect(screen.queryByText("Listing updated.")).toBeNull();
});
test("saved-property controls prevent rapid duplicate requests and reflect server props", async () => {
  let finish: (value: unknown) => void = () => {};
  mocks.favorite.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  const view = render(<FavoriteButton propertyId={propertyId} signedIn saved={false}/>);
  const button = screen.getByRole("button", { name: "Save property" });
  fireEvent.click(button); fireEvent.click(button);
  expect(mocks.favorite).toHaveBeenCalledTimes(1);
  expect((button as HTMLButtonElement).disabled).toBe(true);
  await act(async () => finish({ ok: true, changed: true, id: propertyId, message: "Listing saved." }));
  await waitFor(() => expect(mocks.refresh).toHaveBeenCalled());
  view.rerender(<FavoriteButton propertyId={propertyId} signedIn saved/>);
  expect(screen.getByRole("button", { name: "Saved · remove" }).getAttribute("aria-pressed")).toBe("true");
});
test("anonymous save action links to sign-in and does not issue a mutation", () => {
  render(<FavoriteButton propertyId={propertyId}/>);
  expect(screen.getByRole("link", { name: "Sign in to save" }).getAttribute("href")).toBe("/auth/login");
  expect(mocks.favorite).not.toHaveBeenCalled();
});
test("creating a confirmed listing clears the form; failed writes keep the user's input", async () => {
  const initial = { title: "New home", address: "Street 1", city: "Lahore", type: "House" as const, rent: 40000, bedrooms: 2, bathrooms: 1, area: 900 };
  mocks.save.mockResolvedValueOnce({ ok: false, code: "ACCESS_DENIED", message: "Not allowed." });
  render(<CreatePropertyForm initial={initial}/>);
  const title = screen.getByLabelText("Title") as HTMLInputElement;
  fireEvent.change(title, { target: { value: "Updated new home" } });
  fireEvent.click(screen.getByRole("button", { name: "Create listing" }));
  await screen.findByRole("alert"); expect(title.value).toBe("Updated new home");
  mocks.save.mockResolvedValueOnce({ ok: true, changed: true, id: propertyId, message: "Listing created." });
  fireEvent.click(screen.getByRole("button", { name: "Create listing" }));
  await screen.findByRole("status"); expect(title.value).toBe("New home");
});
