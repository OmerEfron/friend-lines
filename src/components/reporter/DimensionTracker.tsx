import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import type { InterviewDimension } from '../../types';

interface DimensionTrackerProps {
  covered: InterviewDimension[];
}

const DIMENSIONS: { id: InterviewDimension; label: string }[] = [
  { id: 'who', label: 'WHO' },
  { id: 'what', label: 'WHAT' },
  { id: 'where', label: 'WHERE' },
  { id: 'when', label: 'WHEN' },
  { id: 'why', label: 'WHY' },
  { id: 'emotion', label: 'FEEL' },
];

export default function DimensionTracker({ covered }: DimensionTrackerProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <Text variant="labelSmall" style={styles.label}>
        FACT CHECK
      </Text>
      <View style={styles.badgesRow}>
        {DIMENSIONS.map((dim) => {
          const isCovered = covered.includes(dim.id);
          return (
            <View
              key={dim.id}
              style={[
                styles.badge,
                isCovered && {
                  backgroundColor: theme.colors.primaryContainer,
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isCovered && {
                    color: theme.colors.primary,
                    fontWeight: 'bold',
                  },
                ]}
              >
                {dim.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    opacity: 0.5,
    marginBottom: 6,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f5f5f5',
  },
  badgeText: {
    fontSize: 10,
    color: '#9e9e9e',
    fontWeight: '500',
  },
});
