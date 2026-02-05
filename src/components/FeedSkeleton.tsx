/**
 * FeedSkeleton - Skeleton placeholder for newsflash feed lists.
 * Shows a preview layout that will be animated as skeleton while loading.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SkeletonWrapper } from './SkeletonWrapper';

interface FeedSkeletonProps {
  /** Number of skeleton cards to show */
  itemCount?: number;
  /** Whether to show the skeleton loading state */
  isLoading?: boolean;
}

/**
 * Single card placeholder that mimics NewsflashCard structure
 */
function SkeletonCard() {
  const theme = useTheme();
  
  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}>
      {/* Header row: avatar + username + time */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]} />
        <View style={styles.headerText}>
          <View style={[styles.username, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.timestamp, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
      
      {/* Headline placeholder */}
      <View style={[styles.headline, { backgroundColor: theme.colors.surface }]} />
      <View style={[styles.headlineShort, { backgroundColor: theme.colors.surface }]} />
      
      {/* Subheadline placeholder */}
      <View style={[styles.subheadline, { backgroundColor: theme.colors.surface }]} />
    </View>
  );
}

/**
 * Renders multiple skeleton cards for feed loading state
 */
export default function FeedSkeleton({ itemCount = 4, isLoading = true }: FeedSkeletonProps) {
  return (
    <SkeletonWrapper isLoading={isLoading}>
      <View style={styles.container}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <SkeletonCard key={index} />
        ))}
      </View>
    </SkeletonWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  headerText: {
    marginLeft: 8,
    flex: 1,
  },
  username: {
    height: 12,
    width: 80,
    borderRadius: 4,
    marginBottom: 4,
  },
  timestamp: {
    height: 10,
    width: 50,
    borderRadius: 4,
  },
  headline: {
    height: 20,
    width: '100%',
    borderRadius: 4,
    marginBottom: 6,
  },
  headlineShort: {
    height: 20,
    width: '75%',
    borderRadius: 4,
    marginBottom: 8,
  },
  subheadline: {
    height: 14,
    width: '90%',
    borderRadius: 4,
  },
});
