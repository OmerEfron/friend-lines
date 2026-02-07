import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { Text, IconButton, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SPACING } from '../theme/spacing';

interface NotificationBannerProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  onPress?: () => void;
}

export default function NotificationBanner({ 
  message, 
  visible, 
  onDismiss,
  onPress 
}: NotificationBannerProps) {
  const theme = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!visible && slideAnim._value === -100) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: theme.colors.error,
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      <TouchableOpacity 
        style={styles.content} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="bell-ring" size={18} color="white" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>BREAKING NEWS</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        </View>
        <IconButton
          icon="close"
          size={18}
          iconColor="white"
          onPress={onDismiss}
          style={styles.closeButton}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.SM,
    paddingHorizontal: SPACING.MD,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.SM,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 2,
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  closeButton: {
    margin: 0,
  },
});
