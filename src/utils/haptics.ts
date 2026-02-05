/**
 * Haptic feedback utilities for Friendlines app.
 * Provides simple wrappers around expo-haptics for consistent feedback.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Check if haptics are supported on the current platform.
 * Haptics are only available on iOS and Android (not web).
 */
const isHapticsSupported = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Light impact feedback - use for minor actions.
 * Examples: toggle switches, checkbox changes, chip selections.
 */
export const lightImpact = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics aren't available
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Medium impact feedback - use for standard actions.
 * Examples: button presses, card taps, navigation actions.
 */
export const mediumImpact = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Heavy impact feedback - use for significant actions.
 * Examples: delete confirmations, major state changes.
 */
export const heavyImpact = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Selection feedback - use for discrete selections.
 * Examples: picker changes, segment control toggles, option selections.
 */
export const selection = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Success notification feedback.
 * Examples: successful form submission, action completed.
 */
export const successNotification = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Warning notification feedback.
 * Examples: validation errors, near limit warnings.
 */
export const warningNotification = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};

/**
 * Error notification feedback.
 * Examples: failed actions, permission denied.
 */
export const errorNotification = async (): Promise<void> => {
  if (!isHapticsSupported) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.debug('Haptics unavailable:', error);
  }
};
