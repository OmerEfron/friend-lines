import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent, Platform } from 'react-native';
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

  const handleTextLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setTextWidth(width);
    }
  }, []);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0) {
      setContainerWidth(width);
    }
  }, []);

  // Start animation when both widths are measured
  useEffect(() => {
    if (textWidth > 0 && containerWidth > 0) {
      setTimeout(() => setIsReady(true), 100);
    }
  }, [textWidth, containerWidth]);

  useEffect(() => {
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (!isReady || textWidth === 0 || containerWidth === 0 || headlines.length === 0) {
      return;
    }

    // Classic marquee: start from right edge of container, scroll until text exits left
    const startPosition = containerWidth;
    const endPosition = -textWidth;
    const totalDistance = startPosition - endPosition;
    const duration = (totalDistance / TICKER_SPEED) * 1000;

    const useNative = Platform.OS === 'ios';

    scrollAnim.setValue(startPosition);
    
    animationRef.current = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: endPosition,
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
  }, [textWidth, containerWidth, isReady, headlines.length, scrollAnim]);

  // Reset when headlines change
  useEffect(() => {
    setIsReady(false);
  }, [tickerText]);

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
        <Animated.Text
          style={[
            styles.tickerText,
            { 
              color: textColor,
              transform: [{ translateX: scrollAnim }],
            },
          ]}
          onLayout={handleTextLayout}
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
  tickerText: {
    fontSize: 14,
    fontWeight: '500',
    position: 'absolute',
    left: 0,
    top: 0,
    lineHeight: 36,
  },
});
