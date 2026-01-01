import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import MainFeedScreen from '../screens/MainFeedScreen';
import GroupsScreen from '../screens/GroupsScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={MainFeedScreen}
        options={{ title: 'Friendlines' }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  );
}

