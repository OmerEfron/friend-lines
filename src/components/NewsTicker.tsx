import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash } from '../types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const TICKER_SPEED = 50; // pixels per second
const LIVE_LABEL_WIDTH = 50;

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const scrollAnim = useRef(new Animated.Value(0)).current;

  // Get top 5 recent headlines
  const headlines = newsflashes
    .filter((n) => n.headline && n.headline.trim().length > 0)
    .slice(0, 5)
    .map((n) => {
      const prefix = n.severity === 'BREAKING' ? '🔴 ' : '';
      const userName = n.user?.name || n.user?.username || `User ${n.userId?.slice(0, 4) || 'Unknown'}`;
      return `${prefix}${userName}: ${n.headline}`;
    });

  const tickerText = headlines.join('  •  ');
  const availableWidth = SCREEN_WIDTH - LIVE_LABEL_WIDTH - 16;
  
  // Estimate text width (more conservative: ~6.5px per character)
  const estimatedWidth = tickerText.length * 6.5;

  useEffect(() => {
    if (headlines.length === 0 || !tickerText.trim()) {
      return;
    }

    // If text fits, show statically
    if (estimatedWidth <= availableWidth) {
      scrollAnim.setValue(0);
      return;
    }

    // Continuous scroll with seamless loop
    const spacing = 100;
    const loopDistance = estimatedWidth + spacing;
    const duration = (loopDistance / TICKER_SPEED) * 1000;

    const animate = () => {
      scrollAnim.setValue(0);
      Animated.timing(scrollAnim, {
        toValue: -loopDistance,
        duration,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          animate();
        }
      });
    };

    animate();

    return () => scrollAnim.stopAnimation();
  }, [tickerText, scrollAnim, headlines.length, estimatedWidth, availableWidth]);

  if (headlines.length === 0 || !tickerText.trim()) {
    return null;
  }

  const textColor = theme.dark 
    ? theme.colors.onPrimaryContainer || '#E6E1E5'
    : theme.colors.onPrimaryContainer || '#1C1B1F';

  const shouldAnimate = estimatedWidth > availableWidth;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primaryContainer }]}>
      <View style={[styles.label, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.labelText}>LIVE</Text>
      </View>
      <View style={styles.tickerContainer}>
        {shouldAnimate ? (
          <View style={styles.scrollView}>
            <Animated.Text
              style={[
                styles.tickerText,
                { color: textColor, transform: [{ translateX: scrollAnim }] },
              ]}
              numberOfLines={1}
            >
              {tickerText}
            </Animated.Text>
            <Animated.Text
              style={[
                styles.tickerText,
                { 
                  color: textColor,
                  transform: [{ translateX: Animated.add(scrollAnim, estimatedWidth + 100) }],
                },
              ]}
              numberOfLines={1}
            >
              {tickerText}
            </Animated.Text>
          </View>
        ) : (
          <Text style={[styles.tickerText, { color: textColor }]} numberOfLines={1}>
            {tickerText}
          </Text>
        )}
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
  scrollView: {
    flexDirection: 'row',
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 32,
    paddingRight: 100, // Spacing for seamless loop
  },
});
