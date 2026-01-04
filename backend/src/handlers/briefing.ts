import { ScheduledEvent } from 'aws-lambda';
import { scanTable, queryItems } from '../utils/dynamo';
import { sendPushToTokens } from '../utils/push';

const NEWSFLASHES_TABLE = process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';
const DEVICE_TOKENS_TABLE = process.env.DEVICE_TOKENS_TABLE || 'friendlines-device-tokens';

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  severity?: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
}

interface DeviceToken {
  userId: string;
  expoPushToken: string;
}

/**
 * Morning Briefing - Sends a daily summary push notification to all users
 * Scheduled to run at 8 AM UTC daily
 */
export async function handler(event: ScheduledEvent): Promise<void> {
  console.log('[Briefing] Starting morning briefing...', event);

  try {
    // Get newsflashes from last 24 hours
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
    
    const recentNewsflashes = allNewsflashes
      .filter((n) => n.timestamp > cutoff)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (recentNewsflashes.length === 0) {
      console.log('[Briefing] No newsflashes in last 24h, skipping briefing');
      return;
    }

    // Get all users and their device tokens
    const users = (await scanTable(USERS_TABLE)) as User[];
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    // Get all device tokens
    const allTokens = (await scanTable(DEVICE_TOKENS_TABLE)) as DeviceToken[];
    
    if (allTokens.length === 0) {
      console.log('[Briefing] No device tokens found, skipping');
      return;
    }

    // Build briefing message
    const topStories = recentNewsflashes.slice(0, 3);
    const storyLines = topStories.map((n) => {
      const name = userMap.get(n.userId) || 'Someone';
      return `• ${name}: ${n.headline.slice(0, 40)}${n.headline.length > 40 ? '...' : ''}`;
    });

    const breakingCount = recentNewsflashes.filter((n) => n.severity === 'BREAKING').length;
    const title = breakingCount > 0
      ? `☀️ Morning Briefing (${breakingCount} BREAKING)`
      : '☀️ Your Morning Briefing';
    
    const body = `${recentNewsflashes.length} stories from your network:\n${storyLines.join('\n')}`;

    // Send to all users
    const tokens = allTokens.map((t) => t.expoPushToken).filter(Boolean);
    
    console.log(`[Briefing] Sending to ${tokens.length} devices`);
    
    const results = await sendPushToTokens(tokens, title, body, { type: 'morning_briefing' });
    
    console.log(`[Briefing] Complete. Results: ${JSON.stringify(results)}`);
  } catch (error) {
    console.error('[Briefing] Error:', error);
    throw error;
  }
}

