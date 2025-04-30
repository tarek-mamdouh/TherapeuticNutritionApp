import React, { createContext, useState, useEffect } from 'react';
import { t as translationFn } from '@/lib/i18n';

type LanguageContextType = {
  language: string;
  direction: 'rtl' | 'ltr';
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
  t: (key: string, variables?: Record<string, any>) => string;
};

const defaultLanguageContext: LanguageContextType = {
  language: 'ar',
  direction: 'rtl',
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key: string) => key,
};

export const LanguageContext = createContext<LanguageContextType>(defaultLanguageContext);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    return localStorage.getItem('language') || 'ar';
  });
  
  const [direction, setDirection] = useState<'rtl' | 'ltr'>(() => {
    return language === 'ar' ? 'rtl' : 'ltr';
  });
  
  useEffect(() => {
    setDirection(language === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('language', language);
  }, [language]);
  
  const toggleLanguage = () => {
    setLanguageState(prevLang => (prevLang === 'ar' ? 'en' : 'ar'));
  };
  
  const setLanguage = (lang: string) => {
    setLanguageState(lang);
  };
  
  // Create a translation function that wraps the imported one
  const t = (key: string, variables?: Record<string, any>): string => {
    return translationFn(key, variables);
  };
  
  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
