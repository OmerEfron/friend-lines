import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { newsflashes, users } from '../data/mock';
import { Group } from '../types';

interface GroupFeedScreenProps {
  route: {
    params: {
      group: Group;
    };
  };
}

export default function GroupFeedScreen({ route }: GroupFeedScreenProps) {
  const { group } = route.params;

  const groupNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => group.userIds.includes(n.userId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [group]);

  return (
    <Surface style={styles.container}>
      <FeedList newsflashes={groupNewsflashes} users={users} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

