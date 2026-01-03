import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme, ActivityIndicator } from 'react-native-paper';
import { Newsflash } from '../types';
import NewsflashCard from './NewsflashCard';

interface FeedListProps {
  newsflashes: Newsflash[];
  onEndReached?: () => void;
  loadingMore?: boolean;
}

export default function FeedList({
  newsflashes,
  onEndReached,
  loadingMore,
}: FeedListProps) {
  const theme = useTheme();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="bodyLarge" style={styles.emptyText}>
        No newsflashes yet
      </Text>
      <Text variant="bodySmall" style={styles.emptySubtext}>
        Check back later for updates
      </Text>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" />
      </View>
    );
  };

  return (
    <FlatList
      data={newsflashes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => {
        // Use embedded user data from API response
        if (!item.user) return null;
        return <NewsflashCard newsflash={item} user={item.user} />;
      }}
      ListEmptyComponent={renderEmpty}
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      contentContainerStyle={[
        styles.contentContainer,
        newsflashes.length === 0 && styles.emptyList,
      ]}
      style={{ backgroundColor: theme.colors.background }}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 8,
    paddingBottom: 110,
  },
  emptyList: {
    flex: 1,
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

