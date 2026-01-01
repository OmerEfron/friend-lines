import React from 'react';
import { FlatList, StyleSheet, View, Text } from 'react-native';
import { Newsflash, User } from '../types';
import NewsflashCard from './NewsflashCard';

interface FeedListProps {
  newsflashes: Newsflash[];
  users: User[];
}

export default function FeedList({ newsflashes, users }: FeedListProps) {
  const getUserById = (userId: string): User | undefined => {
    return users.find(u => u.id === userId);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No newsflashes yet</Text>
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
      contentContainerStyle={newsflashes.length === 0 && styles.emptyList}
    />
  );
}

const styles = StyleSheet.create({
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
    fontSize: 16,
    color: '#999',
  },
});

