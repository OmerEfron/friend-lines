import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import { Surface, Searchbar, List, Avatar, useTheme, IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { useData } from '../context/DataContext';
import { User } from '../types';
import { searchUsers } from '../services/api';

export default function AddFriendScreen() {
  const theme = useTheme();
  const { friendships, currentUser, addFriend } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const friendIds = useMemo(() => {
    return friendships
      .filter(f => f.userId === currentUser.id)
      .map(f => f.friendId);
  }, [friendships, currentUser.id]);

  const availableUsers = useMemo(() => {
    return searchResults.filter(u => 
      u.id !== currentUser.id && !friendIds.includes(u.id)
    );
  }, [searchResults, currentUser.id, friendIds]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAddFriend = (userId: string) => {
    addFriend(userId);
  };

  const renderUser = ({ item }: { item: User }) => (
    <List.Item
      title={item.name}
      description={`@${item.username}`}
      left={() => (
        <Avatar.Text
          size={40}
          label={getInitials(item.name)}
          style={{ backgroundColor: theme.colors.primaryContainer }}
        />
      )}
      right={() => (
        <IconButton
          icon="account-plus"
          size={24}
          onPress={() => handleAddFriend(item.id)}
          iconColor={theme.colors.primary}
        />
      )}
      style={styles.listItem}
    />
  );

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          {searchQuery ? 'No users found' : 'Start typing to search for users'}
        </Text>
        <Text variant="bodySmall" style={styles.emptySubtext}>
          {searchQuery ? 'Try a different search term' : 'Search by name or username'}
        </Text>
      </View>
    );
  };

  return (
    <Surface style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search by name or username..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      <FlatList
        data={availableUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          availableUsers.length === 0 && styles.emptyList
        ]}
        style={{ backgroundColor: theme.colors.background }}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 8,
  },
  searchbar: {
    elevation: 2,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 4,
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


