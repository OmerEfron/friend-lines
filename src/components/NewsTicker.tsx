import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text as RNText, AccessibilityInfo } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Marquee } from '@animatereactnative/marquee';
import { Newsflash } from '../types';

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const [reduceMotionEnabled, setReduceMotionEnabled] = useState(false);

  useEffect(() => {
    // Check initial state
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotionEnabled);

    // Subscribe to changes
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotionEnabled
    );

    return () => subscription.remove();
  }, []);

  // Get top 5 recent headlines
  const headlines = newsflashes
    .filter((n) => n.headline && n.headline.trim().length > 0)
    .slice(0, 5)
    .map((n) => {
      const prefix = n.severity === 'BREAKING' ? '🔴 ' : '';
      const userName = n.user?.name || n.user?.username || 'Someone';
      return `${prefix}${userName}: ${n.headline}`;
    });

  const tickerText = headlines.length > 0 ? headlines.join('   •   ') : '';

  if (headlines.length === 0) {
    return null;
  }

  const textColor = theme.dark 
    ? '#FFFFFF'
    : theme.colors.onPrimaryContainer;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={[styles.label, { backgroundColor: theme.colors.error }]}>
        <Text style={styles.labelText}>LIVE</Text>
      </View>
      <View style={styles.tickerWrapper}>
        {reduceMotionEnabled ? (
          // Static fallback when Reduce Motion is enabled
          <RNText
            style={[styles.tickerText, styles.staticText, { color: textColor }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {tickerText}
          </RNText>
        ) : (
          // Animated marquee when Reduce Motion is disabled
          <Marquee
            direction="horizontal"
            speed={1}
            spacing={40}
            style={styles.marquee}
          >
            <RNText
              style={[styles.tickerText, { color: textColor }]}
              numberOfLines={1}
            >
              {tickerText}
            </RNText>
          </Marquee>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    zIndex: 1,
  },
  labelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tickerWrapper: {
    flex: 1,
    height: 36,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  marquee: {
    height: 36,
    alignItems: 'center',
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 36,
  },
  staticText: {
    paddingHorizontal: 8,
  },
});
