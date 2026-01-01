import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash, User } from '../types';
import NewsflashCard from './NewsflashCard';

interface FeedListProps {
  newsflashes: Newsflash[];
  users: User[];
}

export default function FeedList({ newsflashes, users }: FeedListProps) {
  const theme = useTheme();
  
  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        No newsflashes yet
      </Text>
      <Text variant="bodySmall" style={styles.emptySubtext}>
        Check back later for updates
      </Text>
    </View>
  );

  return (
    <FlatList
      data={newsflashes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        const user = getUserById(item.userId);
        if (!user) return null;
        return <NewsflashCard newsflash={item} user={user} />;
      }}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={[
        styles.contentContainer,
        newsflashes.length === 0 && styles.emptyList
      ]}
      style={{ backgroundColor: theme.colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 8,
    paddingBottom: 110,
  },
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.4,
  },
});

