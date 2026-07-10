import { createContext, useContext, useState, useEffect } from "react";
import i18nStrings from "./i18n_reference";

type Language = "en" | "es";
type I18nContextType = {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem("goalworld-i18n-lang") as Language;
    if (savedLang) setLang(savedLang);
  }, []);

  const toggleLang = () => {
    const newLang = lang === "en" ? "es" : "en";
    setLang(newLang);
    localStorage.setItem("goalworld-i18n-lang", newLang);
  };

  const t = (key: string) => {
    return i18nStrings[lang][key] || i18nStrings.es[key] || key;
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