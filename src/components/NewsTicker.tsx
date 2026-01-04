import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent, Platform, Dimensions } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash } from '../types';

const TICKER_SPEED = 60; // pixels per second
const SCREEN_WIDTH = Dimensions.get('window').width;

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const scrollAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

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

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== textWidth) {
      setTextWidth(width);
      setTimeout(() => setIsReady(true), 100);
    }
  }, [textWidth]);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (!isReady || textWidth === 0 || headlines.length === 0) {
      return;
    }

    // Classic marquee: start from right edge, scroll left until text exits left
    // Total distance = screen width + text width (to fully exit)
    const totalDistance = SCREEN_WIDTH + textWidth;
    const duration = (totalDistance / TICKER_SPEED) * 1000;

    const useNative = Platform.OS === 'ios';

    // Start off-screen right, end off-screen left
    scrollAnim.setValue(SCREEN_WIDTH);
    
    animationRef.current = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -textWidth, // Fully exit on left
        duration,
        useNativeDriver: useNative,
      })
    );

    animationRef.current.start();

    return () => {
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [textWidth, isReady, headlines.length, scrollAnim]);

  // Reset when headlines change
  useEffect(() => {
    setIsReady(false);
    scrollAnim.setValue(SCREEN_WIDTH);
  }, [tickerText, scrollAnim]);

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
        <Animated.View
          style={[
            styles.tickerContent,
            { transform: [{ translateX: scrollAnim }] },
          ]}
        >
          <Text
            style={[styles.tickerText, { color: textColor }]}
            onLayout={handleLayout}
          >
            {tickerText}
          </Text>
        </Animated.View>
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
    overflow: 'hidden',
  },
  tickerContent: {
    flexDirection: 'row',
    position: 'absolute',
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 36,
  },
});
