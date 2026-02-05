import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import MainFeedScreen from '../screens/MainFeedScreen';
import GroupsScreen from '../screens/GroupsScreen';
import GroupFeedScreen from '../screens/GroupFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SavedScreen from '../screens/SavedScreen';
import FriendsListScreen from '../screens/FriendsListScreen';
import AddFriendScreen from '../screens/AddFriendScreen';
import FriendRequestsScreen from '../screens/FriendRequestsScreen';
import UserFeedScreen from '../screens/UserFeedScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CreateNewsflashScreen from '../screens/CreateNewsflashScreen';
import CreateGroupScreen from '../screens/CreateGroupScreen';
import { Group } from '../types';
import { A11Y_LABELS, A11Y_HINTS } from '../utils/a11y';

// Type definitions for navigation
type GroupStackParamList = {
  GroupsList: undefined;
  GroupFeed: { group: Group };
};

type ProfileStackParamList = {
  ProfileMain: undefined;
  Saved: undefined;
  FriendsList: undefined;
  AddFriend: undefined;
  FriendRequests: undefined;
  UserFeed: undefined;
  EditProfile: undefined;
};

type RootStackParamList = {
  MainTabs: undefined;
  CreateNewsflash: undefined;
  CreateGroup: undefined;
};

type TabParamList = {
  Feed: undefined;
  Groups: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const GroupStack = createNativeStackNavigator<GroupStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();

function GroupsStackScreen() {
  const theme = useTheme();
  
  return (
    <GroupStack.Navigator
      id="GroupStack"
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
        options={({ route }) => ({ 
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
      id="ProfileStack"
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
      <ProfileStack.Screen 
        name="FriendsList" 
        component={FriendsListScreen}
        options={{ title: 'My Friends' }}
      />
      <ProfileStack.Screen 
        name="AddFriend" 
        component={AddFriendScreen}
        options={{ title: 'Add Friend' }}
      />
      <ProfileStack.Screen 
        name="FriendRequests" 
        component={FriendRequestsScreen}
        options={{ title: 'Friend Requests' }}
      />
      <ProfileStack.Screen 
        name="UserFeed" 
        component={UserFeedScreen}
        options={{ title: 'Filed Reports' }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: 'Update Press Pass' }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      id="MainTabs"
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
          tabBarAccessibilityLabel: A11Y_LABELS.TAB_HOME,
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsStackScreen}
        options={{
          tabBarAccessibilityLabel: A11Y_LABELS.TAB_GROUPS,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{
          tabBarAccessibilityLabel: A11Y_LABELS.TAB_PROFILE,
        }}
      />
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  const theme = useTheme();
  
  return (
    <RootStack.Navigator
      id="RootStack"
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

