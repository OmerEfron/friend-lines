import { APIGatewayProxyResult } from 'aws-lambda';
import { scanTable, getItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const NEWSFLASHES_TABLE = process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const FRIENDSHIPS_TABLE = process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const GROUPS_TABLE = process.env.GROUPS_TABLE || 'friendlines-groups';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Feeds Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;
      const queryParams = authenticatedEvent.queryStringParameters || {};

      // Parse pagination params
      const limit = Math.min(
        parseInt(queryParams.limit || String(DEFAULT_LIMIT), 10),
        MAX_LIMIT
      );
      const cursor = queryParams.cursor;

      // GET /feeds/main - Get main feed (friends' newsflashes)
      if (method === 'GET' && path === '/feeds/main') {
        return await handleMainFeed(userId, limit, cursor);
      }

      // GET /feeds/group/{groupId} - Get group feed
      if (
        method === 'GET' &&
        path.match(/^\/feeds\/group\/[^/]+$/) &&
        authenticatedEvent.pathParameters?.groupId
      ) {
        return await handleGroupFeed(
          authenticatedEvent.pathParameters.groupId,
          userId,
          limit,
          cursor
        );
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  })(event);
}

// Get main feed (friends' newsflashes)
async function handleMainFeed(
  userId: string,
  limit: number,
  cursor?: string
): Promise<APIGatewayProxyResult> {
  // Get user's friends
  const allFriendships = await scanTable(FRIENDSHIPS_TABLE);
  const friendships = allFriendships.filter(
    (f: any) => f.userId === userId
  );
  const friendIds = friendships.map((f: any) => f.friendId);

  // Include user's own newsflashes
  const relevantUserIds = [userId, ...friendIds];

  // Get all newsflashes
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  
  // Filter and sort newsflashes from relevant users
  const feedNewsflashes = allNewsflashes
    .filter((n) => relevantUserIds.includes(n.userId))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Apply cursor-based pagination (cursor = last item timestamp)
  let startIndex = 0;
  if (cursor) {
    const cursorTimestamp = Buffer.from(cursor, 'base64').toString();
    startIndex = feedNewsflashes.findIndex(
      (n) => n.timestamp <= cursorTimestamp
    );
    if (startIndex === -1) startIndex = feedNewsflashes.length;
  }

  const paginatedNewsflashes = feedNewsflashes.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < feedNewsflashes.length;
  const nextCursor = hasMore && paginatedNewsflashes.length > 0
    ? Buffer.from(paginatedNewsflashes[paginatedNewsflashes.length - 1].timestamp).toString('base64')
    : undefined;

  // Enrich newsflashes with user data
  const usersMap = new Map<string, User>();
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  allUsers.forEach((u) => usersMap.set(u.id, u));

  const enrichedNewsflashes = paginatedNewsflashes.map((newsflash) => ({
    ...newsflash,
    user: usersMap.get(newsflash.userId),
  }));

  return successResponse({ 
    newsflashes: enrichedNewsflashes,
    nextCursor,
    hasMore,
  });
}

// Get group feed (only for creator)
async function handleGroupFeed(
  groupId: string,
  userId: string,
  limit: number,
  cursor?: string
): Promise<APIGatewayProxyResult> {
  // Get group
  const group = (await getItem(GROUPS_TABLE, { id: groupId })) as
    | Group
    | undefined;

  if (!group) {
    return errorResponse('Group not found', 404);
  }

  // Check if user is the creator (groups are personal)
  if (group.createdBy !== userId) {
    return errorResponse('Access denied', 403);
  }

  // Get all newsflashes
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  
  // Filter and sort newsflashes from group members
  const feedNewsflashes = allNewsflashes
    .filter((n) => group.userIds.includes(n.userId))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Apply cursor-based pagination
  let startIndex = 0;
  if (cursor) {
    const cursorTimestamp = Buffer.from(cursor, 'base64').toString();
    startIndex = feedNewsflashes.findIndex(
      (n) => n.timestamp <= cursorTimestamp
    );
    if (startIndex === -1) startIndex = feedNewsflashes.length;
  }

  const paginatedNewsflashes = feedNewsflashes.slice(startIndex, startIndex + limit);
  const hasMore = startIndex + limit < feedNewsflashes.length;
  const nextCursor = hasMore && paginatedNewsflashes.length > 0
    ? Buffer.from(paginatedNewsflashes[paginatedNewsflashes.length - 1].timestamp).toString('base64')
    : undefined;

  // Enrich newsflashes with user data
  const usersMap = new Map<string, User>();
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  allUsers.forEach((u) => usersMap.set(u.id, u));

  const enrichedNewsflashes = paginatedNewsflashes.map((newsflash) => ({
    ...newsflash,
    user: usersMap.get(newsflash.userId),
  }));

  return successResponse({ 
    group,
    newsflashes: enrichedNewsflashes,
    nextCursor,
    hasMore,
  });
}

