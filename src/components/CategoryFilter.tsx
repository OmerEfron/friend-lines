import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { NewsCategory, NEWS_CATEGORIES } from '../types';
import { SPACING } from '../theme/spacing';

// Category display names
const CATEGORY_LABELS: Record<NewsCategory | 'ALL', string> = {
  ALL: 'All',
  GENERAL: 'News',
  LIFESTYLE: 'Lifestyle',
  ENTERTAINMENT: 'Entertainment',
  SPORTS: 'Sports',
  FOOD: 'Food',
  TRAVEL: 'Travel',
  OPINION: 'Opinion',
};

interface CategoryFilterProps {
  selected: NewsCategory | 'ALL';
  onSelect: (category: NewsCategory | 'ALL') => void;
}

export default function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const theme = useTheme();
  const categories: (NewsCategory | 'ALL')[] = ['ALL', ...NEWS_CATEGORIES];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceVariant }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {categories.map((cat) => {
          const isSelected = selected === cat;
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => onSelect(cat)}
              style={[
                styles.chip,
                { backgroundColor: theme.colors.surface },
                isSelected && { backgroundColor: theme.colors.primary }
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.chipText,
                { color: theme.colors.onSurface },
                isSelected && styles.chipTextSelected
              ]}>
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.SM,
  },
  content: {
    paddingHorizontal: SPACING.SM,
    gap: SPACING.SM,
    flexDirection: 'row',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    color: 'white',
    fontWeight: '700',
  },
});
