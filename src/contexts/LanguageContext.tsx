import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SummaryLanguage } from "@/types";
import { translations, type TranslationKey } from "@/lib/i18n";

const STORAGE_KEY = "summarify-language";

function getInitialLanguage(): SummaryLanguage {
  if (typeof window === "undefined") return "es";
  return localStorage.getItem(STORAGE_KEY) === "en" ? "en" : "es";
}

interface LanguageContextValue {
  language: SummaryLanguage;
  setLanguage: (language: SummaryLanguage) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<SummaryLanguage>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let value = translations[language][key];
      if (vars) {
        for (const [name, replacement] of Object.entries(vars)) {
          value = value.replaceAll(`{${name}}`, String(replacement));
        }
      }
      return value;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage debe usarse dentro de <LanguageProvider>");
  return ctx;
}
