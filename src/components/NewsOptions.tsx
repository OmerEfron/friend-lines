import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Chip, Text, useTheme, SegmentedButtons } from 'react-native-paper';
import { NewsCategory, NewsSeverity, NEWS_CATEGORIES } from '../types';

// Category display info
const CATEGORY_INFO: Record<NewsCategory, { icon: string; label: string }> = {
  GENERAL: { icon: 'newspaper', label: 'General' },
  LIFESTYLE: { icon: 'home-heart', label: 'Lifestyle' },
  ENTERTAINMENT: { icon: 'movie-open', label: 'Entertainment' },
  SPORTS: { icon: 'run', label: 'Sports' },
  FOOD: { icon: 'food', label: 'Food' },
  TRAVEL: { icon: 'airplane', label: 'Travel' },
  OPINION: { icon: 'comment-quote', label: 'Opinion' },
};

// Headline templates
export const HEADLINE_TEMPLATES = [
  'Sources confirm: {name} has...',
  'BREAKING: {name} reportedly...',
  'Developing story: {name} may...',
  'EXCLUSIVE: Inside {name}\'s...',
  'Analysis: Why {name}...',
];

interface NewsOptionsProps {
  category: NewsCategory;
  severity: NewsSeverity;
  onCategoryChange: (category: NewsCategory) => void;
  onSeverityChange: (severity: NewsSeverity) => void;
  onTemplateSelect: (template: string) => void;
  userName: string;
}

export default function NewsOptions({
  category,
  severity,
  onCategoryChange,
  onSeverityChange,
  onTemplateSelect,
  userName,
}: NewsOptionsProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {/* Severity Toggle */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Severity</Text>
      <SegmentedButtons
        value={severity}
        onValueChange={(val) => onSeverityChange(val as NewsSeverity)}
        buttons={[
          { value: 'STANDARD', label: 'Standard' },
          { value: 'BREAKING', label: '🔴 Breaking', disabled: false },
          { value: 'DEVELOPING', label: '📡 Developing' },
        ]}
        style={styles.segmented}
      />

      {/* Category Chips */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {NEWS_CATEGORIES.map((cat) => (
            <Chip
              key={cat}
              icon={CATEGORY_INFO[cat].icon}
              selected={category === cat}
              onPress={() => onCategoryChange(cat)}
              style={styles.chip}
              mode={category === cat ? 'flat' : 'outlined'}
            >
              {CATEGORY_INFO[cat].label}
            </Chip>
          ))}
        </View>
      </ScrollView>

      {/* Quick Templates */}
      <Text variant="labelLarge" style={styles.sectionLabel}>Quick Headlines</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
        <View style={styles.chipRow}>
          {HEADLINE_TEMPLATES.map((tpl, idx) => (
            <Chip
              key={idx}
              onPress={() => onTemplateSelect(tpl.replace('{name}', userName))}
              style={styles.templateChip}
              mode="outlined"
              compact
            >
              {tpl.replace('{name}', userName).slice(0, 25)}...
            </Chip>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionLabel: {
    marginBottom: 8,
    fontWeight: '600',
  },
  segmented: {
    marginBottom: 16,
  },
  chipScroll: {
    marginBottom: 16,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    marginRight: 4,
  },
  templateChip: {
    marginRight: 4,
  },
});

