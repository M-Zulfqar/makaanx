// @vitest-environment jsdom
import React from "react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { ThemeProvider, useTheme } from "../lib/theme/context";
import { I18nProvider, useI18n } from "../lib/i18n/context";
import { useIsMobile } from "../hooks/use-mobile";
import { createBrowserPreference } from "../lib/browser-preference";

let dark = false;
let mobile = false;
const media = new Map<string, { listeners: Set<() => void> }>();
beforeEach(() => {
  dark = false; mobile = false; media.clear(); localStorage.clear();
  vi.stubGlobal("matchMedia", (query: string) => {
    if (!media.has(query)) media.set(query, { listeners: new Set() });
    const listeners = media.get(query)!.listeners;
    return {
      get matches() { return query.includes("767px") ? mobile : dark; },
      addEventListener: (_: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
    };
  });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function Probe() {
  const { theme, setTheme } = useTheme(); const { language, setLanguage } = useI18n(); const isMobile = useIsMobile();
  return <><output>{`${theme}/${language}/${isMobile ? "mobile" : "desktop"}`}</output>
    <button onClick={() => setTheme("midnight")}>Midnight</button><button onClick={() => setLanguage("ur")}>Urdu</button></>;
}
const View = () => <ThemeProvider><I18nProvider><Probe /></I18nProvider></ThemeProvider>;

test("server render contains content and a stable default snapshot", () => {
  expect(renderToString(<View />)).toContain("light/en/desktop");
});
test("restores preferences, persists selections and updates document attributes", () => {
  localStorage.setItem("makaanx-theme", "realestate"); localStorage.setItem("makaanx-language", "ur");
  render(<View />); expect(screen.getByRole("status").textContent).toBe("realestate/ur/desktop");
  expect(document.documentElement.classList.contains("theme-realestate")).toBe(true);
  expect(document.documentElement.dir).toBe("rtl");
  fireEvent.click(screen.getByRole("button", { name: "Midnight" }));
  expect(localStorage.getItem("makaanx-theme")).toBe("midnight"); expect(document.documentElement.classList.contains("theme-midnight")).toBe(true);
  expect(document.documentElement.classList.contains("theme-realestate")).toBe(false);
});
test("subscribes to system theme and mobile media changes and cleans up", () => {
  const view = render(<View />);
  act(() => { dark = true; mobile = true; for (const { listeners } of media.values()) for (const listener of listeners) listener(); });
  expect(screen.getByRole("status").textContent).toBe("dark/en/mobile");
  view.unmount(); expect([...media.values()].every(value => value.listeners.size === 0)).toBe(true);
});
test("cross-tab preferences update the displayed language", () => {
  render(<View />);
  act(() => { localStorage.setItem("makaanx-language", "ur"); window.dispatchEvent(new StorageEvent("storage", { key: "makaanx-language" })); });
  expect(screen.getByRole("status").textContent).toBe("light/ur/desktop"); expect(document.documentElement.lang).toBe("ur");
});
test("blocked storage still allows a preference to change in memory", () => {
  const store = createBrowserPreference("test-blocked-storage", "en", (v): v is "en" | "ur" => v === "en" || v === "ur");
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => { throw new Error("blocked"); });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("blocked"); });
  expect(store.getSnapshot()).toBe("en"); store.set("ur"); expect(store.getSnapshot()).toBe("ur");
});
test("quota errors override a previously stored preference for this tab", () => {
  localStorage.setItem("test-quota", "en");
  const store = createBrowserPreference("test-quota", "en", (v): v is "en" | "ur" => v === "en" || v === "ur");
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new DOMException("quota", "QuotaExceededError"); });
  store.set("ur"); expect(store.getSnapshot()).toBe("ur");
});
