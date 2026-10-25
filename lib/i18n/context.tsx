"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { translations, type Language, type TranslationKeys } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  dir: "ltr" | "rtl";
  isRtl: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("makaanx-language", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ur" ? "rtl" : "ltr";
    }
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem("makaanx-language") as Language | null;
    if (savedLang && (savedLang === "en" || savedLang === "ur")) {
      setLanguage(savedLang);
    }
  }, [setLanguage]);

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
