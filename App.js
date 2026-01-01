import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider, ActivityIndicator, Surface } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { DataProvider } from './src/context/DataContext';
import { BookmarksProvider } from './src/context/BookmarksContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

function AuthenticatedApp() {
  const { paperTheme, navigationTheme } = useAppTheme();
  const { isAuthenticated, loading, login, register } = useAuth();
  const [showSignup, setShowSignup] = useState(false);

  if (loading) {
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

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <TabNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  // Set useApi to true to enable backend integration
  const USE_API = true;
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider useApi={USE_API}>
          <BookmarksProvider>
            <AuthenticatedApp />
          </BookmarksProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
