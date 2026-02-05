import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'intl-pluralrules';
import { missingKeyHandler, generatePseudoLocale } from './devUtils';

// English namespaces
import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enFeed from './locales/en/feed.json';
import enNewsflash from './locales/en/newsflash.json';
import enGroups from './locales/en/groups.json';
import enProfile from './locales/en/profile.json';
import enFriends from './locales/en/friends.json';
import enSaved from './locales/en/saved.json';
import enNav from './locales/en/nav.json';
import enA11y from './locales/en/a11y.json';
import enErrors from './locales/en/errors.json';
import enCreation from './locales/en/creation.json';

// Spanish namespaces
import esCommon from './locales/es/common.json';
import esAuth from './locales/es/auth.json';
import esFeed from './locales/es/feed.json';
import esNewsflash from './locales/es/newsflash.json';
import esGroups from './locales/es/groups.json';
import esProfile from './locales/es/profile.json';
import esFriends from './locales/es/friends.json';
import esSaved from './locales/es/saved.json';
import esNav from './locales/es/nav.json';
import esA11y from './locales/es/a11y.json';
import esErrors from './locales/es/errors.json';
import esCreation from './locales/es/creation.json';

// Hebrew namespaces
import heCommon from './locales/he/common.json';
import heAuth from './locales/he/auth.json';
import heFeed from './locales/he/feed.json';
import heNewsflash from './locales/he/newsflash.json';
import heGroups from './locales/he/groups.json';
import heProfile from './locales/he/profile.json';
import heFriends from './locales/he/friends.json';
import heSaved from './locales/he/saved.json';
import heNav from './locales/he/nav.json';
import heA11y from './locales/he/a11y.json';
import heErrors from './locales/he/errors.json';
import heCreation from './locales/he/creation.json';

export const LANGUAGE_STORAGE_KEY = '@app_language';

// Base supported languages
const BASE_LANGUAGES = {
  en: { name: 'English', nativeName: 'English', isRTL: false },
  es: { name: 'Spanish', nativeName: 'Español', isRTL: false },
  he: { name: 'Hebrew', nativeName: 'עברית', isRTL: true },
} as const;

// Add pseudo-locale for QA testing in development mode
export const SUPPORTED_LANGUAGES = __DEV__
  ? {
      ...BASE_LANGUAGES,
      pseudo: { name: 'Pseudo (QA)', nativeName: '[Psëüdö]', isRTL: false },
    }
  : BASE_LANGUAGES;

export type SupportedLanguage = keyof typeof SUPPORTED_LANGUAGES;

export const RTL_LANGUAGES: SupportedLanguage[] = ['he'];

export const isRTLLanguage = (lang: string): boolean => {
  return RTL_LANGUAGES.includes(lang as SupportedLanguage);
};

// Namespace list for reference
export const NAMESPACES = [
  'common',
  'auth',
  'feed',
  'newsflash',
  'groups',
  'profile',
  'friends',
  'saved',
  'nav',
  'a11y',
  'errors',
  'creation',
] as const;

export type Namespace = (typeof NAMESPACES)[number];

// English resources (used as base for pseudo-locale)
const enResources = {
  common: enCommon,
  auth: enAuth,
  feed: enFeed,
  newsflash: enNewsflash,
  groups: enGroups,
  profile: enProfile,
  friends: enFriends,
  saved: enSaved,
  nav: enNav,
  a11y: enA11y,
  errors: enErrors,
  creation: enCreation,
};

// Base resources for all environments
const baseResources = {
  en: enResources,
  es: {
    common: esCommon,
    auth: esAuth,
    feed: esFeed,
    newsflash: esNewsflash,
    groups: esGroups,
    profile: esProfile,
    friends: esFriends,
    saved: esSaved,
    nav: esNav,
    a11y: esA11y,
    errors: esErrors,
    creation: esCreation,
  },
  he: {
    common: heCommon,
    auth: heAuth,
    feed: heFeed,
    newsflash: heNewsflash,
    groups: heGroups,
    profile: heProfile,
    friends: heFriends,
    saved: heSaved,
    nav: heNav,
    a11y: heA11y,
    errors: heErrors,
    creation: heCreation,
  },
};

// Add pseudo-locale resources in development mode
const resources = __DEV__
  ? {
      ...baseResources,
      pseudo: generatePseudoLocale(enResources) as typeof enResources,
    }
  : baseResources;

const getDeviceLanguage = (): SupportedLanguage => {
  const locale = Localization.getLocales()[0]?.languageCode || 'en';
  return locale in SUPPORTED_LANGUAGES ? (locale as SupportedLanguage) : 'en';
};

// Initialize i18n synchronously with default language
i18n.use(initReactI18next).init({
  resources,
  lng: getDeviceLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  ns: NAMESPACES,
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added removed',
  },
  // Development: warn on missing keys
  saveMissing: __DEV__,
  missingKeyHandler: __DEV__ ? missingKeyHandler : undefined,
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
