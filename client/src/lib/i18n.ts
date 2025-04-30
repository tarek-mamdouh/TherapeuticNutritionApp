import { useLanguage } from '@/hooks/useLanguage';
import arTranslations from './translations/ar';
import enTranslations from './translations/en';

// Type for the translation object
type TranslationObject = {
  [key: string]: string | TranslationObject;
};

// Get a nested value from an object using a dot-separated path
function getNestedValue(obj: TranslationObject, path: string): string {
  const keys = path.split('.');
  let result: TranslationObject | string = obj;
  
  for (const key of keys) {
    if (typeof result === 'string' || result === undefined) {
      return path; // Return the path if we can't find the translation
    }
    
    result = result[key];
  }
  
  return typeof result === 'string' ? result : path;
}

// Replace template variables in a string
function replaceVariables(str: string, variables?: Record<string, any>): string {
  if (!variables) return str;
  
  return str.replace(/\{([^}]+)\}/g, (_, key) => {
    return variables[key] !== undefined ? String(variables[key]) : `{${key}}`;
  });
}

// Get translation based on current language
export function t(key: string, variables?: Record<string, any>): string {
  const language = typeof window !== 'undefined' ? localStorage.getItem('language') || 'ar' : 'ar';
  const translations = language === 'ar' ? arTranslations : enTranslations;
  
  const translatedString = getNestedValue(translations, key);
  return replaceVariables(translatedString, variables);
}

// Custom hook for using translations with the current language
export function useTranslation() {
  const { language } = useLanguage();
  
  const translate = (key: string, variables?: Record<string, any>): string => {
    const translations = language === 'ar' ? arTranslations : enTranslations;
    const translatedString = getNestedValue(translations, key);
    return replaceVariables(translatedString, variables);
  };
  
  return { t: translate };
}
