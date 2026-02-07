import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

const redColors = {
  primary: '#D32F2F',
  primaryContainer: '#FFEBEE',
  secondary: '#B71C1C',
  secondaryContainer: '#FFCDD2',
  tertiary: '#C62828',
  tertiaryContainer: '#EF9A9A',
  error: '#D32F2F',
  errorContainer: '#FFDAD6',
  background: '#FAFAFA',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#410002',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#2D0001',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#3E0001',
  onError: '#FFFFFF',
  onErrorContainer: '#410002',
  onBackground: '#1C1B1F',
  onSurface: '#1C1B1F',
  onSurfaceVariant: '#49454F',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
  inverseSurface: '#313033',
  inverseOnSurface: '#F4EFF4',
  inversePrimary: '#FFB4AB',
};

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...redColors,
  },
};

const redDarkColors = {
  primary: '#E57373',
  primaryContainer: '#8E0000',
  secondary: '#FFAB91',
  secondaryContainer: '#BF360C',
  tertiary: '#EF9A9A',
  tertiaryContainer: '#C62828',
  error: '#CF6679',
  errorContainer: '#8C1D18',
  background: '#121212',
  surface: '#1E1E1E',
  surfaceVariant: '#2C2C2C',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#FFDAD6',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#FFDAD6',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#FFDAD6',
  onError: '#000000',
  onErrorContainer: '#FFDAD6',
  onBackground: '#E6E1E5',
  onSurface: '#E6E1E5',
  onSurfaceVariant: '#CAC4D0',
  outline: '#938F99',
  outlineVariant: '#49454F',
  inverseSurface: '#E6E1E5',
  inverseOnSurface: '#313033',
  inversePrimary: '#D32F2F',
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    ...redDarkColors,
  },
};

export const navigationLightTheme = {
  ...NavigationDefaultTheme,
  colors: {
    ...NavigationDefaultTheme.colors,
    primary: redColors.primary,
    background: redColors.background,
    card: redColors.surface,
    text: redColors.onSurface,
    border: redColors.outline,
  },
};

export const navigationDarkTheme = {
  ...NavigationDarkTheme,
  colors: {
    ...NavigationDarkTheme.colors,
    primary: redDarkColors.primary,
    background: redDarkColors.background,
    card: redDarkColors.surface,
    text: redDarkColors.onSurface,
    border: redDarkColors.outline,
  },
};

