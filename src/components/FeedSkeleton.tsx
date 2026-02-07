/**
 * FeedSkeleton - Skeleton placeholder for newsflash feed lists.
 * Mimics the News Magazine layout: Hero (first) + Standard (rest)
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { SkeletonWrapper } from './SkeletonWrapper';
import { SPACING } from '../theme/spacing';

interface FeedSkeletonProps {
  /** Number of skeleton cards to show */
  itemCount?: number;
  /** Whether to show the skeleton loading state */
  isLoading?: boolean;
}

/**
 * Hero card skeleton (first item) - Full-width image on top
 */
function HeroSkeletonCard() {
  const theme = useTheme();
  
  return (
    <View style={[styles.heroCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      {/* Large image placeholder */}
      <View style={[styles.heroImage, { backgroundColor: theme.colors.surface }]} />
      
      {/* Content area */}
      <View style={styles.heroContent}>
        {/* Headline placeholder */}
        <View style={[styles.heroHeadline, { backgroundColor: theme.colors.surface }]} />
        <View style={[styles.heroHeadlineShort, { backgroundColor: theme.colors.surface }]} />
        
        {/* Footer (time • reporter) */}
        <View style={styles.footer}>
          <View style={[styles.footerText, { backgroundColor: theme.colors.surface }]} />
        </View>
      </View>
    </View>
  );
}

/**
 * Standard card skeleton (subsequent items) - Side-by-side layout
 */
function StandardSkeletonCard() {
  const theme = useTheme();
  
  return (
    <View style={[styles.standardCard, { backgroundColor: theme.colors.surfaceVariant }]}>
      <View style={styles.rowContainer}>
        {/* Text container (left) */}
        <View style={styles.textContainer}>
          {/* Headline lines */}
          <View style={[styles.standardHeadline, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.standardHeadlineMid, { backgroundColor: theme.colors.surface }]} />
          <View style={[styles.standardHeadlineShort, { backgroundColor: theme.colors.surface }]} />
          
          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerTextSmall, { backgroundColor: theme.colors.surface }]} />
          </View>
        </View>
        
        {/* Image placeholder (right) */}
        <View style={[styles.standardImage, { backgroundColor: theme.colors.surface }]} />
      </View>
    </View>
  );
}

/**
 * Renders skeleton cards mimicking the News Magazine layout
 */
export default function FeedSkeleton({ itemCount = 4, isLoading = true }: FeedSkeletonProps) {
  return (
    <SkeletonWrapper isLoading={isLoading}>
      <View style={styles.container}>
        {/* First item: Hero skeleton */}
        <HeroSkeletonCard />
        
        {/* Remaining items: Standard skeletons */}
        {Array.from({ length: Math.max(0, itemCount - 1) }).map((_, index) => (
          <StandardSkeletonCard key={index} />
        ))}
      </View>
    </SkeletonWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: SPACING.SM,
  },
  
  // Hero Card Styles
  heroCard: {
    borderRadius: 12,
    marginBottom: SPACING.MD,
    overflow: 'hidden',
  },
  heroImage: {
    height: 180,
    width: '100%',
  },
  heroContent: {
    padding: SPACING.MD,
  },
  heroHeadline: {
    height: 24,
    width: '100%',
    borderRadius: 4,
    marginBottom: SPACING.XS,
  },
  heroHeadlineShort: {
    height: 24,
    width: '70%',
    borderRadius: 4,
    marginBottom: SPACING.SM,
  },
  
  // Standard Card Styles
  standardCard: {
    borderRadius: 8,
    marginBottom: SPACING.XS,
    overflow: 'hidden',
  },
  rowContainer: {
    flexDirection: 'row',
    padding: SPACING.SM,
    minHeight: 100,
  },
  textContainer: {
    flex: 1,
    paddingRight: SPACING.SM,
    justifyContent: 'space-between',
  },
  standardImage: {
    width: 100,
    height: 80,
    borderRadius: 6,
  },
  standardHeadline: {
    height: 16,
    width: '100%',
    borderRadius: 4,
    marginBottom: 4,
  },
  standardHeadlineMid: {
    height: 16,
    width: '90%',
    borderRadius: 4,
    marginBottom: 4,
  },
  standardHeadlineShort: {
    height: 16,
    width: '60%',
    borderRadius: 4,
    marginBottom: SPACING.SM,
  },
  
  // Shared Footer Styles
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.XS,
  },
  footerText: {
    height: 12,
    width: 120,
    borderRadius: 4,
  },
  footerTextSmall: {
    height: 10,
    width: 90,
    borderRadius: 4,
  },
});
