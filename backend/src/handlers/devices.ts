import { APIGatewayProxyResult } from 'aws-lambda';
import { putItem, deleteItem, scanTable } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const DEVICE_TOKENS_TABLE =
  process.env.DEVICE_TOKENS_TABLE || 'friendlines-device-tokens';

interface DeviceToken {
  userId: string;
  deviceId: string;
  expoPushToken: string;
  platform: 'ios' | 'android' | 'web';
  updatedAt: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  console.log('Devices Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // POST /devices/token - Register/update push token
    if (method === 'POST' && path === '/devices/token') {
      return await withAuth(handleRegisterToken)(event);
    }

    // DELETE /devices/token - Remove push token on logout
    if (method === 'DELETE' && path === '/devices/token') {
      return await withAuth(handleRemoveToken)(event);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

async function handleRegisterToken(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const userId = event.userId!;

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { deviceId, expoPushToken, platform } = body;

  if (!deviceId || !expoPushToken) {
    return errorResponse('deviceId and expoPushToken are required', 400);
  }

  // Validate token format
  if (!expoPushToken.startsWith('ExponentPushToken[')) {
    return errorResponse('Invalid Expo push token format', 400);
  }

  const deviceToken: DeviceToken = {
    userId,
    deviceId,
    expoPushToken,
    platform: platform || 'android',
    updatedAt: new Date().toISOString(),
  };

  await putItem(DEVICE_TOKENS_TABLE, deviceToken);

  return successResponse({
    message: 'Push token registered successfully',
    deviceToken: { userId, deviceId, platform: deviceToken.platform },
  });
}

async function handleRemoveToken(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const userId = event.userId!;

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { deviceId } = body;

  if (!deviceId) {
    return errorResponse('deviceId is required', 400);
  }

  await deleteItem(DEVICE_TOKENS_TABLE, { userId, deviceId });

  return successResponse({ message: 'Push token removed successfully' });
}

/**
 * Get all push tokens for a user
 */
export async function getTokensForUser(userId: string): Promise<string[]> {
  const allTokens = (await scanTable(DEVICE_TOKENS_TABLE)) as DeviceToken[];
  return allTokens
    .filter((t) => t.userId === userId)
    .map((t) => t.expoPushToken);
}

/**
 * Get push tokens for multiple users
 */
export async function getTokensForUsers(userIds: string[]): Promise<string[]> {
  if (!userIds || userIds.length === 0) {
    return [];
  }
  const allTokens = (await scanTable(DEVICE_TOKENS_TABLE)) as DeviceToken[];
  return allTokens
    .filter((t) => userIds.includes(t.userId))
    .map((t) => t.expoPushToken);
}

