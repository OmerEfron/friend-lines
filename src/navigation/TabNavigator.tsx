import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from 'react-native-paper';
import MainFeedScreen from '../screens/MainFeedScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupFeedScreen from '../screens/GroupFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedScreen from '../screens/SavedScreen';
import CreateNewsflashScreen from '../screens/CreateNewsflashScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';

const Tab = createBottomTabNavigator();
const GroupStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();
const RootStack = createNativeStackNavigator();

function GroupsStackScreen() {
  const theme = useTheme();
  
  return (
    <GroupStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
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

function ProfileStackScreen() {
  const theme = useTheme();
  
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <ProfileStack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <ProfileStack.Screen 
        name="Saved" 
        component={SavedScreen}
        options={{ title: 'Saved Items' }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 8,
          backgroundColor: theme.colors.surface,
          borderRadius: 20,
          height: 65,
          paddingBottom: 0,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.3,
          shadowRadius: 8,
        },
        tabBarIcon: ({ focused, color }) => {
          let iconName: string = 'newspaper';
          const iconSize = focused ? 28 : 24;

          if (route.name === 'Feed') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'account-group' : 'account-group-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account' : 'account-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
      })}
    >
      <Tab.Screen 
        name="Feed" 
        component={MainFeedScreen}
        options={{ 
          headerShown: true,
          title: 'Friendlines',
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsStackScreen}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
      />
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  const theme = useTheme();
  
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.primary,
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="CreateNewsflash"
        component={CreateNewsflashScreen}
        options={{
          presentation: 'modal',
          title: 'New Newsflash',
        }}
      />
      <RootStack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          presentation: 'modal',
          title: 'New Group',
        }}
      />
    </RootStack.Navigator>
  );
}

