import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

const supportedLanguages = ['en', 'pt', 'es'];

function detectBrowserLanguage(): string {
  // Check navigator.language (e.g., "pt-BR", "en-US", "es-ES")
  const browserLang = navigator.language || (navigator as { userLanguage?: string }).userLanguage || 'en';
  
  // Extract the base language code (e.g., "pt" from "pt-BR")
  const baseLang = browserLang.split('-')[0].toLowerCase();
  
  // Return if supported, otherwise fallback to English
  return supportedLanguages.includes(baseLang) ? baseLang : 'en';
}

// Use saved locale if exists, otherwise detect from browser
const savedLocale = localStorage.getItem('locale');
const initialLanguage = savedLocale || detectBrowserLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    pt: { translation: pt },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
