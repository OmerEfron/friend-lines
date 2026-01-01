import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainFeedScreen from '../screens/MainFeedScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupFeedScreen from '../screens/GroupFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();
const GroupStack = createNativeStackNavigator();

function GroupsStackScreen() {
  return (
    <GroupStack.Navigator>
      <GroupStack.Screen 
        name="GroupsList" 
        component={GroupsScreen}
        options={{ title: 'Groups' }}
      />
      <GroupStack.Screen 
        name="GroupFeed" 
        component={GroupFeedScreen}
        options={({ route }: any) => ({ 
          title: route.params?.group?.name || 'Group Feed' 
        })}
      />
    </GroupStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
      }}
    >
      <Tab.Screen 
        name="Feed" 
        component={MainFeedScreen}
        options={{ 
          headerShown: true,
          title: 'Friendlines' 
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsStackScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          headerShown: true,
          title: 'My Profile' 
        }}
      />
    </Tab.Navigator>
  );
}

