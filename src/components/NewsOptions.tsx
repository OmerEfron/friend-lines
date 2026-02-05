import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { Chip, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NewsCategory, NewsSeverity, NEWS_CATEGORIES } from '../types';
import { selection, lightImpact } from '../utils/haptics';
import { HIT_SLOP_48 } from '../utils/a11y';

// Category emojis
const CATEGORY_EMOJI: Record<NewsCategory, string> = {
  GENERAL: '📰',
  LIFESTYLE: '🏠',
  ENTERTAINMENT: '🎬',
  SPORTS: '🏃',
  FOOD: '🍽️',
  TRAVEL: '✈️',
  OPINION: '💬',
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
  const { t } = useTranslation('creation');
  const [expanded, setExpanded] = useState(false);

  // Get localized category labels
  const getCategoryLabel = (cat: NewsCategory) => {
    const keyMap: Record<NewsCategory, string> = {
      GENERAL: 'general',
      LIFESTYLE: 'lifestyle',
      ENTERTAINMENT: 'entertainment',
      SPORTS: 'sports',
      FOOD: 'food',
      TRAVEL: 'travel',
      OPINION: 'opinion',
    };
    return t(`options.categories.${keyMap[cat]}`);
  };

  const currentCategoryLabel = getCategoryLabel(category);
  const severityLabel = severity === 'BREAKING' ? t('options.breaking') : 
                        severity === 'DEVELOPING' ? t('options.developing') : t('options.standard');

  return (
    <View style={styles.container}>
      {/* Collapsed Summary */}
      <Pressable 
        onPress={() => {
          lightImpact();
          setExpanded(!expanded);
        }}
        style={({ pressed }) => [
          styles.summaryRow, 
          { backgroundColor: theme.colors.surfaceVariant },
          pressed && { opacity: 0.7 },
        ]}
        android_ripple={{ color: theme.colors.primary, borderless: false }}
        accessibilityRole="button"
        accessibilityLabel={`News options: ${currentCategoryLabel}, ${severityLabel}`}
        accessibilityHint={expanded ? 'Double tap to collapse options' : 'Double tap to expand options'}
        accessibilityState={{ expanded }}
      >
        <View style={styles.summaryContent}>
          <Text style={styles.summaryItem}>
            {CATEGORY_EMOJI[category]} {currentCategoryLabel}
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
          <Text variant="labelMedium" style={styles.optionLabel}>{t('options.severity')}</Text>
          <SegmentedButtons
            value={severity}
            onValueChange={(val) => {
              selection();
              onSeverityChange(val as NewsSeverity);
            }}
            buttons={[
              { value: 'STANDARD', label: t('options.standard') },
              { value: 'BREAKING', label: t('options.breaking') },
              { value: 'DEVELOPING', label: t('options.developing') },
            ]}
            style={styles.segmented}
            density="small"
          />

          {/* Category */}
          <Text variant="labelMedium" style={styles.optionLabel}>{t('options.category')}</Text>
          <View style={styles.categoryGrid}>
            {NEWS_CATEGORIES.map((cat) => (
              <Chip
                key={cat}
                selected={category === cat}
                onPress={() => {
                  selection();
                  onCategoryChange(cat);
                }}
                mode={category === cat ? 'flat' : 'outlined'}
                compact
                style={styles.categoryChip}
              >
                {CATEGORY_EMOJI[cat]} {getCategoryLabel(cat)}
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
