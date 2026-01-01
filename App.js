import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { PaperProvider } from 'react-native-paper';
import TabNavigator from './src/navigation/TabNavigator';
import { lightTheme, navigationLightTheme } from './src/theme';

export default function App() {
  return (
    <PaperProvider theme={lightTheme}>
      <NavigationContainer theme={navigationLightTheme}>
        <TabNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
