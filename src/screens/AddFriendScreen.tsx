import React, { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Surface, Searchbar, List, Avatar, useTheme, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useData } from '../context/DataContext';
import { User } from '../types';
import { searchUsers } from '../services/api';
import { apiCall } from '../config/api';
import { useNavigation } from '@react-navigation/native';
import ListSkeleton from '../components/ListSkeleton';

// Estimated height of a user search result item (avatar + name + button)
const ESTIMATED_ITEM_SIZE = 70;

interface FriendRequest {
  userId: string;
  friendId: string;
  status: string;
  initiatorId: string;
}

export default function AddFriendScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const { friends, currentUser, addFriend } = useData();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [allRequests, setAllRequests] = useState<FriendRequest[]>([]);

  // Load all friend requests to check status
  useEffect(() => {
    const loadRequests = async () => {
      try {
        const [received, sent] = await Promise.all([
          apiCall<{ requests: FriendRequest[] }>('/friend-requests/received'),
          apiCall<{ requests: FriendRequest[] }>('/friend-requests/sent'),
        ]);
        setAllRequests([...received.requests, ...sent.requests]);
      } catch (error) {
        console.error('Failed to load requests:', error);
      }
    };
    loadRequests();
  }, []);

  const friendIds = useMemo(() => {
    return friends.map(f => f.id);
  }, [friends]);

  const availableUsers = useMemo(() => {
    return searchResults.filter(u => u.id !== currentUser.id);
  }, [searchResults, currentUser.id]);

  const getRelationshipStatus = (userId: string) => {
    // Check if already friends
    if (friendIds.includes(userId)) {
      return 'friends';
    }

    // Check for pending requests
    const sentRequest = allRequests.find(
      r => r.initiatorId === currentUser.id && r.friendId === userId && r.status === 'pending'
    );
    if (sentRequest) {
      return 'request-sent';
    }

    const receivedRequest = allRequests.find(
      r => r.initiatorId === userId && r.friendId === currentUser.id && r.status === 'pending'
    );
    if (receivedRequest) {
      return 'request-received';
    }

    return 'none';
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await addFriend(userId);
      // Reload requests
      const [received, sent] = await Promise.all([
        apiCall<{ requests: FriendRequest[] }>('/friend-requests/received'),
        apiCall<{ requests: FriendRequest[] }>('/friend-requests/sent'),
      ]);
      setAllRequests([...received.requests, ...sent.requests]);
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

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

  const renderUser = ({ item }: { item: User }) => {
    const status = getRelationshipStatus(item.id);

    return (
      <List.Item
        title={item.name}
        description={`@${item.username}`}
        left={() =>
          item.avatar ? (
            <Avatar.Image size={48} source={{ uri: item.avatar }} />
          ) : (
            <Avatar.Text
              size={48}
              label={getInitials(item.name)}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )
        }
        right={() => {
          switch (status) {
            case 'friends':
              return (
                <Text variant="labelSmall" style={styles.statusText}>
                  Friends ✓
                </Text>
              );
            case 'request-sent':
              return (
                <Text variant="labelSmall" style={styles.statusText}>
                  Request Sent
                </Text>
              );
            case 'request-received':
              return (
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('FriendRequests' as never)}
                  compact
                >
                  Respond
                </Button>
              );
            default:
              return (
                <Button
                  mode="contained-tonal"
                  onPress={() => handleSendRequest(item.id)}
                  icon="account-plus"
                  compact
                >
                  Send Request
                </Button>
              );
          }
        }}
        style={styles.listItem}
      />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return <ListSkeleton itemCount={4} hasActions />;
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
      <FlashList
        data={availableUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          availableUsers.length === 0 && styles.emptyList
        ]}
        estimatedItemSize={ESTIMATED_ITEM_SIZE}
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
  statusText: {
    alignSelf: 'center',
    opacity: 0.7,
    marginRight: 8,
  },
});


