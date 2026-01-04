import React, { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, ActivityIndicator } from 'react-native-paper';
import FeedList from '../components/FeedList';
import { Newsflash } from '../types';
import { fetchBookmarks } from '../services/api';

export default function SavedScreen() {
  const [savedNewsflashes, setSavedNewsflashes] = useState<Newsflash[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const bookmarks = await fetchBookmarks();
      setSavedNewsflashes(bookmarks);
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookmarks();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <Surface style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" />
      </Surface>
    );
  }

  return (
    <Surface style={styles.container}>
      <FeedList 
        newsflashes={savedNewsflashes}
        refreshing={refreshing}
        onRefresh={handleRefresh}
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
});

