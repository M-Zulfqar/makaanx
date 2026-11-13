"use client";

import { createContext, useContext, useSyncExternalStore, useEffect, type ReactNode } from "react";
import { translations, type Language, type TranslationKeys } from "./translations";

import { createBrowserPreference } from "@/lib/browser-preference";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const preference = createBrowserPreference<Language>(
  "makaanx-language", "en", (value): value is Language => value === "en" || value === "ur",
);

export function I18nProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(preference.subscribe, preference.getSnapshot, preference.getServerSnapshot);
  const setLanguage = preference.set;
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ur" ? "rtl" : "ltr";
  }, [language]);

  const dir = language === "ur" ? "rtl" : "ltr";
  const isRtl = language === "ur";

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        t: translations[language],
        dir,
        isRtl,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}
