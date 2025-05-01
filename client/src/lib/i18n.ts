import { useContext } from 'react';
import { LanguageContext } from '@/contexts/LanguageContext';
import arTranslations from './translations/ar';
import enTranslations from './translations/en';

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

const translations: Record<string, TranslationObject> = {
  ar: arTranslations,
  en: enTranslations,
};

function getNestedValue(obj: TranslationObject, path: string): string {
  const keys = path.split('.');
  let result: any = obj;

  for (const key of keys) {
    if (result && typeof result === 'object' && key in result) {
      result = result[key];
    } else {
      return path; // Return the path if key doesn't exist
    }
  }

  return typeof result === 'string' ? result : path;
}

function replaceVariables(str: string, variables?: Record<string, any>): string {
  if (!variables) return str;
  
  return str.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const value = variables[key];
    return value !== undefined ? String(value) : `{{${key}}}`;
  });
}

export function t(key: string, variables?: Record<string, any>): string {
  // Get the current language from localStorage
  const language = localStorage.getItem('language') || 'ar';
  const translationObj = translations[language] || translations.ar;
  
  // Get the translated string
  const translatedStr = getNestedValue(translationObj, key);
  
  // Replace variables if any
  return replaceVariables(translatedStr, variables);
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  
  return { t, language: context.language };
}