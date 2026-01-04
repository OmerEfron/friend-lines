import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiCall } from '../config/api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register for push notifications and return the Expo push token
 */
export async function registerForPushNotificationsAsync(): Promise<
  string | undefined
> {
  // Push notifications require physical device
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return undefined;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission not granted');
    return undefined;
  }

  // Get Expo push token
  try {
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ??
      Constants?.easConfig?.projectId;

    if (!projectId) {
      console.log('EAS project ID not found - run eas init first');
      return undefined;
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const pushToken = tokenData.data;
    
    // Log push token for testing purposes
    console.log('═══════════════════════════════════════════════════════');
    console.log('📱 EXPO PUSH TOKEN (for testing):');
    console.log(pushToken);
    console.log('═══════════════════════════════════════════════════════');
    console.log('💡 Copy this token to test push notifications at:');
    console.log('   https://expo.dev/notifications');
    console.log('═══════════════════════════════════════════════════════');
    
    return pushToken;
  } catch (error: any) {
    console.error('Failed to get push token:', error);
    
    // Provide helpful error message for Firebase issues
    if (error?.message?.includes('Firebase') || error?.message?.includes('FCM')) {
      console.error(
        'Firebase not initialized. For Android, you need to:\n' +
        '1. Create a Firebase project\n' +
        '2. Download google-services.json and place it in project root\n' +
        '3. Upload FCM server key via: eas credentials\n' +
        '4. Rebuild the app\n' +
        'See docs/FIREBASE_SETUP.md for details'
      );
    }
    
    return undefined;
  }
}

/**
 * Generate a unique device ID (persistent per device)
 */
function getDeviceId(): string {
  // Use a combination of device constants for uniqueness
  const parts = [
    Device.modelName || 'unknown',
    Device.osName || 'unknown',
    Device.osVersion || 'unknown',
    Platform.OS,
  ];
  // Simple hash-like ID from device info
  return parts.join('-').replace(/\s+/g, '_').toLowerCase();
}

/**
 * Register push token with backend
 */
export async function registerPushTokenWithBackend(
  expoPushToken: string
): Promise<boolean> {
  try {
    const deviceId = getDeviceId();
    console.log('📤 Registering push token with backend...');
    console.log(`   Device ID: ${deviceId}`);
    console.log(`   Platform: ${Platform.OS}`);
    
    await apiCall('/devices/token', {
      method: 'POST',
      body: JSON.stringify({
        deviceId,
        expoPushToken,
        platform: Platform.OS,
      }),
    });
    console.log('✅ Push token registered with backend successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to register push token:', error);
    return false;
  }
}

/**
 * Remove push token from backend (on logout)
 */
export async function removePushTokenFromBackend(): Promise<boolean> {
  try {
    await apiCall('/devices/token', {
      method: 'DELETE',
      body: JSON.stringify({
        deviceId: getDeviceId(),
      }),
    });
    console.log('Push token removed from backend');
    return true;
  } catch (error) {
    console.error('Failed to remove push token:', error);
    return false;
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Get the last notification response (if app opened via notification)
 */
export async function getLastNotificationResponse(): Promise<Notifications.NotificationResponse | null> {
  return Notifications.getLastNotificationResponseAsync();
}

