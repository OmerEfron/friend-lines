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
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Get top 5 recent headlines
  const headlines = newsflashes
    .slice(0, 5)
    .map((n) => {
      const prefix = n.severity === 'BREAKING' ? '🔴 ' : '';
      const userName = n.user?.name || 'Someone';
      return `${prefix}${userName}: ${n.headline}`;
    });

  const tickerText = headlines.join('  •  ');
  const textWidth = tickerText.length * 8; // Approximate width

  useEffect(() => {
    if (headlines.length === 0) return;

    const totalWidth = textWidth + SCREEN_WIDTH;
    const duration = (totalWidth / TICKER_SPEED) * 1000;

    const startAnimation = () => {
      scrollAnim.setValue(SCREEN_WIDTH);
      Animated.timing(scrollAnim, {
        toValue: -textWidth,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) startAnimation();
      });
    };

    startAnimation();

    return () => scrollAnim.stopAnimation();
  }, [tickerText, textWidth, scrollAnim, headlines.length]);

  if (headlines.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={[styles.label, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.labelText}>LIVE</Text>
      </View>
      <View style={styles.tickerContainer}>
        <Animated.Text
          style={[
            styles.tickerText,
            { color: theme.colors.onPrimaryContainer },
            { transform: [{ translateX: scrollAnim }] },
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
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '500',
    position: 'absolute',
    whiteSpace: 'nowrap',
  },
});

