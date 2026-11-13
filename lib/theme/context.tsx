"use client";

import { createContext, useContext, useSyncExternalStore, useEffect, type ReactNode } from "react";

import { createBrowserPreference } from "@/lib/browser-preference";

export type Theme = "light" | "dark" | "realestate" | "midnight";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; icon: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const themes: { value: Theme; label: string; icon: string }[] = [
  { value: "light", label: "Light", icon: "sun" },
  { value: "dark", label: "Dark", icon: "moon" },
  { value: "realestate", label: "Real Estate", icon: "home" },
  { value: "midnight", label: "Midnight", icon: "stars" },
];

const preference = createBrowserPreference<Theme>(
  "makaanx-theme", "light",
  (value): value is Theme => themes.some(theme => theme.value === value),
  () => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
);

function subscribeTheme(listener: () => void) {
  const unsubscribe = preference.subscribe(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", listener);
  return () => { unsubscribe(); media.removeEventListener("change", listener); };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribeTheme, preference.getSnapshot, preference.getServerSnapshot);
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "theme-realestate", "theme-midnight");
    if (theme === "dark") root.classList.add("dark");
    if (theme === "realestate") root.classList.add("theme-realestate");
    if (theme === "midnight") root.classList.add("theme-midnight");
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme: preference.set, themes }}>
    {children}
  </ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
