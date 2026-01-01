import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { DataProvider } from './src/context/DataContext';
import { BookmarksProvider } from './src/context/BookmarksContext';

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
  // Set useApi to true to enable backend integration
  // Make sure the backend is running at http://localhost:3000
  const USE_API = false; // Change to true when backend is ready
  
  return (
    <ThemeProvider>
      <DataProvider useApi={USE_API}>
        <BookmarksProvider>
          <AppContent />
        </BookmarksProvider>
      </DataProvider>
    </ThemeProvider>
  );
}
