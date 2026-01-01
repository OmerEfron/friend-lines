import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { newsflashes, users, friendships, currentUser } from '../data/mock';

export default function MainFeedScreen() {
  const friendIds = useMemo(() => {
    return friendships
      .filter(f => f.userId === currentUser.id)
      .map(f => f.friendId);
  }, []);

  const friendNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => friendIds.includes(n.userId))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [friendIds]);

  return (
    <Surface style={styles.container}>
      <FeedList newsflashes={friendNewsflashes} users={users} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

