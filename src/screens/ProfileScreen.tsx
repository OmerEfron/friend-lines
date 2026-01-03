import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, useTheme, Switch, List, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import FeedList from '../components/FeedList';
import { useData } from '../context/DataContext';
import { useAppTheme } from '../context/ThemeContext';
import { useBookmarks } from '../context/BookmarksContext';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { isDark, toggleTheme } = useAppTheme();
  const { newsflashes, currentUser, friends } = useData();
  const { bookmarkedIds } = useBookmarks();
  const { logout } = useAuth();
  const [pendingRequestsCount, setPendingRequestsCount] = React.useState(0);
  
  const userNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [newsflashes, currentUser.id]);

  const friendsCount = friends.length;

  // Load pending requests count
  React.useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const response = await fetch(
          `${require('../config/api').apiConfig.baseUrl}/friend-requests/received`,
          {
            headers: {
              Authorization: `Bearer ${await require('../services/auth').getToken()}`,
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPendingRequestsCount(data.requests?.length || 0);
        }
      } catch (error) {
        console.error('Failed to load pending requests count:', error);
      }
    };

    const unsubscribe = navigation.addListener('focus', () => {
      loadPendingCount();
    });

    loadPendingCount();

    return unsubscribe;
  }, [navigation]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Surface style={styles.container}>
      <Surface style={styles.header} elevation={1}>
        <View style={styles.headerContent}>
          <Avatar.Text 
            size={64} 
            label={getInitials(currentUser.name)}
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.userInfo}>
            <Text variant="headlineMedium" style={styles.name}>
              {currentUser.name}
            </Text>
            <Text variant="bodyMedium" style={styles.username}>
              @{currentUser.username}
            </Text>
            <Text variant="labelSmall" style={styles.newsCount}>
              {userNewsflashes.length} newsflashes
            </Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Saved Items"
          description={`${bookmarkedIds.length} bookmarked`}
          left={() => (
            <MaterialCommunityIcons 
              name="bookmark" 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => navigation.navigate('Saved' as never)}
          style={styles.listItem}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Friend Requests"
          description={
            pendingRequestsCount > 0
              ? `${pendingRequestsCount} pending request${pendingRequestsCount !== 1 ? 's' : ''}`
              : 'No pending requests'
          }
          left={() => (
            <MaterialCommunityIcons 
              name="account-clock" 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <View style={styles.rightContainer}>
              {pendingRequestsCount > 0 && (
                <View style={[styles.badge, { backgroundColor: theme.colors.error }]}>
                  <Text style={styles.badgeText}>{pendingRequestsCount}</Text>
                </View>
              )}
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.onSurfaceVariant}
              />
            </View>
          )}
          onPress={() => navigation.navigate('FriendRequests' as never)}
          style={styles.listItem}
        />
        
        <List.Item
          title="My Friends"
          description={`${friendsCount} friends`}
          left={() => (
            <MaterialCommunityIcons 
              name="account-multiple" 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => navigation.navigate('FriendsList' as never)}
          style={styles.listItem}
        />
        
        <List.Item
          title="Add Friend"
          description="Search for new friends"
          left={() => (
            <MaterialCommunityIcons 
              name="account-plus" 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => navigation.navigate('AddFriend' as never)}
          style={styles.listItem}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Edit Profile"
          description="Update your information"
          left={() => (
            <MaterialCommunityIcons 
              name="account-edit" 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={24} 
              color={theme.colors.onSurfaceVariant}
            />
          )}
          onPress={() => navigation.navigate('EditProfile' as never)}
          style={styles.listItem}
        />
        
        <List.Item
          title="Dark Mode"
          description={isDark ? 'Enabled' : 'Disabled'}
          left={() => (
            <MaterialCommunityIcons 
              name={isDark ? 'weather-night' : 'weather-sunny'} 
              size={24} 
              color={theme.colors.primary}
              style={styles.themeIcon}
            />
          )}
          right={() => (
            <Switch 
              value={isDark} 
              onValueChange={toggleTheme}
              color={theme.colors.primary}
            />
          )}
          style={styles.themeToggle}
        />
        
        <Divider style={styles.divider} />
        
        <List.Item
          title="Logout"
          description="Sign out of your account"
          left={() => (
            <MaterialCommunityIcons 
              name="logout" 
              size={24} 
              color={theme.colors.error}
              style={styles.themeIcon}
            />
          )}
          onPress={logout}
          style={styles.listItem}
        />
      </Surface>
      <FeedList newsflashes={userNewsflashes} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontWeight: 'bold',
  },
  username: {
    opacity: 0.7,
    marginTop: 2,
  },
  newsCount: {
    opacity: 0.5,
    marginTop: 4,
  },
  divider: {
    marginVertical: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  themeToggle: {
    paddingVertical: 4,
  },
  themeIcon: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

