/**
 * SkeletonWrapper - A thin wrapper around AutoSkeletonView with app defaults.
 * Use this to wrap content that should show skeleton placeholders while loading.
 */
import React, { ReactNode } from 'react';
import { useTheme } from 'react-native-paper';
import { AutoSkeletonView, AutoSkeletonIgnoreView } from 'react-native-auto-skeleton';

interface SkeletonWrapperProps {
  /** Whether to show the skeleton loading state */
  isLoading: boolean;
  /** Content to render (will show as skeleton when loading) */
  children: ReactNode;
}

/**
 * Wrapper component that applies skeleton loading effect to children.
 * Uses app theme colors for consistent appearance.
 */
export function SkeletonWrapper({ isLoading, children }: SkeletonWrapperProps) {
  const theme = useTheme();

  // Use theme-appropriate skeleton colors
  const gradientColors = theme.dark
    ? ['#2A2A2A', '#3A3A3A'] as [string, string]
    : ['#E0E0E0', '#F5F5F5'] as [string, string];

  return (
    <AutoSkeletonView
      isLoading={isLoading}
      shimmerSpeed={1.2}
      gradientColors={gradientColors}
      defaultRadius={8}
      animationType="gradient"
    >
      {children}
    </AutoSkeletonView>
  );
}

/**
 * Wrapper for content that should NOT show skeleton effect.
 * Use this inside SkeletonWrapper for interactive controls, headers, etc.
 */
export function SkeletonIgnore({ children }: { children: ReactNode }) {
  return <AutoSkeletonIgnoreView>{children}</AutoSkeletonIgnoreView>;
}

export default SkeletonWrapper;
