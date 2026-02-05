/**
 * ListSkeleton - Skeleton placeholder for generic list items (friends, requests, etc.).
 * Shows a preview layout that will be animated as skeleton while loading.
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SkeletonWrapper } from './SkeletonWrapper';

interface ListSkeletonProps {
  /** Number of skeleton items to show */
  itemCount?: number;
  /** Whether to show the skeleton loading state */
  isLoading?: boolean;
  /** Whether items have action buttons (like friend requests) */
  hasActions?: boolean;
}

/**
 * Single list item placeholder that mimics List.Item structure
 */
function SkeletonItem({ hasActions }: { hasActions: boolean }) {
  const theme = useTheme();
  
  return (
    <View style={[styles.item, { borderBottomColor: theme.colors.outlineVariant }]}>
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceVariant }]} />
      
      {/* Text content */}
      <View style={styles.content}>
        <View style={[styles.title, { backgroundColor: theme.colors.surfaceVariant }]} />
        <View style={[styles.subtitle, { backgroundColor: theme.colors.surfaceVariant }]} />
      </View>
      
      {/* Actions (optional) */}
      {hasActions && (
        <View style={styles.actions}>
          <View style={[styles.button, { backgroundColor: theme.colors.surfaceVariant }]} />
          <View style={[styles.buttonSmall, { backgroundColor: theme.colors.surfaceVariant }]} />
        </View>
      )}
    </View>
  );
}

/**
 * Renders multiple skeleton items for list loading state
 */
export default function ListSkeleton({ 
  itemCount = 5, 
  isLoading = true,
  hasActions = false 
}: ListSkeletonProps) {
  return (
    <SkeletonWrapper isLoading={isLoading}>
      <View style={styles.container}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <SkeletonItem key={index} hasActions={hasActions} />
        ))}
      </View>
    </SkeletonWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: 6,
  },
  subtitle: {
    height: 12,
    width: '40%',
    borderRadius: 4,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    height: 32,
    width: 72,
    borderRadius: 16,
  },
  buttonSmall: {
    height: 32,
    width: 56,
    borderRadius: 16,
  },
});
