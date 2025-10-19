
'use client';

import React, { createContext, useState, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import en from '@/locales/en.json';
import te from '@/locales/te.json';

const translations = { en, te };

type Language = 'en' | 'te';

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: typeof en; // Assuming 'en' has the full structure
};

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useLocalStorage<Language>('language', 'en');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentTranslations = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const value = useMemo(() => ({
    language,
    setLanguage,
    translations: currentTranslations,
  }), [language, setLanguage, currentTranslations]);

  if (!isMounted) {
    // Prevent hydration mismatch by rendering nothing on the server.
    // The client will render the correct language from localStorage.
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
