import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface, ActivityIndicator, Text } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { useData } from '../context/DataContext';
import { Group, Newsflash } from '../types';
import { fetchGroupFeed } from '../services/api';

interface GroupFeedScreenProps {
  route: {
    params: {
      group: Group;
    };
  };
}

export default function GroupFeedScreen({ route }: GroupFeedScreenProps) {
  const { group } = route.params;
  const { users } = useData();
  const [newsflashes, setNewsflashes] = useState<Newsflash[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGroupFeed = async () => {
      try {
        setLoading(true);
        setError(null);
        const { newsflashes: feedData } = await fetchGroupFeed(group.id);
        setNewsflashes(feedData);
      } catch (err) {
        console.error('Failed to load group feed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadGroupFeed();
  }, [group.id]);

  if (loading) {
    return (
      <Surface style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  if (error) {
    return (
      <Surface style={[styles.container, styles.center]}>
        <Text>Error: {error}</Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <FeedList newsflashes={newsflashes} users={users} />
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
});

