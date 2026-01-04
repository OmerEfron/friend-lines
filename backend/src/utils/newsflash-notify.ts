import { queryItems, getItem } from './dynamo';
import { sendPushToTokens } from './push';

const FRIENDSHIPS_TABLE = process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';
const DEVICE_TOKENS_TABLE = process.env.DEVICE_TOKENS_TABLE || 'friendlines-device-tokens';

interface Friendship {
  userId: string;
  friendId: string;
  status: string;
}

interface User {
  id: string;
  name: string;
}

interface DeviceToken {
  userId: string;
  expoPushToken: string;
}

type NewsSeverity = 'STANDARD' | 'BREAKING' | 'DEVELOPING';

/**
 * Send push notifications to friends when a newsflash is created
 */
export async function notifyFriendsOfNewsflash(
  userId: string,
  headline: string,
  severity?: NewsSeverity
): Promise<void> {
  try {
    console.log(`[Push] Starting notification for user ${userId}`);
    
    const friendships = (await queryItems(
      FRIENDSHIPS_TABLE,
      undefined,
      'userId = :userId',
      { ':userId': userId }
    )) as Friendship[];
    
    const friendIds = friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => f.friendId);
  
    if (friendIds.length === 0) return;

    const user = (await getItem(USERS_TABLE, { id: userId })) as User | undefined;
    const userName = user?.name || 'Someone';

    const tokenQueries = friendIds.map((friendId) =>
      queryItems(DEVICE_TOKENS_TABLE, undefined, 'userId = :userId', { ':userId': friendId })
    );
    const tokenResults = await Promise.all(tokenQueries);
    
    const friendTokens = tokenResults
      .flat()
      .map((t) => (t as DeviceToken).expoPushToken)
      .filter(Boolean);

    if (friendTokens.length === 0) return;

    // Enhanced title for BREAKING news
    const title = severity === 'BREAKING'
      ? `🔴 BREAKING: ${userName}`
      : `Newsflash From ${userName}`;

    const results = await sendPushToTokens(friendTokens, title, headline, { type: 'newsflash', userId });
    console.log(`[Push] Sent. Results: ${JSON.stringify(results)}`);
  } catch (error) {
    console.error(`[Push] Error:`, error);
    throw error;
  }
}

