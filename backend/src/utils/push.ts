/**
 * Push notification utility for sending notifications via Expo Push API
 */

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

export interface PushMessage {
  to: string | string[];
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: 'default' | null;
  badge?: number;
  channelId?: string;
}

export interface PushTicket {
  id?: string;
  status: 'ok' | 'error';
  message?: string;
  details?: {
    error?: string;
  };
}

export interface PushResponse {
  data: PushTicket[];
}

/**
 * Send push notification to one or more Expo push tokens
 */
export async function sendPushNotification(
  message: PushMessage
): Promise<PushTicket[]> {
  const messages = Array.isArray(message.to)
    ? message.to.map((token) => ({ ...message, to: token }))
    : [message];

  // Filter out invalid tokens (each message now has a string `to`)
  const validMessages = messages.filter(
    (m) => typeof m.to === 'string' && m.to.startsWith('ExponentPushToken[')
  );

  if (validMessages.length === 0) {
    console.log('No valid Expo push tokens to send to');
    return [];
  }

  try {
    const response = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessages),
    });

    if (!response.ok) {
      console.error('Expo Push API error:', response.status);
      return [];
    }

    const result = (await response.json()) as PushResponse;
    return result.data;
  } catch (error) {
    console.error('Failed to send push notification:', error);
    return [];
  }
}

/**
 * Send notification to multiple users by their push tokens
 */
export async function sendPushToTokens(
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<PushTicket[]> {
  if (!tokens || tokens.length === 0) {
    return [];
  }

  return sendPushNotification({
    to: tokens,
    title,
    body,
    data,
    sound: 'default',
    channelId: 'default',
  });
}

