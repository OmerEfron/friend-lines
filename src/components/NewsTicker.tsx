import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, StyleSheet, Animated, LayoutChangeEvent, Platform } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { Newsflash } from '../types';

const TICKER_SPEED = 50; // pixels per second

interface NewsTickerProps {
  newsflashes: Newsflash[];
}

export default function NewsTicker({ newsflashes }: NewsTickerProps) {
  const theme = useTheme();
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const [contentWidth, setContentWidth] = useState(0);
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

  const tickerText = headlines.length > 0 ? headlines.join('   •   ') + '   •   ' : '';

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 0 && width !== contentWidth) {
      setContentWidth(width);
      // Small delay to ensure layout is fully settled
      setTimeout(() => setIsReady(true), 100);
    }
  }, [contentWidth]);

  useEffect(() => {
    // Stop any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
      animationRef.current = null;
    }

    if (!isReady || contentWidth === 0 || headlines.length === 0) {
      return;
    }

    // Animation: scroll from 0 to -contentWidth (the width of one copy)
    const duration = (contentWidth / TICKER_SPEED) * 1000;

    scrollAnim.setValue(0);
    
    // Use native driver on iOS simulator, JS driver on Android/dev builds for compatibility
    const useNative = Platform.OS === 'ios';
    
    animationRef.current = Animated.loop(
      Animated.timing(scrollAnim, {
        toValue: -contentWidth,
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
  }, [contentWidth, isReady, headlines.length, scrollAnim]);

  // Reset ready state when headlines change
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
      <View style={styles.tickerWrapper}>
        <Animated.View
          style={[
            styles.tickerContent,
            { transform: [{ translateX: scrollAnim }] },
          ]}
        >
          {/* First copy - measure this one */}
          <Text
            style={[styles.tickerText, { color: textColor }]}
            onLayout={handleLayout}
          >
            {tickerText}
          </Text>
          {/* Second copy for seamless loop */}
          <Text style={[styles.tickerText, { color: textColor }]}>
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
  },
  tickerText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 36,
  },
});
