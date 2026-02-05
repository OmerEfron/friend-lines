import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
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
import { useA11y } from '../utils/a11y';
import { TAB_BAR, SPACING } from '../theme/spacing';

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
  const { t } = useTranslation('nav');
  
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
        options={{ title: t('screens.groups') }}
      />
      <GroupStack.Screen 
        name="GroupFeed" 
        component={GroupFeedScreen}
        options={({ route }) => ({ 
          title: route.params?.group?.name || t('screens.groupFeed') 
        })}
      />
    </GroupStack.Navigator>
  );
}

function ProfileStackScreen() {
  const theme = useTheme();
  const { t } = useTranslation('nav');
  
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
        options={{ title: t('screens.myProfile') }}
      />
      <ProfileStack.Screen 
        name="Saved" 
        component={SavedScreen}
        options={{ title: t('screens.savedItems') }}
      />
      <ProfileStack.Screen 
        name="FriendsList" 
        component={FriendsListScreen}
        options={{ title: t('screens.myFriends') }}
      />
      <ProfileStack.Screen 
        name="AddFriend" 
        component={AddFriendScreen}
        options={{ title: t('screens.addFriend') }}
      />
      <ProfileStack.Screen 
        name="FriendRequests" 
        component={FriendRequestsScreen}
        options={{ title: t('screens.friendRequests') }}
      />
      <ProfileStack.Screen 
        name="UserFeed" 
        component={UserFeedScreen}
        options={{ title: t('screens.filedReports') }}
      />
      <ProfileStack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{ title: t('screens.updatePressPass') }}
      />
    </ProfileStack.Navigator>
  );
}

function MainTabNavigator() {
  const theme = useTheme();
  const { t } = useTranslation('nav');
  const { labels: a11yLabels } = useA11y();
  
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
          bottom: TAB_BAR.BOTTOM,
          left: TAB_BAR.HORIZONTAL_MARGIN,
          right: TAB_BAR.HORIZONTAL_MARGIN,
          elevation: SPACING.SM,
          backgroundColor: theme.colors.surface,
          borderRadius: TAB_BAR.RADIUS,
          height: TAB_BAR.HEIGHT,
          paddingBottom: 0,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: SPACING.XS,
          },
          shadowOpacity: 0.3,
          shadowRadius: SPACING.SM,
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
          title: t('screens.friendlines'),
          tabBarAccessibilityLabel: a11yLabels.TAB_HOME,
        }}
      />
      <Tab.Screen 
        name="Groups" 
        component={GroupsStackScreen}
        options={{
          tabBarAccessibilityLabel: a11yLabels.TAB_GROUPS,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackScreen}
        options={{
          tabBarAccessibilityLabel: a11yLabels.TAB_PROFILE,
        }}
      />
    </Tab.Navigator>
  );
}

export default function TabNavigator() {
  const theme = useTheme();
  const { t } = useTranslation('nav');
  
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
          title: t('screens.newNewsflash'),
        }}
      />
      <RootStack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          presentation: 'modal',
          title: t('screens.newGroup'),
        }}
      />
    </RootStack.Navigator>
  );
}

