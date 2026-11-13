// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AIChatbot } from "../components/ai-chatbot";
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
test("a suggested prompt sends that prompt rather than stale input", () => {
  vi.useFakeTimers();
  Element.prototype.scrollIntoView = vi.fn();
  render(<AIChatbot isOpen onClose={vi.fn()}/>);
  const input = screen.getByPlaceholderText("Ask me anything about rentals...");
  fireEvent.change(input, { target: { value: "stale input" } });
  fireEvent.click(screen.getByRole("button", { name: "Find 2-bedroom apartments in DHA" }));
  // AnimatePresence may retain the exiting suggestion; verify the message bubble.
  expect(screen.getAllByText("Find 2-bedroom apartments in DHA").filter(element => element.tagName === "P")).toHaveLength(1);
  expect(screen.queryByText("stale input")).toBeNull();
  expect((input as HTMLInputElement).value).toBe("");
  act(() => vi.advanceTimersByTime(1600));
  expect(screen.getByText(/I found several great 2-bedroom options/)).toBeTruthy();
});
