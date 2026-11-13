// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
const state = vi.hoisted(() => ({ prev: false, next: true, events: new Map<string, Set<() => void>>(), scrollPrev: vi.fn(), scrollNext: vi.fn(), ref: vi.fn() }));
vi.mock("embla-carousel-react", () => {
  const api = {
    canScrollPrev: () => state.prev, canScrollNext: () => state.next,
    scrollPrev: state.scrollPrev, scrollNext: state.scrollNext,
    on: (name: string, fn: () => void) => { if (!state.events.has(name)) state.events.set(name, new Set()); state.events.get(name)!.add(fn); },
    off: (name: string, fn: () => void) => state.events.get(name)?.delete(fn),
  };
  return { default: () => [state.ref, api] };
});
import { Carousel, CarouselNext, CarouselPrevious } from "../components/ui/carousel";
beforeEach(() => { state.prev = false; state.next = true; state.events.clear(); state.scrollNext.mockClear(); });
afterEach(cleanup);
test("carousel initializes controls, responds to reInit/select and removes both subscriptions", () => {
  const view = render(<Carousel><CarouselPrevious /><CarouselNext /></Carousel>);
  const prev = screen.getByRole("button", { name: "Previous slide" }) as HTMLButtonElement;
  const next = screen.getByRole("button", { name: "Next slide" }) as HTMLButtonElement;
  expect(prev.disabled).toBe(true); expect(next.disabled).toBe(false);
  fireEvent.click(next); expect(state.scrollNext).toHaveBeenCalledOnce();
  act(() => { state.prev = true; state.next = false; state.events.get("select")?.forEach(fn => fn()); });
  expect(prev.disabled).toBe(false); expect(next.disabled).toBe(true);
  act(() => { state.prev = false; state.next = true; state.events.get("reInit")?.forEach(fn => fn()); });
  expect(prev.disabled).toBe(true); expect(next.disabled).toBe(false);
  view.unmount(); expect([...state.events.values()].every(listeners => listeners.size === 0)).toBe(true);
});
