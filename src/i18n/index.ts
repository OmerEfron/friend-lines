import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'intl-pluralrules';

import en from './locales/en.json';
import es from './locales/es.json';
import he from './locales/he.json';

export const LANGUAGE_STORAGE_KEY = '@app_language';

export const SUPPORTED_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', isRTL: false },
  es: { name: 'Spanish', nativeName: 'Español', isRTL: false },
  he: { name: 'Hebrew', nativeName: 'עברית', isRTL: true },
} as const;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const RTL_LANGUAGES: SupportedLanguage[] = ['he'];

export const isRTLLanguage = (lang: string): boolean => {
  return RTL_LANGUAGES.includes(lang as SupportedLanguage);
};

const resources = {
  en: { translation: en },
  es: { translation: es },
  he: { translation: he },
};

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0]?.languageCode || 'en';
  return locale in SUPPORTED_LANGUAGES ? (locale as SupportedLanguage) : 'en';
};

// Initialize i18n synchronously with default language
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
  },
});

// Load saved language preference asynchronously
export const initI18n = async (): Promise<SupportedLanguage> => {
  const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage && savedLanguage in SUPPORTED_LANGUAGES) {
    await i18n.changeLanguage(savedLanguage);
    return savedLanguage as SupportedLanguage;
  }
  return getDeviceLanguage();
};

export const changeLanguage = async (lang: SupportedLanguage): Promise<void> => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;

