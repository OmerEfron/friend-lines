import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { DefaultTheme as NavigationDefaultTheme, DarkTheme as NavigationDarkTheme } from '@react-navigation/native';

const redColors = {
  primary: '#D32F2F',
  primaryContainer: '#FFEBEE',
  secondary: '#B71C1C',
  secondaryContainer: '#FFCDD2',
  tertiary: '#C62828',
  tertiaryContainer: '#EF9A9A',
  error: '#BA1A1A',
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

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#FFB4AB',
    primaryContainer: '#930006',
    secondary: '#FFB4AB',
    secondaryContainer: '#8C0009',
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
    primary: '#FFB4AB',
    background: '#1C1B1F',
  },
};

