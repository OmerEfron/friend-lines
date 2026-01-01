import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';

function AppContent() {
  const { paperTheme, navigationTheme } = useAppTheme();
  
  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navigationTheme}>
        <TabNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
