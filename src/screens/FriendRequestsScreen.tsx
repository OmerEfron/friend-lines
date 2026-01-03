import React, { useState, useEffect } from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
  Surface,
  List,
  Avatar,
  useTheme,
  IconButton,
  Text,
  SegmentedButtons,
  ActivityIndicator,
  Button,
} from 'react-native-paper';
import { apiCall } from '../config/api';
import { useData } from '../context/DataContext';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

interface FriendRequest {
  userId: string;
  friendId: string;
  status: string;
  initiatorId: string;
  createdAt: string;
  user?: User;
}

export default function FriendRequestsScreen() {
  const theme = useTheme();
  const { refreshFriends, refreshNewsflashes } = useData();
  const [tab, setTab] = useState('received');
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const [received, sent] = await Promise.all([
        apiCall<{ requests: FriendRequest[] }>('/friend-requests/received'),
        apiCall<{ requests: FriendRequest[] }>('/friend-requests/sent'),
      ]);
      setReceivedRequests(received.requests);
      setSentRequests(sent.requests);
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await apiCall(`/friend-requests/${requestId}/accept`, {
        method: 'PUT',
      });
      // Reload requests and refresh global data
      await loadRequests();
      await Promise.all([refreshFriends(), refreshNewsflashes()]);
    } catch (error) {
      console.error('Failed to accept request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setActionLoading(requestId);
      await apiCall(`/friend-requests/${requestId}/reject`, {
        method: 'PUT',
      });
      // Reload requests
      await loadRequests();
    } catch (error) {
      console.error('Failed to reject request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const renderReceivedRequest = ({ item }: { item: FriendRequest }) => {
    if (!item.user) return null;

    const requestId = `${item.userId}_${item.friendId}`;
    const isProcessing = actionLoading === requestId;

    return (
      <List.Item
        title={item.user.name}
        description={`@${item.user.username} • ${formatDate(item.createdAt)}`}
        left={() =>
          item.user?.avatar ? (
            <Avatar.Image
              size={48}
              source={{ uri: item.user.avatar }}
            />
          ) : (
            <Avatar.Text
              size={48}
              label={getInitials(item.user?.name || '')}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )
        }
        right={() => (
          <View style={styles.actionsContainer}>
            <Button
              mode="contained"
              onPress={() => handleAccept(requestId)}
              disabled={isProcessing}
              loading={isProcessing}
              style={styles.acceptButton}
            >
              Accept
            </Button>
            <Button
              mode="outlined"
              onPress={() => handleReject(requestId)}
              disabled={isProcessing}
              style={styles.rejectButton}
            >
              Reject
            </Button>
          </View>
        )}
        style={styles.listItem}
      />
    );
  };

  const renderSentRequest = ({ item }: { item: FriendRequest }) => {
    if (!item.user) return null;

    return (
      <List.Item
        title={item.user.name}
        description={`@${item.user.username} • Sent ${formatDate(item.createdAt)}`}
        left={() =>
          item.user?.avatar ? (
            <Avatar.Image
              size={48}
              source={{ uri: item.user.avatar }}
            />
          ) : (
            <Avatar.Text
              size={48}
              label={getInitials(item.user?.name || '')}
              style={{ backgroundColor: theme.colors.primaryContainer }}
            />
          )
        }
        right={() => (
          <Text variant="labelSmall" style={styles.pendingText}>
            Pending
          </Text>
        )}
        style={styles.listItem}
      />
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        {tab === 'received'
          ? 'No friend requests'
          : 'No pending requests sent'}
      </Text>
      <Text variant="bodySmall" style={styles.emptySubtext}>
        {tab === 'received'
          ? 'Friend requests will appear here'
          : 'Requests you send will appear here'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <Surface style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  const currentRequests = tab === 'received' ? receivedRequests : sentRequests;

  return (
    <Surface style={styles.container}>
      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={tab}
          onValueChange={setTab}
          buttons={[
            {
              value: 'received',
              label: `Received (${receivedRequests.length})`,
            },
            {
              value: 'sent',
              label: `Sent (${sentRequests.length})`,
            },
          ]}
          style={styles.segmentedButtons}
        />
      </View>

      <FlatList
        data={currentRequests}
        keyExtractor={(item) => `${item.userId}_${item.friendId}`}
        renderItem={tab === 'received' ? renderReceivedRequest : renderSentRequest}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          currentRequests.length === 0 && styles.emptyList,
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabContainer: {
    padding: 12,
    paddingBottom: 8,
  },
  segmentedButtons: {
    marginHorizontal: 0,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyList: {
    flex: 1,
  },
  listItem: {
    paddingVertical: 8,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  acceptButton: {
    minWidth: 80,
  },
  rejectButton: {
    minWidth: 80,
  },
  pendingText: {
    opacity: 0.6,
    alignSelf: 'center',
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



