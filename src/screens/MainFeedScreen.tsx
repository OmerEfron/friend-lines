import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
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
    <View style={styles.container}>
      <FeedList newsflashes={friendNewsflashes} users={users} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

