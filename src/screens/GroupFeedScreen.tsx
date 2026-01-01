import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <FeedList newsflashes={groupNewsflashes} users={users} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

