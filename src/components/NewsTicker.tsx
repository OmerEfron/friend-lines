import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash } from '../types';

const TICKER_SPEED = 60; // pixels per second

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
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

  const handleTextLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== textWidth) {
      setTextWidth(width);
    }
  }, [textWidth]);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== containerWidth) {
      setContainerWidth(width);
    }
  }, [containerWidth]);

  useEffect(() => {
    // Clean up previous animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    // Need both measurements and headlines
    if (textWidth === 0 || containerWidth === 0 || headlines.length === 0) {
      return;
    }

    // Classic marquee: start from right edge, scroll until text exits left
    const startPosition = containerWidth;
    const endPosition = -textWidth;
    const totalDistance = startPosition - endPosition;
    const duration = (totalDistance / TICKER_SPEED) * 1000;

    // Always use native driver for transform - supported on both platforms
    scrollAnim.setValue(startPosition);
    
    animationRef.current = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: endPosition,
        duration,
        useNativeDriver: true,
      })
    );

    // Small delay to ensure layout is complete on Android
    const timer = setTimeout(() => {
      animationRef.current?.start();
    }, 150);

    return () => {
      clearTimeout(timer);
      if (animationRef.current) {
        animationRef.current.stop();
      }
    };
  }, [textWidth, containerWidth, headlines.length, scrollAnim]);

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
      <View style={styles.tickerWrapper} onLayout={handleContainerLayout}>
        <Animated.View
          style={[
            styles.textContainer,
            { transform: [{ translateX: scrollAnim }] },
          ]}
        >
          <Text
            style={[styles.tickerText, { color: textColor }]}
            onLayout={handleTextLayout}
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
    height: 36,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    flexDirection: 'row',
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 36,
  },
});
