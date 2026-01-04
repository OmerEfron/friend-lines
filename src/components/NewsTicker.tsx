import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICKER_SPEED = 50; // pixels per second

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const scrollAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;

  // Get top 5 recent headlines - filter out any without headlines
  const headlines = newsflashes
    .filter((n) => n.headline && n.headline.trim().length > 0)
    .slice(0, 5)
    .map((n) => {
      const prefix = n.severity === 'BREAKING' ? '🔴 ' : '';
      // Try multiple fallbacks for user name
      const userName = n.user?.name || n.user?.username || `User ${n.userId?.slice(0, 4) || 'Unknown'}`;
      return `${prefix}${userName}: ${n.headline}`;
    });

  const tickerText = headlines.join('  •  ');

  useEffect(() => {
    if (headlines.length === 0 || !tickerText.trim()) {
      return;
    }

    // Estimate text width (rough: ~7px per character)
    const estimatedTextWidth = tickerText.length * 7;
    const totalDistance = SCREEN_WIDTH + estimatedTextWidth;
    const duration = (totalDistance / TICKER_SPEED) * 1000;

    const animate = () => {
      scrollAnim.setValue(SCREEN_WIDTH);
      Animated.timing(scrollAnim, {
        toValue: -estimatedTextWidth,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          animate();
        }
      });
    };

    animate();

    return () => {
      scrollAnim.stopAnimation();
    };
  }, [tickerText, scrollAnim, headlines.length]);

  if (headlines.length === 0 || !tickerText.trim()) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={[styles.label, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.labelText}>LIVE</Text>
      </View>
      <View style={styles.tickerContainer}>
        <Animated.Text
          style={[
            styles.tickerText,
            {
              color: theme.dark 
                ? theme.colors.onPrimaryContainer || '#E6E1E5'
                : theme.colors.onPrimaryContainer || '#1C1B1F',
              transform: [{ translateX: scrollAnim }],
            },
          ]}
          numberOfLines={1}
        >
          {tickerText}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 32,
    overflow: 'hidden',
  },
  label: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  labelText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tickerContainer: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 32,
  },
});
