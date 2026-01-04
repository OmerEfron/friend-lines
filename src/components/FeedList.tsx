import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, useTheme, ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Newsflash } from '../types';
import NewsflashCard from './NewsflashCard';

interface FeedListProps {
  newsflashes: Newsflash[];
  onEndReached?: () => void;
  loadingMore?: boolean;
  showActions?: boolean;
}

export default function FeedList({
  newsflashes,
  onEndReached,
  loadingMore,
  showActions = true,
}: FeedListProps) {
  const theme = useTheme();
  const navigation = useNavigation();

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text variant="headlineSmall" style={styles.emptyHeadline}>
        Slow News Day
      </Text>
      <Text variant="bodyMedium" style={styles.emptyText}>
        Nothing to report from your network.
      </Text>
      <Text variant="bodySmall" style={styles.emptySubtext}>
        Check back later or file a report yourself!
      </Text>
      {showActions && (
        <View style={styles.emptyActions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('CreateNewsflash' as never)}
            style={styles.actionButton}
          >
            File a Report
          </Button>
          <Button
            mode="outlined"
            icon="account-plus"
            onPress={() => navigation.navigate('AddFriend' as never)}
            style={styles.actionButton}
          >
            Find Correspondents
          </Button>
        </View>
      )}
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
  emptyHeadline: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    opacity: 0.6,
    marginBottom: 4,
  },
  emptySubtext: {
    opacity: 0.4,
  },
  emptyActions: {
    marginTop: 24,
    gap: 12,
  },
  actionButton: {
    minWidth: 180,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

