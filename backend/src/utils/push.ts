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
    console.log(`[Push API] Sending ${validMessages.length} notification(s) to Expo API`);
    const apiStart = Date.now();
    const response = await fetch(EXPO_PUSH_API, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validMessages),
    });

    const fetchDuration = Date.now() - apiStart;
    console.log(`[Push API] Fetch completed in ${fetchDuration}ms, status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error(`[Push API] Expo Push API error: ${response.status} - ${errorText}`);
      return [];
    }

    const result = (await response.json()) as PushResponse;
    const totalDuration = Date.now() - apiStart;
    const successCount = result.data.filter((t) => t.status === 'ok').length;
    const errorCount = result.data.filter((t) => t.status === 'error').length;
    console.log(`[Push API] Success: ${successCount} sent, ${errorCount} failed (total: ${totalDuration}ms)`);
    
    if (errorCount > 0) {
      console.log(`[Push API] Error details:`, JSON.stringify(result.data.filter((t) => t.status === 'error')));
    }
    
    return result.data;
  } catch (error) {
    console.error('[Push API] Failed to send push notification:', error);
    console.error('[Push API] Error details:', error instanceof Error ? error.message : String(error));
    console.error('[Push API] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
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

