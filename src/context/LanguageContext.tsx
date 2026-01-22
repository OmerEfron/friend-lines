import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { I18nManager, Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Updates from 'expo-updates';
import i18n, {
  initI18n,
  changeLanguage as i18nChangeLanguage,
  isRTLLanguage,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../i18n';

interface LanguageContextType {
  currentLanguage: SupportedLanguage;
  isRTL: boolean;
  isInitialized: boolean;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Helper to get valid language from i18n
const getValidLanguage = (): SupportedLanguage => {
  const rawLang = i18n.language || 'en';
  const langCode = rawLang.split('-')[0];
  return (langCode in SUPPORTED_LANGUAGES ? langCode : 'en') as SupportedLanguage;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const { i18n: i18nInstance } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(getValidLanguage);
  const [isRTL, setIsRTL] = useState(I18nManager.isRTL);

  // Load saved language preference on mount and apply RTL if needed
  useEffect(() => {
    const init = async () => {
      const lang = await initI18n();
      const shouldBeRTL = isRTLLanguage(lang);
      
      // Force RTL on startup if language requires it
      if (shouldBeRTL !== I18nManager.isRTL && Platform.OS !== 'web') {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
        // Need to reload for RTL to take effect
        try {
          await Updates.reloadAsync();
        } catch {
          // In dev mode, Updates.reloadAsync() won't work
          // User needs to manually restart
        }
      }
      
      setCurrentLanguage(lang);
      setIsRTL(shouldBeRTL);
      setIsInitialized(true);
    };
    init();
  }, []);

  // Listen for language changes from i18n
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const lang = getValidLanguage();
      setCurrentLanguage(lang);
      setIsRTL(isRTLLanguage(lang));
    };

    i18nInstance.on('languageChanged', handleLanguageChange);
    return () => {
      i18nInstance.off('languageChanged', handleLanguageChange);
    };
  }, [i18nInstance]);

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    const newIsRTL = isRTLLanguage(lang);
    const currentIsRTL = isRTLLanguage(currentLanguage);
    const needsRTLChange = newIsRTL !== currentIsRTL;

    await i18nChangeLanguage(lang);
    setCurrentLanguage(lang);
    setIsRTL(newIsRTL);

    if (needsRTLChange && Platform.OS !== 'web') {
      I18nManager.allowRTL(newIsRTL);
      I18nManager.forceRTL(newIsRTL);

      // Automatically restart the app to apply RTL changes
      try {
        await Updates.reloadAsync();
      } catch {
        // In dev mode, Updates.reloadAsync() won't work
        Alert.alert(
          'Restart Required',
          'Please close and reopen the app to apply layout changes.'
        );
      }
    }
  }, [currentLanguage]);

  const value: LanguageContextType = {
    currentLanguage,
    isRTL,
    isInitialized,
    changeLanguage,
    supportedLanguages: SUPPORTED_LANGUAGES,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

