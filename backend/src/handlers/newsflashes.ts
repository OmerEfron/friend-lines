import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, scanTable, queryItems, getItem, deleteItem } from '../utils/dynamo';
import { uploadFile } from '../utils/s3';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';
import { notifyFriendsOfNewsflash } from '../utils/newsflash-notify';

const NEWSFLASHES_TABLE =
  process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const BOOKMARKS_TABLE = process.env.BOOKMARKS_TABLE || 'friendlines-bookmarks';
const GROUPS_TABLE = process.env.GROUPS_TABLE || 'friendlines-groups';
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'friendlines-media-local';

const VALID_CATEGORIES = [
  'GENERAL',
  'LIFESTYLE',
  'ENTERTAINMENT',
  'SPORTS',
  'FOOD',
  'TRAVEL',
  'OPINION',
] as const;
type NewsCategory = (typeof VALID_CATEGORIES)[number];

const VALID_SEVERITIES = ['STANDARD', 'BREAKING', 'DEVELOPING'] as const;
type NewsSeverity = (typeof VALID_SEVERITIES)[number];
type NewsflashAudience = 'ALL_FRIENDS' | 'GROUPS';
const BREAKING_COOLDOWN_MS = 24 * 60 * 60 * 1000;

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  category?: NewsCategory;
  severity?: NewsSeverity;
  audience?: NewsflashAudience;
  groupIds?: string[];
  recipientUserIds?: string[];
  timestamp: string;
}

interface Bookmark {
  userId: string;
  newsflashId: string;
}

interface Group {
  id: string;
  userIds: string[];
  createdBy: string;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET' && path === '/newsflashes') {
      return await withAuth(handleListMyNewsflashes)(event);
    }

    // POST /newsflashes - Create new newsflash
    if (method === 'POST' && path === '/newsflashes') {
      return await withAuth(handleCreateNewsflash)(event);
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

async function handleListMyNewsflashes(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const viewerId = event.userId!;
  const requestedUserId = event.queryStringParameters?.userId;
  if (requestedUserId && requestedUserId !== viewerId) {
    return errorResponse('Access denied', 403);
  }

  const newsflashes = (await queryItems(
    NEWSFLASHES_TABLE,
    'userId-timestamp-index',
    'userId = :userId',
    { ':userId': viewerId }
  )) as Newsflash[];
  newsflashes.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return successResponse({ newsflashes });
}

async function handleCreateNewsflash(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const userId = event.userId!;
  const {
    headline,
    subHeadline,
    mediaBase64,
    media,
    category,
    severity,
    audience,
    groupIds,
  } = body;

  if (!headline) {
    return errorResponse('headline is required', 400);
  }

  const validCategory: NewsCategory =
    category && VALID_CATEGORIES.includes(category) ? category : 'GENERAL';

  const validSeverity: NewsSeverity =
    severity && VALID_SEVERITIES.includes(severity) ? severity : 'STANDARD';

  const validAudience: NewsflashAudience =
    audience === 'GROUPS' ? 'GROUPS' : 'ALL_FRIENDS';

  if (validSeverity === 'BREAKING') {
    const rateLimitResult = await checkBreakingRateLimit(userId);
    if (!rateLimitResult.allowed) {
      return errorResponse(
        `Hold the presses! You've already filed BREAKING news today. Save the drama for tomorrow.`,
        429
      );
    }
  }

  let resolvedGroupIds: string[] | undefined;
  let recipientUserIds: string[] | undefined;

  if (validAudience === 'GROUPS') {
    if (!Array.isArray(groupIds) || groupIds.length === 0) {
      return errorResponse('groupIds must be a non-empty array when audience=GROUPS', 400);
    }
    resolvedGroupIds = Array.from(new Set(groupIds.filter(Boolean)));
    try {
      recipientUserIds = await resolveRecipientsForGroups(userId, resolvedGroupIds);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Invalid groups';
      if (msg.includes('Access denied')) return errorResponse(msg, 403);
      if (msg.includes('not found')) return errorResponse(msg, 404);
      return errorResponse(msg, 400);
    }
  }

  let mediaUrl: string | undefined;
  if (media) {
    mediaUrl = media;
  } else if (mediaBase64) {
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
    headline: String(headline).trim(),
    subHeadline: subHeadline ? String(subHeadline).trim() : undefined,
    media: mediaUrl,
    category: validCategory,
    severity: validSeverity,
    audience: validAudience,
    groupIds: resolvedGroupIds,
    recipientUserIds,
    timestamp: new Date().toISOString(),
  };

  await putItem(NEWSFLASHES_TABLE, newsflash);

  console.log(`[Newsflash] Created newsflash ${newsflash.id} (audience=${validAudience}), triggering push notifications`);

  try {
    await notifyFriendsOfNewsflash(
      userId,
      newsflash.headline,
      validSeverity,
      recipientUserIds
    );
    console.log(`[Newsflash] Push notification completed for newsflash ${newsflash.id}`);
  } catch (err) {
    console.error('[Newsflash] Failed to notify friends:', err);
    console.error(
      '[Newsflash] Error stack:',
      err instanceof Error ? err.stack : 'No stack trace'
    );
  }

  return successResponse({ newsflash }, 201);
}

async function resolveRecipientsForGroups(
  creatorId: string,
  groupIds: string[]
): Promise<string[]> {
  const groups = (await Promise.all(
    groupIds.map((id) => getItem(GROUPS_TABLE, { id }))
  )) as Array<Group | undefined>;

  const recipients = new Set<string>();
  for (let i = 0; i < groupIds.length; i++) {
    const groupId = groupIds[i];
    const group = groups[i];
    if (!group) {
      throw new Error(`Group ${groupId} not found`);
    }
    if (group.createdBy !== creatorId) {
      throw new Error(`Access denied to group ${groupId}`);
    }
    for (const uid of group.userIds || []) {
      if (uid && uid !== creatorId) recipients.add(uid);
    }
  }

  return Array.from(recipients);
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

async function checkBreakingRateLimit(userId: string): Promise<{ allowed: boolean }> {
  const userNewsflashes = await queryItems(
    NEWSFLASHES_TABLE,
    'userId-timestamp-index',
    'userId = :userId',
    { ':userId': userId }
  ) as Newsflash[];

  const cutoff = Date.now() - BREAKING_COOLDOWN_MS;
  const recentBreaking = userNewsflashes.find(
    (n) => n.severity === 'BREAKING' && new Date(n.timestamp).getTime() > cutoff
  );

  return { allowed: !recentBreaking };
}