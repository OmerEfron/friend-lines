import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, scanTable, queryItems, getItem, deleteItem } from '../utils/dynamo';
import { uploadFile } from '../utils/s3';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';
import { sendPushToTokens } from '../utils/push';

const NEWSFLASHES_TABLE =
  process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const BOOKMARKS_TABLE = process.env.BOOKMARKS_TABLE || 'friendlines-bookmarks';
const FRIENDSHIPS_TABLE =
  process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';
const DEVICE_TOKENS_TABLE =
  process.env.DEVICE_TOKENS_TABLE || 'friendlines-device-tokens';
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'friendlines-media-local';

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  timestamp: string;
}

interface Bookmark {
  userId: string;
  newsflashId: string;
}

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

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /newsflashes - List all newsflashes (optionally by userId)
    if (method === 'GET' && path === '/newsflashes') {
      const userId = event.queryStringParameters?.userId;

      let newsflashes;
      if (userId) {
        newsflashes = await queryItems(
          NEWSFLASHES_TABLE,
          'userId-timestamp-index',
          'userId = :userId',
          { ':userId': userId }
        );
      } else {
        newsflashes = await scanTable(NEWSFLASHES_TABLE);
      }

      // Sort by timestamp descending
      newsflashes.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return successResponse({ newsflashes });
    }

    // POST /newsflashes - Create new newsflash
    if (method === 'POST' && path === '/newsflashes') {
      if (!event.body) {
        return errorResponse('Request body is required', 400);
      }

      const body = JSON.parse(event.body);
      const { userId, headline, subHeadline, mediaBase64, media } = body;

      if (!userId || !headline) {
        return errorResponse('userId and headline are required', 400);
      }

      let mediaUrl: string | undefined;

      // Handle media: use provided URL or upload base64
      if (media) {
        // Use pre-uploaded media URL (from presigned URL upload)
        mediaUrl = media;
      } else if (mediaBase64) {
        // Legacy: upload base64 encoded image
        const mediaId = uuidv4();
        const buffer = Buffer.from(mediaBase64, 'base64');
        mediaUrl = await uploadFile(
          MEDIA_BUCKET,
          `media/${mediaId}.jpg`,
          buffer,
          'image/jpeg'
        );
      }

      const newsflash: Newsflash = {
        id: uuidv4(),
        userId,
        headline,
        subHeadline: subHeadline || undefined,
        media: mediaUrl,
        timestamp: new Date().toISOString(),
      };

      await putItem(NEWSFLASHES_TABLE, newsflash);

      // Send push notifications to friends
      // We must await this - using setImmediate/callbackWaitsForEmptyEventLoop=false
      // causes Lambda to freeze/terminate before the fetch completes
      console.log(`[Newsflash] Created newsflash ${newsflash.id}, triggering push notifications`);
      
      try {
        await notifyFriendsOfNewsflash(userId, headline);
        console.log(`[Newsflash] Push notification completed for newsflash ${newsflash.id}`);
      } catch (err) {
        // Don't fail the request if push notification fails
        console.error('[Newsflash] Failed to notify friends:', err);
        console.error('[Newsflash] Error stack:', err instanceof Error ? err.stack : 'No stack trace');
      }

      return successResponse({ newsflash }, 201);
    }

    // DELETE /newsflashes/{id} - Delete a newsflash (Protected)
    if (
      method === 'DELETE' &&
      path.startsWith('/newsflashes/') &&
      (event as AuthenticatedEvent).pathParameters?.id
    ) {
      return await withAuth(handleDeleteNewsflash)(event as AuthenticatedEvent);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

// Delete a newsflash (only owner can delete)
async function handleDeleteNewsflash(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const { id } = event.pathParameters!;
  const userId = event.userId!;

  // Get the newsflash
  const newsflash = (await getItem(NEWSFLASHES_TABLE, { id })) as
    | Newsflash
    | undefined;

  if (!newsflash) {
    return errorResponse('Newsflash not found', 404);
  }

  // Only owner can delete
  if (newsflash.userId !== userId) {
    return errorResponse('You can only delete your own newsflashes', 403);
  }

  // Cascade: Delete all bookmarks referencing this newsflash
  const allBookmarks = (await scanTable(BOOKMARKS_TABLE)) as Bookmark[];
  for (const b of allBookmarks) {
    if (b.newsflashId === id) {
      await deleteItem(BOOKMARKS_TABLE, {
        userId: b.userId,
        newsflashId: b.newsflashId,
      });
    }
  }

  // Delete the newsflash
  await deleteItem(NEWSFLASHES_TABLE, { id });

  return successResponse({ message: 'Newsflash deleted' });
}

/**
 * Send push notifications to friends when a newsflash is created
 */
async function notifyFriendsOfNewsflash(
  userId: string,
  headline: string
): Promise<void> {
  try {
    console.log(`[Push] Starting notification for user ${userId}`);
    
    // Query friendships by userId (primary key) - much faster than scan
    const queryStart = Date.now();
    const friendships = (await queryItems(
      FRIENDSHIPS_TABLE,
      undefined, // Use primary key, not GSI
      'userId = :userId',
      { ':userId': userId }
    )) as Friendship[];
    
    const friendIds = friendships
      .filter((f) => f.status === 'accepted')
      .map((f) => f.friendId);
    
    console.log(`[Push] Found ${friendIds.length} friends in ${Date.now() - queryStart}ms`);
  
    if (friendIds.length === 0) {
      return;
    }

    // Get user's name for notification
    const user = (await getItem(USERS_TABLE, { id: userId })) as User | undefined;
    const userName = user?.name || 'Someone';

    // Query device tokens for each friend in parallel
    const tokenStart = Date.now();
    const tokenQueries = friendIds.map((friendId) =>
      queryItems(
        DEVICE_TOKENS_TABLE,
        undefined,
        'userId = :userId',
        { ':userId': friendId }
      )
    );
    const tokenResults = await Promise.all(tokenQueries);
    
    const friendTokens = tokenResults
      .flat()
      .map((t) => (t as DeviceToken).expoPushToken)
      .filter(Boolean);
    
    console.log(`[Push] Found ${friendTokens.length} tokens in ${Date.now() - tokenStart}ms`);

    if (friendTokens.length === 0) {
      return;
    }

    // Send notification
    const sendStart = Date.now();
    const results = await sendPushToTokens(
      friendTokens,
      `Newsflash From ${userName}`,
      headline,
      { type: 'newsflash', userId }
    );
    console.log(`[Push] Sent in ${Date.now() - sendStart}ms. Results: ${JSON.stringify(results)}`);
  } catch (error) {
    console.error(`[Push] Error:`, error);
    throw error;
  }
}

