import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, navigationLightTheme, navigationDarkTheme } from '../theme';

const THEME_STORAGE_KEY = '@friendlines_theme_preference';

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  paperTheme: typeof lightTheme | typeof darkTheme;
  navigationTheme: typeof navigationLightTheme | typeof navigationDarkTheme;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      } else {
        // Default to dark theme
        setIsDark(true);
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setIsDark(true);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const paperTheme = isDark ? darkTheme : lightTheme;
  const navigationTheme = isDark ? navigationDarkTheme : navigationLightTheme;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider 
      value={{ 
        isDark, 
        toggleTheme, 
        paperTheme, 
        navigationTheme 
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}

