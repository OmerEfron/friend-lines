import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Surface, Text, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DimensionTracker from './DimensionTracker';
import type { InterviewDimension } from '../../types';

interface LiveHeaderProps {
  onBack: () => void;
  coveredDimensions: InterviewDimension[];
}

export default function LiveHeader({ onBack, coveredDimensions }: LiveHeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Surface style={[styles.container, { paddingTop: insets.top }]} elevation={2}>
      <View style={styles.topRow}>
        <IconButton icon="arrow-left" onPress={onBack} />
        <View style={[styles.liveIndicator, { backgroundColor: theme.colors.errorContainer }]}>
          <View style={[styles.recordingDot, { backgroundColor: theme.colors.error }]} />
          <Text style={[styles.liveText, { color: theme.colors.error }]}>ON AIR</Text>
        </View>
        <View style={styles.spacer} />
      </View>
      <DimensionTracker covered={coveredDimensions} />
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 16,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  liveText: {
    fontWeight: 'bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  spacer: {
    width: 48, // Same width as IconButton for centering
  },
});
