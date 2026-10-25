"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

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

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== "undefined") {
      localStorage.setItem("makaanx-theme", newTheme);
      
      // Remove all theme classes
      document.documentElement.classList.remove("dark", "theme-realestate", "theme-midnight");
      
      // Add appropriate classes
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (newTheme === "realestate") {
        document.documentElement.classList.add("theme-realestate");
      } else if (newTheme === "midnight") {
        document.documentElement.classList.add("theme-midnight");
      }
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem("makaanx-theme") as Theme | null;
    if (savedTheme && themes.some(t => t.value === savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        setTheme("dark");
      }
    }
  }, [setTheme]);

  // Prevent flash of incorrect theme
  if (!mounted) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
