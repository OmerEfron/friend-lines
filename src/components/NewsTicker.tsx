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

  // Get top 5 recent headlines (news magazine style - headline only)
  const headlines = newsflashes
    .filter((n) => n.headline && n.headline.trim().length > 0)
    .slice(0, 5)
    .map((n) => {
      // News style: Just the headline, no user prefix
      const prefix = n.severity === 'BREAKING' ? '🔴 ' : '';
      return `${prefix}${n.headline}`;
    });

  const tickerText = headlines.length > 0 ? headlines.join('   •   ') : '';

  if (headlines.length === 0) {
    return null;
  }

  // Bold red background with white text (Ynet/N12 style)
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.error }]}>
      <View style={styles.label}>
        <Text style={styles.labelText}>BREAKING</Text>
      </View>
      <View style={styles.tickerWrapper}>
        {reduceMotionEnabled ? (
          // Static fallback when Reduce Motion is enabled
          <RNText
            style={[styles.tickerText, styles.staticText]}
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
            <RNText style={styles.tickerText} numberOfLines={1}>
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
    height: 40,
    overflow: 'hidden',
  },
  label: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    zIndex: 1,
  },
  labelText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  tickerWrapper: {
    flex: 1,
    height: 40,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  marquee: {
    height: 40,
    alignItems: 'center',
  },
  tickerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 40,
  },
  staticText: {
    paddingHorizontal: 10,
  },
});
