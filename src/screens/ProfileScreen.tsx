import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, Avatar, useTheme } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { newsflashes, users, currentUser } from '../data/mock';

export default function ProfileScreen() {
  const theme = useTheme();
  
  const userNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

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
      </Surface>
      <FeedList newsflashes={userNewsflashes} users={users} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
});

