import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, TranslationKey } from "@/lib/translations";

type LanguageContextType = {
    language: string;
    setLanguage: (lang: string) => void;
    t: (key: TranslationKey, params?: Record<string, string>) => string;
    dir: "ltr" | "rtl";
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    // Initialize from localStorage or default to 'en'
    const [language, setLanguageState] = useState<string>(() => {
        return localStorage.getItem("quantara-lang") || "en";
    });

    const [dir, setDir] = useState<"ltr" | "rtl">("ltr");

    useEffect(() => {
        localStorage.setItem("quantara-lang", language);
        document.documentElement.lang = language;
        // All current languages (en, hi, te, ta, kn) are LTR
        document.documentElement.dir = "ltr";
        setDir("ltr");
    }, [language]);

    const setLanguage = (lang: string) => {
        if (translations[lang]) {
            setLanguageState(lang);
        }
    };

    const t = (key: TranslationKey, params?: Record<string, string>): string => {
        const langData = translations[language] || translations["en"];
        let text = langData[key] || translations["en"][key] || key;

        // Replace parameters like {name}
        if (params) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                text = text.replace(`{${paramKey}}`, paramValue);
            });
        }

        return text;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}
