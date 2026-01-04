import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Chip, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NewsCategory, NewsSeverity, NEWS_CATEGORIES } from '../types';

// Category display info with emojis for compact display
const CATEGORY_INFO: Record<NewsCategory, { emoji: string; label: string }> = {
  GENERAL: { emoji: '📰', label: 'General' },
  LIFESTYLE: { emoji: '🏠', label: 'Lifestyle' },
  ENTERTAINMENT: { emoji: '🎬', label: 'Entertainment' },
  SPORTS: { emoji: '🏃', label: 'Sports' },
  FOOD: { emoji: '🍽️', label: 'Food' },
  TRAVEL: { emoji: '✈️', label: 'Travel' },
  OPINION: { emoji: '💬', label: 'Opinion' },
};

interface NewsOptionsProps {
  category: NewsCategory;
  severity: NewsSeverity;
  onCategoryChange: (category: NewsCategory) => void;
  onSeverityChange: (severity: NewsSeverity) => void;
}

export default function NewsOptions({
  category,
  severity,
  onCategoryChange,
  onSeverityChange,
}: NewsOptionsProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(false);

  const currentCategory = CATEGORY_INFO[category];
  const severityLabel = severity === 'BREAKING' ? '🔴 Breaking' : 
                        severity === 'DEVELOPING' ? '📡 Developing' : 'Standard';

  return (
    <View style={styles.container}>
      {/* Collapsed Summary */}
      <Pressable 
        onPress={() => setExpanded(!expanded)}
        style={[styles.summaryRow, { backgroundColor: theme.colors.surfaceVariant }]}
      >
        <View style={styles.summaryContent}>
          <Text style={styles.summaryItem}>
            {currentCategory.emoji} {currentCategory.label}
          </Text>
          <Text style={styles.summaryDot}>•</Text>
          <Text style={styles.summaryItem}>{severityLabel}</Text>
        </View>
        <MaterialCommunityIcons 
          name={expanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color={theme.colors.onSurfaceVariant}
        />
      </Pressable>

      {/* Expanded Options */}
      {expanded && (
        <View style={[styles.expandedContent, { borderColor: theme.colors.outlineVariant }]}>
          {/* Severity */}
          <Text variant="labelMedium" style={styles.optionLabel}>Severity</Text>
          <SegmentedButtons
            value={severity}
            onValueChange={(val) => onSeverityChange(val as NewsSeverity)}
            buttons={[
              { value: 'STANDARD', label: 'Standard' },
              { value: 'BREAKING', label: '🔴 Breaking' },
              { value: 'DEVELOPING', label: '📡 Developing' },
            ]}
            style={styles.segmented}
            density="small"
          />

          {/* Category */}
          <Text variant="labelMedium" style={styles.optionLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {NEWS_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => onCategoryChange(cat)}
                mode={category === cat ? 'flat' : 'outlined'}
                compact
                style={styles.categoryChip}
              >
                {CATEGORY_INFO[cat].emoji} {CATEGORY_INFO[cat].label}
              </Chip>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItem: {
    fontSize: 14,
  },
  summaryDot: {
    marginHorizontal: 8,
    opacity: 0.5,
  },
  expandedContent: {
    marginTop: 8,
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
  },
  optionLabel: {
    marginBottom: 8,
    opacity: 0.7,
  },
  segmented: {
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    marginBottom: 4,
  },
});
