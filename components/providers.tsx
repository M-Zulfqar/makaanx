"use client";

import { type ReactNode } from "react";
import { I18nProvider } from "@/lib/i18n/context";
import { ThemeProvider } from "@/lib/theme/context";
import { Toaster } from "@/components/ui/sonner";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <I18nProvider>
        {children}
        <Toaster position="top-right" richColors />
      </I18nProvider>
    </ThemeProvider>
  );
}
