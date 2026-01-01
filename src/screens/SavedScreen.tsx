import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Surface } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { useData } from '../context/DataContext';
import { useBookmarks } from '../context/BookmarksContext';

export default function SavedScreen() {
  const { newsflashes, users } = useData();
  const { bookmarkedIds } = useBookmarks();

  const savedNewsflashes = useMemo(() => {
    return newsflashes
      .filter(n => bookmarkedIds.includes(n.id))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [newsflashes, bookmarkedIds]);

  return (
    <Surface style={styles.container}>
      <FeedList newsflashes={savedNewsflashes} users={users} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

