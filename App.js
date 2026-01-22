import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, ActivityIndicator, Surface } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { I18nextProvider } from 'react-i18next';
import i18n from './src/i18n';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { DataProvider } from './src/context/DataContext';
import { BookmarksProvider } from './src/context/BookmarksContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { LanguageProvider, useLanguage } from './src/context/LanguageContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

function AuthenticatedApp() {
  const { paperTheme, navigationTheme } = useAppTheme();
  const { isAuthenticated, loading, login, register } = useAuth();
  const { isInitialized: languageInitialized } = useLanguage();
  const [showSignup, setShowSignup] = useState(false);

  if (loading || !languageInitialized) {
    return (
      <Surface style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  if (!isAuthenticated) {
    return (
      <PaperProvider theme={paperTheme}>
        {showSignup ? (
          <SignupScreen
            onSignup={register}
            onNavigateToLogin={() => setShowSignup(false)}
          />
        ) : (
          <LoginScreen
            onLogin={login}
            onNavigateToSignup={() => setShowSignup(true)}
          />
        )}
      </PaperProvider>
    );
  }

  // Only render DataProvider when authenticated
  return (
    <DataProvider>
      <BookmarksProvider>
        <PaperProvider theme={paperTheme}>
          <NavigationContainer theme={navigationTheme}>
            <TabNavigator />
          </NavigationContainer>
        </PaperProvider>
      </BookmarksProvider>
    </DataProvider>
  );
}

export default function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AuthenticatedApp />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
