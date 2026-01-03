import React from 'react';
import { StyleSheet, FlatList, View } from 'react-native';
import {
  Surface,
  List,
  Avatar,
  useTheme,
  IconButton,
  Text,
} from 'react-native-paper';
import { useData } from '../context/DataContext';
import { User } from '../types';

export default function FriendsListScreen() {
  const theme = useTheme();
  const { friends, removeFriend } = useData();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleRemoveFriend = (userId: string) => {
    removeFriend(userId);
  };

  const renderFriend = ({ item }: { item: User }) => (
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
          icon="account-remove"
          size={24}
          onPress={() => handleRemoveFriend(item.id)}
          iconColor={theme.colors.error}
        />
      )}
      style={styles.listItem}
    />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        No friends yet
      </Text>
      <Text variant="bodySmall" style={styles.emptySubtext}>
        Add friends to see them here
      </Text>
    </View>
  );

  return (
    <Surface style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item) => item.id}
        renderItem={renderFriend}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[
          styles.listContainer,
          friends.length === 0 && styles.emptyList,
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
