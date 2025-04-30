import React, { createContext, useState, useEffect } from 'react';

type LanguageContextType = {
  language: string;
  direction: 'rtl' | 'ltr';
  toggleLanguage: () => void;
  setLanguage: (lang: string) => void;
};

const defaultLanguageContext: LanguageContextType = {
  language: 'ar',
  direction: 'rtl',
  toggleLanguage: () => {},
  setLanguage: () => {},
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
  
  return (
    <LanguageContext.Provider value={{ language, direction, toggleLanguage, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
