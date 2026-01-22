import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { useData } from '../context/DataContext';

export default function UserFeedScreen() {
  const theme = useTheme();
  const { newsflashes, currentUser, refreshNewsflashes } = useData();
  const [refreshing, setRefreshing] = useState(false);

  const userNewsflashes = useMemo(() => {
    return newsflashes
      .filter((n) => n.userId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [newsflashes, currentUser.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshNewsflashes();
    setRefreshing(false);
  };

  return (
    <Surface style={styles.container}>
      <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
        <Text variant="titleMedium" style={styles.headerTitle}>
          Your Filed Reports
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {userNewsflashes.length} report{userNewsflashes.length !== 1 ? 's' : ''} on file
        </Text>
      </View>
      <FeedList
        newsflashes={userNewsflashes}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showActions={false}
      />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontWeight: '600',
  },
});

