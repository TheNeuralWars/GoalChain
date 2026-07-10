import { createContext, useContext, useState, useEffect } from "react";
import TRANSLATIONS from "./i18n_reference";

type Language = "en" | "es";
type I18nContextType = {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
};

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem("goalworld-i18n-lang") as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("goalworld-i18n-lang", lang);
  }, [lang]);

  const toggleLang = () => {
    setLang((prev: Language) => (prev === "en" ? "es" : "en"));
  };

  const t = (key: string): string => {
    const langDict: Record<string, string> = TRANSLATIONS[lang];
    return langDict[key] || TRANSLATIONS.en[key] || key;
  };

  return (
    <I18nContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within an I18nProvider");
  return context;
};

export { TRANSLATIONS };