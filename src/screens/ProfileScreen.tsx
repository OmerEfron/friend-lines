import React, { useMemo } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import FeedList from '../components/FeedList';
import { newsflashes, users, currentUser } from '../data/mock';

export default function ProfileScreen() {
  const userNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => n.userId === currentUser.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{currentUser.name}</Text>
        <Text style={styles.username}>@{currentUser.username}</Text>
      </View>
      <FeedList newsflashes={userNewsflashes} users={users} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});

